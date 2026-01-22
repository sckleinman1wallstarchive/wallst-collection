-- Add storefront_display_order to inventory_items for edit mode reordering
ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS storefront_display_order integer DEFAULT 0;

-- Create storefront_brands table for Shop by Brand page
CREATE TABLE public.storefront_brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name TEXT NOT NULL UNIQUE,
  featured_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  art_image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storefront_grails table for Collection Grails gallery
CREATE TABLE public.storefront_grails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  art_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(position)
);

-- Create about_us_content table for About Us art gallery
CREATE TABLE public.about_us_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner TEXT NOT NULL CHECK (owner IN ('parker', 'spencer')),
  art_image_url TEXT,
  art_title TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(owner)
);

-- Enable RLS on all new tables
ALTER TABLE public.storefront_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_grails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_us_content ENABLE ROW LEVEL SECURITY;

-- RLS for storefront_brands: Public read, allowed users write
CREATE POLICY "Public can view storefront_brands" 
ON public.storefront_brands 
FOR SELECT 
USING (true);

CREATE POLICY "Allowed users can insert storefront_brands" 
ON public.storefront_brands 
FOR INSERT 
WITH CHECK (is_allowed_user());

CREATE POLICY "Allowed users can update storefront_brands" 
ON public.storefront_brands 
FOR UPDATE 
USING (is_allowed_user());

CREATE POLICY "Allowed users can delete storefront_brands" 
ON public.storefront_brands 
FOR DELETE 
USING (is_allowed_user());

-- RLS for storefront_grails: Public read, allowed users write
CREATE POLICY "Public can view storefront_grails" 
ON public.storefront_grails 
FOR SELECT 
USING (true);

CREATE POLICY "Allowed users can insert storefront_grails" 
ON public.storefront_grails 
FOR INSERT 
WITH CHECK (is_allowed_user());

CREATE POLICY "Allowed users can update storefront_grails" 
ON public.storefront_grails 
FOR UPDATE 
USING (is_allowed_user());

CREATE POLICY "Allowed users can delete storefront_grails" 
ON public.storefront_grails 
FOR DELETE 
USING (is_allowed_user());

-- RLS for about_us_content: Public read, allowed users write
CREATE POLICY "Public can view about_us_content" 
ON public.about_us_content 
FOR SELECT 
USING (true);

CREATE POLICY "Allowed users can insert about_us_content" 
ON public.about_us_content 
FOR INSERT 
WITH CHECK (is_allowed_user());

CREATE POLICY "Allowed users can update about_us_content" 
ON public.about_us_content 
FOR UPDATE 
USING (is_allowed_user());

CREATE POLICY "Allowed users can delete about_us_content" 
ON public.about_us_content 
FOR DELETE 
USING (is_allowed_user());

-- Add triggers for updated_at
CREATE TRIGGER update_storefront_brands_updated_at
BEFORE UPDATE ON public.storefront_brands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_storefront_grails_updated_at
BEFORE UPDATE ON public.storefront_grails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_about_us_content_updated_at
BEFORE UPDATE ON public.about_us_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial rows for about_us_content so we have placeholders
INSERT INTO public.about_us_content (owner) VALUES ('parker'), ('spencer');