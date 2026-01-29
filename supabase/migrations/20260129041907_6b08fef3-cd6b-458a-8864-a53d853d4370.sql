-- Create junction table for brand-to-item assignments
CREATE TABLE public.storefront_brand_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.storefront_brands(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(brand_id, inventory_item_id)
);

-- Enable RLS
ALTER TABLE public.storefront_brand_items ENABLE ROW LEVEL SECURITY;

-- Public can view (for storefront display)
CREATE POLICY "Public can view storefront_brand_items"
ON public.storefront_brand_items FOR SELECT
USING (true);

-- Allowed users can manage
CREATE POLICY "Allowed users can insert storefront_brand_items"
ON public.storefront_brand_items FOR INSERT
WITH CHECK (is_allowed_user());

CREATE POLICY "Allowed users can update storefront_brand_items"
ON public.storefront_brand_items FOR UPDATE
USING (is_allowed_user());

CREATE POLICY "Allowed users can delete storefront_brand_items"
ON public.storefront_brand_items FOR DELETE
USING (is_allowed_user());

-- Add new category values to enum
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'belt';
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'sweater';
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'jacket';