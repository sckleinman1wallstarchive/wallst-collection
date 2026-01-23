-- Create table for storing multiple remove.bg API keys
CREATE TABLE public.removebg_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL,
  api_key text NOT NULL,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.removebg_api_keys ENABLE ROW LEVEL SECURITY;

-- Only allowed users can manage API keys
CREATE POLICY "Allowed users can read removebg_api_keys"
ON public.removebg_api_keys FOR SELECT
USING (is_allowed_user());

CREATE POLICY "Allowed users can insert removebg_api_keys"
ON public.removebg_api_keys FOR INSERT
WITH CHECK (is_allowed_user());

CREATE POLICY "Allowed users can update removebg_api_keys"
ON public.removebg_api_keys FOR UPDATE
USING (is_allowed_user());

CREATE POLICY "Allowed users can delete removebg_api_keys"
ON public.removebg_api_keys FOR DELETE
USING (is_allowed_user());

-- Service role needs access for edge functions
CREATE POLICY "Service role can manage removebg_api_keys"
ON public.removebg_api_keys FOR ALL
USING (true)
WITH CHECK (true);

-- Add api_key_id to usage table to track per-key usage
ALTER TABLE public.removebg_usage 
ADD COLUMN api_key_id uuid REFERENCES public.removebg_api_keys(id) ON DELETE CASCADE;

-- Create trigger for updated_at
CREATE TRIGGER update_removebg_api_keys_updated_at
BEFORE UPDATE ON public.removebg_api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();