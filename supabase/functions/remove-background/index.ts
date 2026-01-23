import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RemoveBackgroundRequest {
  imageUrls: string[];
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

    const { imageUrls }: RemoveBackgroundRequest = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'imageUrls array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process images in parallel (limit to 5 concurrent)
    const results: { originalUrl: string; processedUrl: string | null; error?: string }[] = [];
    const batchSize = 5;

    for (let i = 0; i < imageUrls.length; i += batchSize) {
      const batch = imageUrls.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (imageUrl) => {
          try {
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
                    content: [
                      {
                        type: 'text',
                        text: 'Remove the background from this image completely. Make the background fully transparent. Keep only the main subject/product with clean edges. Output a PNG with transparent background.',
                      },
                      {
                        type: 'image_url',
                        image_url: {
                          url: imageUrl,
                        },
                      },
                    ],
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
