-- Make bucket private (images will require authentication)
UPDATE storage.buckets SET public = false WHERE id = 'inventory-images';

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Public read access for inventory images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for inventory images" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for inventory images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for inventory images" ON storage.objects;

-- Create restricted policies using is_allowed_user()
CREATE POLICY "Allowed users can read inventory images"
ON storage.objects FOR SELECT
USING (bucket_id = 'inventory-images' AND public.is_allowed_user());

CREATE POLICY "Allowed users can upload inventory images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'inventory-images' AND public.is_allowed_user());

CREATE POLICY "Allowed users can update inventory images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'inventory-images' AND public.is_allowed_user());

CREATE POLICY "Allowed users can delete inventory images"
ON storage.objects FOR DELETE
USING (bucket_id = 'inventory-images' AND public.is_allowed_user());