-- Add platforms array column for multi-select
ALTER TABLE inventory_items 
ADD COLUMN platforms text[] DEFAULT '{}';

-- Migrate existing single platform data to array
UPDATE inventory_items 
SET platforms = ARRAY[platform::text]
WHERE platform IS NOT NULL AND platform != 'none';

-- Set empty array for 'none' values
UPDATE inventory_items 
SET platforms = '{}'
WHERE platform = 'none' OR platform IS NULL;