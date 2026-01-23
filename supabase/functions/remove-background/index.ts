import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackgroundOptions {
  type: 'transparent' | 'solid' | 'image';
  color?: string;        // Hex color for solid backgrounds
  imageUrl?: string;     // URL for image backgrounds
}

interface RemoveBackgroundRequest {
  imageUrls: string[];
  background?: BackgroundOptions;
}

function buildPrompt(background?: BackgroundOptions): string {
  if (!background || background.type === 'transparent') {
    return 'Remove the background from this image completely. Make the background fully transparent. Keep only the main subject/product with clean edges. Output a PNG with transparent background.';
  }
  
  if (background.type === 'solid' && background.color) {
    return `Remove the background from this image and replace it with a solid ${background.color} color background. Keep only the main subject/product with clean edges. The entire background should be exactly ${background.color} (hex color). Output the image with the new solid color background.`;
  }
  
  if (background.type === 'image') {
    return 'Remove the background from this image and replace it with the provided background image. Keep only the main subject/product with clean edges and composite it naturally onto the new background.';
  }
  
  return 'Remove the background from this image completely. Make the background fully transparent. Keep only the main subject/product with clean edges. Output a PNG with transparent background.';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageUrls, background }: RemoveBackgroundRequest = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'imageUrls array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = buildPrompt(background);

    // Process images in parallel (limit to 5 concurrent)
    const results: { originalUrl: string; processedUrl: string | null; error?: string }[] = [];
    const batchSize = 5;

    for (let i = 0; i < imageUrls.length; i += batchSize) {
      const batch = imageUrls.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (imageUrl) => {
          try {
            // Build content array based on background type
            const contentArray: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ];

            // If using image background, add the background image to the request
            if (background?.type === 'image' && background.imageUrl) {
              contentArray.push({
                type: 'image_url',
                image_url: {
                  url: background.imageUrl,
                },
              });
            }

            const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash-image-preview',
                messages: [
                  {
                    role: 'user',
                    content: contentArray,
                  },
                ],
                modalities: ['image', 'text'],
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('AI API error:', errorText);
              return {
                originalUrl: imageUrl,
                processedUrl: null,
                error: `AI processing failed: ${response.status}`,
              };
            }

            const data = await response.json();
            const processedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

            if (!processedImageUrl) {
              return {
                originalUrl: imageUrl,
                processedUrl: null,
                error: 'No processed image returned from AI',
              };
            }

            return {
              originalUrl: imageUrl,
              processedUrl: processedImageUrl,
            };
          } catch (error) {
            console.error('Error processing image:', imageUrl, error);
            return {
              originalUrl: imageUrl,
              processedUrl: null,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        })
      );

      results.push(...batchResults);
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in remove-background function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
