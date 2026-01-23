import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getCurrentMonthYear(): string {
  return new Date().toISOString().slice(0, 7); // "2025-01"
}

function getResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    const limit = 50;

    const { data: usageData } = await supabase
      .from('removebg_usage')
      .select('count, updated_at')
      .eq('month_year', monthYear)
      .single();

    const used = usageData?.count || 0;
    const remaining = Math.max(0, limit - used);

    // Determine warning level
    let warning: 'approaching_limit' | 'near_limit' | 'at_limit' | null = null;
    if (used >= limit) {
      warning = 'at_limit';
    } else if (used >= 45) {
      warning = 'near_limit';
    } else if (used >= 40) {
      warning = 'approaching_limit';
    }

    return new Response(
      JSON.stringify({
        used,
        limit,
        remaining,
        monthYear,
        resetDate: getResetDate(),
        warning,
        lastUpdated: usageData?.updated_at || null,
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
