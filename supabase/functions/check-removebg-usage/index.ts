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

interface RemoveBgAccountResponse {
  data?: {
    attributes?: {
      credits?: {
        total?: number;
        subscription?: number;
        payg?: number;
        enterprise?: number;
      };
      api?: {
        free_calls?: number;
      };
    };
  };
}

async function fetchRealBalance(apiKey: string): Promise<{ used: number; limit: number } | null> {
  try {
    const response = await fetch('https://api.remove.bg/v1.0/account', {
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      console.log(`Failed to fetch balance for key: ${response.status}`);
      return null;
    }

    const data: RemoveBgAccountResponse = await response.json();
    const freeCalls = data?.data?.attributes?.api?.free_calls ?? 0;
    
    // Free accounts get 50 free calls per month
    // The API returns remaining free calls, so used = 50 - remaining
    const limit = 50;
    const used = Math.max(0, limit - freeCalls);
    
    return { used, limit };
  } catch (error) {
    console.error('Error fetching remove.bg balance:', error);
    return null;
  }
}

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
      .select('id, key_name, api_key, priority, is_active')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (keysError) {
      console.error('Error fetching API keys:', keysError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch API keys' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch real balances from remove.bg API for each key
    const keys = await Promise.all((apiKeys || []).map(async (k) => {
      const realBalance = await fetchRealBalance(k.api_key);
      
      if (realBalance) {
        // Update our local tracking to match real balance
        await supabase
          .from('removebg_usage')
          .upsert(
            { 
              api_key_id: k.id, 
              month_year: monthYear, 
              count: realBalance.used, 
              updated_at: new Date().toISOString() 
            },
            { onConflict: 'api_key_id,month_year' }
          );

        return {
          id: k.id,
          name: k.key_name,
          used: realBalance.used,
          limit: realBalance.limit,
          remaining: Math.max(0, realBalance.limit - realBalance.used),
          exhausted: realBalance.used >= realBalance.limit
        };
      }
      
      // Fallback to local tracking if API call fails
      const { data: usageData } = await supabase
        .from('removebg_usage')
        .select('count')
        .eq('api_key_id', k.id)
        .eq('month_year', monthYear)
        .single();
      
      const used = usageData?.count || 0;
      const limit = 50;
      
      return {
        id: k.id,
        name: k.key_name,
        used,
        limit,
        remaining: Math.max(0, limit - used),
        exhausted: used >= limit
      };
    }));

    // Calculate totals
    const totalUsed = keys.reduce((sum, k) => sum + k.used, 0);
    const totalLimit = keys.reduce((sum, k) => sum + k.limit, 0);
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
