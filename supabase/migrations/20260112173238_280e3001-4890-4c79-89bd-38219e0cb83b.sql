-- Remove overly permissive policies from capital_accounts
DROP POLICY IF EXISTS "Authenticated users can read" ON capital_accounts;
DROP POLICY IF EXISTS "Authenticated users can insert" ON capital_accounts;
DROP POLICY IF EXISTS "Authenticated users can update" ON capital_accounts;
DROP POLICY IF EXISTS "Authenticated users can delete" ON capital_accounts;

-- Remove overly permissive policies from contacts
DROP POLICY IF EXISTS "Authenticated users can read" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can insert" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can update" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can delete" ON contacts;

-- Remove overly permissive policies from expenses
DROP POLICY IF EXISTS "Authenticated users can read" ON expenses;
DROP POLICY IF EXISTS "Authenticated users can insert" ON expenses;
DROP POLICY IF EXISTS "Authenticated users can update" ON expenses;
DROP POLICY IF EXISTS "Authenticated users can delete" ON expenses;

-- Remove overly permissive policies from inventory_items
DROP POLICY IF EXISTS "Authenticated users can read" ON inventory_items;
DROP POLICY IF EXISTS "Authenticated users can insert" ON inventory_items;
DROP POLICY IF EXISTS "Authenticated users can update" ON inventory_items;
DROP POLICY IF EXISTS "Authenticated users can delete" ON inventory_items;

-- Remove overly permissive policies from transactions
DROP POLICY IF EXISTS "Authenticated users can read" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can insert" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can update" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can delete" ON transactions;