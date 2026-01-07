-- Remove owner and split columns from inventory_items
ALTER TABLE public.inventory_items DROP COLUMN IF EXISTS owner;
ALTER TABLE public.inventory_items DROP COLUMN IF EXISTS owner_split;