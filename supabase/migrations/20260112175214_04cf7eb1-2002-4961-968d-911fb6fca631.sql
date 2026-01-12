-- Add paid_by column to track who originally paid for each inventory item
ALTER TABLE inventory_items 
ADD COLUMN paid_by item_owner DEFAULT 'Shared';