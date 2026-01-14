-- Add 'pop-up' to expense_category enum
ALTER TYPE expense_category ADD VALUE 'pop-up';

-- Clear in_convention for all unsold items
UPDATE inventory_items 
SET in_convention = false 
WHERE in_convention = true 
AND status NOT IN ('sold', 'traded', 'scammed', 'refunded');