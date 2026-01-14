-- Migrate existing expenses to new categories
UPDATE expenses SET category = 'supplies' WHERE category = 'shipping';
UPDATE expenses SET category = 'supplies' WHERE category = 'other';
UPDATE expenses SET category = 'subscriptions' WHERE category = 'platform-fees';