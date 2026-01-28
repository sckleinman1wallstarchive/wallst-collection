-- Create authentication history table
CREATE TABLE public.item_authentication_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Item identification (optional link to inventory)
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  brand TEXT NOT NULL,
  item_name TEXT NOT NULL,
  size TEXT,
  
  -- AI analysis results
  ai_score INTEGER,
  ai_verdict TEXT,
  ai_reasoning JSONB,
  ai_analyzed_details JSONB,
  reference_sources JSONB,
  
  -- Manual verification
  manual_verdict TEXT,
  manual_notes TEXT,
  manually_verified_at TIMESTAMP WITH TIME ZONE,
  verified_by TEXT,
  verification_source TEXT,
  
  -- Images stored as URLs
  image_urls TEXT[]
);

-- Enable RLS
ALTER TABLE public.item_authentication_history ENABLE ROW LEVEL SECURITY;

-- RLS policies using is_allowed_user()
CREATE POLICY "Allowed users can read history" 
  ON public.item_authentication_history FOR SELECT USING (is_allowed_user());

CREATE POLICY "Allowed users can insert history" 
  ON public.item_authentication_history FOR INSERT WITH CHECK (is_allowed_user());

CREATE POLICY "Allowed users can update history" 
  ON public.item_authentication_history FOR UPDATE USING (is_allowed_user());

CREATE POLICY "Allowed users can delete history" 
  ON public.item_authentication_history FOR DELETE USING (is_allowed_user());

-- Add trigger for updated_at
CREATE TRIGGER update_item_authentication_history_updated_at
  BEFORE UPDATE ON public.item_authentication_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();