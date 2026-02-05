-- Add 'both' to task_owner enum
ALTER TYPE task_owner ADD VALUE 'both';

-- Add hide column for sold archive control
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS hide_from_sold_archive boolean DEFAULT false;