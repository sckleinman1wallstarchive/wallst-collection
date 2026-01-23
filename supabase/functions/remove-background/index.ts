import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackgroundOptions {
  type: 'transparent' | 'solid';
  color?: string;
}

interface RemoveBackgroundRequest {
  imageUrls: string[];
  background?: BackgroundOptions;
}

function getCurrentMonthYear(): string {
  return new Date().toISOString().slice(0, 7); // "2025-01"
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REMOVE_BG_API_KEY = Deno.env.get('REMOVE_BG_API_KEY');
    if (!REMOVE_BG_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'REMOVE_BG_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { imageUrls, background }: RemoveBackgroundRequest = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'imageUrls array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check current usage
    const monthYear = getCurrentMonthYear();
    const { data: usageData } = await supabase
      .from('removebg_usage')
      .select('count')
      .eq('month_year', monthYear)
      .single();

    const currentUsage = usageData?.count || 0;
    const limit = 50;
    const remaining = limit - currentUsage;

    if (remaining <= 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Monthly limit reached',
          usage: { used: currentUsage, limit, remaining: 0 }
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit processing to remaining credits
    const urlsToProcess = imageUrls.slice(0, remaining);
    const skippedCount = imageUrls.length - urlsToProcess.length;

    const results: { originalUrl: string; processedUrl: string | null; error?: string }[] = [];

    // Process images sequentially to respect rate limits
    for (const imageUrl of urlsToProcess) {
      try {
        const formData = new FormData();
        formData.append('image_url', imageUrl);
        formData.append('size', 'auto');
        formData.append('format', 'png');

        // Handle background options
        if (background?.type === 'solid' && background.color) {
          // Remove # from hex color
          formData.append('bg_color', background.color.replace('#', ''));
        }
        // For transparent, we don't add bg_color (default behavior)

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': REMOVE_BG_API_KEY,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('remove.bg API error:', response.status, errorData);
          results.push({
            originalUrl: imageUrl,
            processedUrl: null,
            error: errorData.errors?.[0]?.title || `API error: ${response.status}`,
          });
          continue;
        }

        // Get the image as base64
        const imageBuffer = await response.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        const dataUrl = `data:image/png;base64,${base64}`;

        results.push({
          originalUrl: imageUrl,
          processedUrl: dataUrl,
        });

      } catch (error) {
        console.error('Error processing image:', imageUrl, error);
        results.push({
          originalUrl: imageUrl,
          processedUrl: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Update final usage count
    const successCount = results.filter(r => r.processedUrl).length;
    const newUsage = currentUsage + successCount;

    await supabase
      .from('removebg_usage')
      .upsert(
        { month_year: monthYear, count: newUsage, updated_at: new Date().toISOString() },
        { onConflict: 'month_year' }
      );

    return new Response(
      JSON.stringify({ 
        results,
        usage: {
          used: newUsage,
          limit,
          remaining: limit - newUsage,
        },
        skipped: skippedCount > 0 ? `${skippedCount} images skipped due to limit` : undefined,
      }),
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
