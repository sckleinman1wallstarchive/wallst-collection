-- Add size preset and art URL columns to inventory_items for Personal Collection
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS storefront_size_preset TEXT DEFAULT 'auto';
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS closet_art_url TEXT;

-- Add title and description to storefront_grails for text editing
ALTER TABLE storefront_grails ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE storefront_grails ADD COLUMN IF NOT EXISTS description TEXT;