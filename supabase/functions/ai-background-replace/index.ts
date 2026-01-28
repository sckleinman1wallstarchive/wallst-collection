import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackgroundOptions {
  type: 'transparent' | 'solid';
  color?: string;
}

interface AIBackgroundRequest {
  imageUrls: string[];
  background?: BackgroundOptions;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageUrls, background }: AIBackgroundRequest = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'imageUrls array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: { originalUrl: string; processedUrl: string | null; error?: string }[] = [];

    // Build prompt based on background options
    let prompt: string;
    if (background?.type === 'solid' && background.color) {
      prompt = `Replace the background of this product photo with a solid ${background.color} color. Keep the product/subject exactly as-is with no modifications. The new background should be completely uniform and flat with the exact color ${background.color}.`;
    } else {
      prompt = `Remove the background from this product photo completely. Make the background fully transparent. Keep the product/subject exactly as-is with no modifications to its appearance, colors, or details.`;
    }

    for (const imageUrl of imageUrls) {
      try {
        console.log(`Processing image with Lovable AI:`, imageUrl.substring(0, 50) + '...');

        // Fetch the image and convert to base64 if it's a URL
        let imageData = imageUrl;
        if (imageUrl.startsWith('http')) {
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            results.push({
              originalUrl: imageUrl,
              processedUrl: null,
              error: 'Failed to fetch image',
            });
            continue;
          }
          const arrayBuffer = await imageResponse.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          const contentType = imageResponse.headers.get('content-type') || 'image/png';
          imageData = `data:${contentType};base64,${base64}`;
        }

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageData } }
              ]
            }],
            modalities: ["image", "text"]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Lovable AI error:', response.status, errorText);
          
          if (response.status === 429) {
            results.push({
              originalUrl: imageUrl,
              processedUrl: null,
              error: 'Rate limit exceeded. Please try again later.',
            });
          } else if (response.status === 402) {
            results.push({
              originalUrl: imageUrl,
              processedUrl: null,
              error: 'Insufficient credits. Please add credits to continue.',
            });
          } else {
            results.push({
              originalUrl: imageUrl,
              processedUrl: null,
              error: `AI gateway error: ${response.status}`,
            });
          }
          continue;
        }

        const data = await response.json();
        const processedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (processedImageUrl) {
          results.push({
            originalUrl: imageUrl,
            processedUrl: processedImageUrl,
          });
        } else {
          results.push({
            originalUrl: imageUrl,
            processedUrl: null,
            error: 'No image returned from AI',
          });
        }

      } catch (error) {
        console.error('Error processing image:', imageUrl, error);
        results.push({
          originalUrl: imageUrl,
          processedUrl: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.processedUrl).length;

    return new Response(
      JSON.stringify({
        results,
        processed: successCount,
        total: imageUrls.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-background-replace function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
