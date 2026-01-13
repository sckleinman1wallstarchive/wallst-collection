-- Make the inventory-images bucket public so images display correctly
UPDATE storage.buckets 
SET public = true 
WHERE id = 'inventory-images';

-- Add column for multiple images
ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';