-- Create usage tracking table for remove.bg API
CREATE TABLE public.removebg_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year text NOT NULL UNIQUE,
  count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.removebg_usage ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read usage
CREATE POLICY "Allowed users can read removebg_usage" 
ON public.removebg_usage 
FOR SELECT 
USING (is_allowed_user());

-- Allow service role to manage (edge functions use service role)
CREATE POLICY "Service role can manage removebg_usage"
ON public.removebg_usage
FOR ALL
USING (true)
WITH CHECK (true);