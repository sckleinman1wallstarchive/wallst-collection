-- Add ever_in_convention column to track items that were ever in a convention
ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS ever_in_convention BOOLEAN DEFAULT FALSE;

-- Backfill: set ever_in_convention = true for any item currently in convention
UPDATE public.inventory_items 
SET ever_in_convention = TRUE 
WHERE in_convention = TRUE;