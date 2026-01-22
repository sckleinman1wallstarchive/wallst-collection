-- Add size_preset column to storefront_grails
ALTER TABLE public.storefront_grails ADD COLUMN size_preset TEXT DEFAULT 'auto';

-- Add size_preset column to storefront_brands
ALTER TABLE public.storefront_brands ADD COLUMN size_preset TEXT DEFAULT 'auto';