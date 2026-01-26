-- Create collection_photos table for manually uploaded lifestyle/collection photos
CREATE TABLE public.collection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collection_photos ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view collection photos"
  ON public.collection_photos FOR SELECT
  USING (true);

-- Allowed users can manage (insert, update, delete)
CREATE POLICY "Allowed users can insert collection photos"
  ON public.collection_photos FOR INSERT
  WITH CHECK (is_allowed_user());

CREATE POLICY "Allowed users can update collection photos"
  ON public.collection_photos FOR UPDATE
  USING (is_allowed_user());

CREATE POLICY "Allowed users can delete collection photos"
  ON public.collection_photos FOR DELETE
  USING (is_allowed_user());