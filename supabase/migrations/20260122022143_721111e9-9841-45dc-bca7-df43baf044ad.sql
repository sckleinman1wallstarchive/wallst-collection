-- Create closet display type enum
DO $$ BEGIN
  CREATE TYPE closet_display_type AS ENUM ('nfs', 'dm');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add closet_display column to inventory_items
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS closet_display closet_display_type DEFAULT 'nfs';

-- Drop existing public policy
DROP POLICY IF EXISTS "Public can view listed items" ON inventory_items;

-- Create new policy for storefront items (for-sale + closet items)
CREATE POLICY "Public can view storefront items" 
ON public.inventory_items FOR SELECT 
USING (status IN ('for-sale', 'in-closet-parker', 'in-closet-spencer', 'listed'));