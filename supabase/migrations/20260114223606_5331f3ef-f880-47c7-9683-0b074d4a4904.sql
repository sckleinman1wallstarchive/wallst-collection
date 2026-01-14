-- Add new expense category values
ALTER TYPE expense_category ADD VALUE IF NOT EXISTS 'advertising';
ALTER TYPE expense_category ADD VALUE IF NOT EXISTS 'subscriptions';