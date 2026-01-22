-- Add for-sale status to item_status enum
ALTER TYPE item_status ADD VALUE IF NOT EXISTS 'for-sale';