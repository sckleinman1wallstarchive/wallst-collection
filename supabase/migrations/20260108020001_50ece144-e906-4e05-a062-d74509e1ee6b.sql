-- Add new status enum values
ALTER TYPE item_status ADD VALUE IF NOT EXISTS 'in-closet-parker';
ALTER TYPE item_status ADD VALUE IF NOT EXISTS 'in-closet-spencer';
ALTER TYPE item_status ADD VALUE IF NOT EXISTS 'otw';

-- Add image_url column to inventory_items
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for inventory images
INSERT INTO storage.buckets (id, name, public)
VALUES ('inventory-images', 'inventory-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to inventory images
CREATE POLICY "Public read access for inventory images"
ON storage.objects FOR SELECT
USING (bucket_id = 'inventory-images');

-- Allow public upload to inventory images
CREATE POLICY "Public upload access for inventory images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'inventory-images');

-- Allow public update to inventory images
CREATE POLICY "Public update access for inventory images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'inventory-images');

-- Allow public delete for inventory images
CREATE POLICY "Public delete access for inventory images"
ON storage.objects FOR DELETE
USING (bucket_id = 'inventory-images');