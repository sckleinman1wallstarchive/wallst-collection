
-- Create posting_tracker table
CREATE TABLE public.posting_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_name TEXT NOT NULL,
  artwork_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.posting_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allowed users can read posting_tracker" ON public.posting_tracker FOR SELECT USING (is_allowed_user());
CREATE POLICY "Allowed users can insert posting_tracker" ON public.posting_tracker FOR INSERT WITH CHECK (is_allowed_user());
CREATE POLICY "Allowed users can update posting_tracker" ON public.posting_tracker FOR UPDATE USING (is_allowed_user());
CREATE POLICY "Allowed users can delete posting_tracker" ON public.posting_tracker FOR DELETE USING (is_allowed_user());

-- Create posting_tracker_items table
CREATE TABLE public.posting_tracker_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracker_id UUID NOT NULL REFERENCES public.posting_tracker(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tracker_id, inventory_item_id)
);

ALTER TABLE public.posting_tracker_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allowed users can read posting_tracker_items" ON public.posting_tracker_items FOR SELECT USING (is_allowed_user());
CREATE POLICY "Allowed users can insert posting_tracker_items" ON public.posting_tracker_items FOR INSERT WITH CHECK (is_allowed_user());
CREATE POLICY "Allowed users can update posting_tracker_items" ON public.posting_tracker_items FOR UPDATE USING (is_allowed_user());
CREATE POLICY "Allowed users can delete posting_tracker_items" ON public.posting_tracker_items FOR DELETE USING (is_allowed_user());
