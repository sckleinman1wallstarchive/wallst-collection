-- Add column for convention item selection
ALTER TABLE inventory_items ADD COLUMN in_convention boolean DEFAULT false;

-- Add columns for trade tracking
ALTER TABLE inventory_items ADD COLUMN traded_for_item_id uuid REFERENCES inventory_items(id);
ALTER TABLE inventory_items ADD COLUMN trade_cash_difference numeric DEFAULT 0;