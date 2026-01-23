import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getCurrentMonthYear(): string {
  return new Date().toISOString().slice(0, 7);
}

function getResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

    const monthYear = getCurrentMonthYear();

    // Get all active API keys
    const { data: apiKeys, error: keysError } = await supabase
      .from('removebg_api_keys')
      .select('id, key_name, priority, is_active')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (keysError) {
      console.error('Error fetching API keys:', keysError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch API keys' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get usage for all keys this month
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

    // Build per-key stats
    const keys = (apiKeys || []).map(k => ({
      id: k.id,
      name: k.key_name,
      used: usageByKey[k.id] || 0,
      limit: LIMIT_PER_KEY,
      remaining: Math.max(0, LIMIT_PER_KEY - (usageByKey[k.id] || 0)),
      exhausted: (usageByKey[k.id] || 0) >= LIMIT_PER_KEY
    }));

    // Calculate totals
    const totalUsed = keys.reduce((sum, k) => sum + k.used, 0);
    const totalLimit = keys.length * LIMIT_PER_KEY;
    const totalRemaining = totalLimit - totalUsed;

    // Find active key (first non-exhausted)
    const activeKey = keys.find(k => !k.exhausted)?.name || null;

    // Determine warning level based on total remaining
    let warning: 'approaching_limit' | 'near_limit' | 'at_limit' | null = null;
    if (totalRemaining === 0) {
      warning = 'at_limit';
    } else if (totalRemaining <= 5) {
      warning = 'near_limit';
    } else if (totalRemaining <= 10) {
      warning = 'approaching_limit';
    }

    return new Response(
      JSON.stringify({
        totalUsed,
        totalLimit,
        totalRemaining,
        keys,
        activeKey,
        keyCount: keys.length,
        monthYear,
        resetDate: getResetDate(),
        warning
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking usage:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
