-- Update the RLS policy to include 'sold' status for public viewing
DROP POLICY IF EXISTS "Public can view storefront items" ON public.inventory_items;

CREATE POLICY "Public can view storefront items" ON public.inventory_items
  FOR SELECT
  USING (status = ANY (ARRAY[
    'for-sale'::item_status, 
    'in-closet-parker'::item_status, 
    'in-closet-spencer'::item_status, 
    'listed'::item_status,
    'sold'::item_status
  ]));