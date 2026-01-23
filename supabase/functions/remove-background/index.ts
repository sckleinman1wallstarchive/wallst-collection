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

interface ApiKeyWithUsage {
  id: string;
  key_name: string;
  api_key: string;
  priority: number;
  currentUsage: number;
}

function getCurrentMonthYear(): string {
  return new Date().toISOString().slice(0, 7); // "2025-01"
}

const LIMIT_PER_KEY = 50;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Get all active API keys ordered by priority
    const { data: apiKeys, error: keysError } = await supabase
      .from('removebg_api_keys')
      .select('id, key_name, api_key, priority')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (keysError) {
      console.error('Error fetching API keys:', keysError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch API keys' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKeys || apiKeys.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No API keys configured. Please add at least one remove.bg API key.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const monthYear = getCurrentMonthYear();

    // Get current usage for all keys this month
    const { data: usageData } = await supabase
      .from('removebg_usage')
      .select('api_key_id, count')
      .eq('month_year', monthYear);

    const usageByKey: Record<string, number> = {};
    if (usageData) {
      for (const u of usageData) {
        if (u.api_key_id) {
          usageByKey[u.api_key_id] = u.count || 0;
        }
      }
    }

    // Build keys with usage info
    const keysWithUsage: ApiKeyWithUsage[] = apiKeys.map(k => ({
      ...k,
      currentUsage: usageByKey[k.id] || 0
    }));

    // Calculate total remaining across all keys
    const totalRemaining = keysWithUsage.reduce((sum, k) => sum + Math.max(0, LIMIT_PER_KEY - k.currentUsage), 0);

    if (totalRemaining === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'All API keys have reached their monthly limit',
          usage: {
            totalUsed: keysWithUsage.reduce((sum, k) => sum + k.currentUsage, 0),
            totalLimit: keysWithUsage.length * LIMIT_PER_KEY,
            totalRemaining: 0
          }
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: { originalUrl: string; processedUrl: string | null; error?: string }[] = [];
    let skippedCount = 0;

    // Track usage increments per key during this request
    const usageIncrements: Record<string, number> = {};

    for (const imageUrl of imageUrls) {
      // Find a key with available credits
      let selectedKey: ApiKeyWithUsage | null = null;
      
      for (const key of keysWithUsage) {
        const currentUsage = key.currentUsage + (usageIncrements[key.id] || 0);
        if (currentUsage < LIMIT_PER_KEY) {
          selectedKey = key;
          break;
        }
      }

      if (!selectedKey) {
        // All keys exhausted
        results.push({
          originalUrl: imageUrl,
          processedUrl: null,
          error: 'All API keys exhausted'
        });
        skippedCount++;
        continue;
      }

      try {
        console.log(`Processing image with key "${selectedKey.key_name}":`, imageUrl.substring(0, 50) + '...');

        const formData = new FormData();
        formData.append('image_url', imageUrl);
        formData.append('size', 'auto');
        formData.append('format', 'png');

        // Handle background options
        if (background?.type === 'solid' && background.color) {
          formData.append('bg_color', background.color.replace('#', ''));
        }

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': selectedKey.api_key,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('remove.bg API error:', response.status, errorData);
          
          if (response.status === 403) {
            results.push({
              originalUrl: imageUrl,
              processedUrl: null,
              error: `API key "${selectedKey.key_name}" is invalid`
            });
          } else {
            results.push({
              originalUrl: imageUrl,
              processedUrl: null,
              error: errorData.errors?.[0]?.title || `API error: ${response.status}`,
            });
          }
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

        // Track this usage
        usageIncrements[selectedKey.id] = (usageIncrements[selectedKey.id] || 0) + 1;

      } catch (error) {
        console.error('Error processing image:', imageUrl, error);
        results.push({
          originalUrl: imageUrl,
          processedUrl: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Update usage counts in database for each key
    for (const [keyId, increment] of Object.entries(usageIncrements)) {
      const existingUsage = usageByKey[keyId] || 0;
      const newCount = existingUsage + increment;

      await supabase
        .from('removebg_usage')
        .upsert(
          { 
            api_key_id: keyId, 
            month_year: monthYear, 
            count: newCount, 
            updated_at: new Date().toISOString() 
          },
          { onConflict: 'api_key_id,month_year' }
        );
    }

    // Calculate updated totals
    const totalUsed = keysWithUsage.reduce((sum, k) => sum + k.currentUsage + (usageIncrements[k.id] || 0), 0);
    const totalLimit = keysWithUsage.length * LIMIT_PER_KEY;

    return new Response(
      JSON.stringify({
        results,
        usage: {
          totalUsed,
          totalLimit,
          totalRemaining: totalLimit - totalUsed,
        },
        skipped: skippedCount > 0 ? `${skippedCount} images skipped (keys exhausted)` : undefined,
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
