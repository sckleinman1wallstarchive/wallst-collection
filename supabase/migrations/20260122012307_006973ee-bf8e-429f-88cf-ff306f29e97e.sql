-- Add RLS policy for public viewing of listed inventory items
CREATE POLICY "Public can view listed items" 
ON public.inventory_items 
FOR SELECT 
USING (status = 'listed');