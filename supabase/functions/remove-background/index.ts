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
  return new Date().toISOString().slice(0, 7);
}

const LIMIT_PER_KEY = 50;

async function processImageWithRetry(
  imageUrl: string,
  keysWithUsage: ApiKeyWithUsage[],
  background: BackgroundOptions | undefined,
  failedKeyIds: Set<string>,
  usageIncrements: Record<string, number>
): Promise<{ originalUrl: string; processedUrl: string | null; error?: string; usedKeyId?: string }> {
  
  // Try each key in priority order, skipping failed ones
  for (const selectedKey of keysWithUsage) {
    // Skip keys that have already failed in this request batch
    if (failedKeyIds.has(selectedKey.id)) {
      continue;
    }
    
    // Skip keys that appear exhausted based on local tracking
    const estimatedUsage = selectedKey.currentUsage + (usageIncrements[selectedKey.id] || 0);
    if (estimatedUsage >= LIMIT_PER_KEY) {
      continue;
    }

    try {
      console.log(`Trying key "${selectedKey.key_name}" for image:`, imageUrl.substring(0, 50) + '...');

      const formData = new FormData();
      formData.append('image_url', imageUrl);
      formData.append('size', 'auto');
      formData.append('format', 'png');

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

      // Handle exhausted or invalid keys - try next key
      if (response.status === 402) {
        console.log(`Key "${selectedKey.key_name}" exhausted (402), trying next key...`);
        failedKeyIds.add(selectedKey.id);
        continue; // Try next key
      }

      if (response.status === 403) {
        console.log(`Key "${selectedKey.key_name}" invalid (403), trying next key...`);
        failedKeyIds.add(selectedKey.id);
        continue; // Try next key
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('remove.bg API error:', response.status, errorData);
        return {
          originalUrl: imageUrl,
          processedUrl: null,
          error: errorData.errors?.[0]?.title || `API error: ${response.status}`,
        };
      }

      // Success! Convert to base64
      const imageBuffer = await response.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      const dataUrl = `data:image/png;base64,${base64}`;

      console.log(`Successfully processed with key "${selectedKey.key_name}"`);
      
      return {
        originalUrl: imageUrl,
        processedUrl: dataUrl,
        usedKeyId: selectedKey.id,
      };

    } catch (error) {
      console.error(`Error with key "${selectedKey.key_name}":`, error);
      // Don't mark as failed for network errors - might be temporary
      return {
        originalUrl: imageUrl,
        processedUrl: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // All keys exhausted
  return {
    originalUrl: imageUrl,
    processedUrl: null,
    error: 'All API keys exhausted - no credits remaining',
  };
}

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

    // Track keys that have failed (402/403) during this entire request
    const failedKeyIds: Set<string> = new Set();
    
    // Track usage increments per key during this request
    const usageIncrements: Record<string, number> = {};

    const results: { originalUrl: string; processedUrl: string | null; error?: string }[] = [];

    // Process each image with automatic key rotation
    for (const imageUrl of imageUrls) {
      const result = await processImageWithRetry(
        imageUrl,
        keysWithUsage,
        background,
        failedKeyIds,
        usageIncrements
      );
      
      results.push({
        originalUrl: result.originalUrl,
        processedUrl: result.processedUrl,
        error: result.error,
      });

      // Track usage for successful processing
      if (result.usedKeyId) {
        usageIncrements[result.usedKeyId] = (usageIncrements[result.usedKeyId] || 0) + 1;
      }
    }

    // Update usage counts in database for each key that was used
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
    const successCount = results.filter(r => r.processedUrl).length;
    const failedCount = results.filter(r => !r.processedUrl).length;

    return new Response(
      JSON.stringify({
        results,
        usage: {
          totalUsed,
          totalLimit,
          totalRemaining: totalLimit - totalUsed,
        },
        summary: {
          processed: successCount,
          failed: failedCount,
          keysExhausted: failedKeyIds.size,
        }
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
