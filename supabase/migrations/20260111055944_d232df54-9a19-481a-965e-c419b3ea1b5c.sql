-- Drop all existing overly-permissive public policies and create secure authenticated-only policies

-- CAPITAL_ACCOUNTS table
DROP POLICY IF EXISTS "Allow public delete access" ON capital_accounts;
DROP POLICY IF EXISTS "Allow public insert access" ON capital_accounts;
DROP POLICY IF EXISTS "Allow public read access" ON capital_accounts;
DROP POLICY IF EXISTS "Allow public update access" ON capital_accounts;

CREATE POLICY "Authenticated users can read" ON capital_accounts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert" ON capital_accounts
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON capital_accounts
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete" ON capital_accounts
  FOR DELETE TO authenticated USING (true);

-- CONTACTS table
DROP POLICY IF EXISTS "Allow public delete access" ON contacts;
DROP POLICY IF EXISTS "Allow public insert access" ON contacts;
DROP POLICY IF EXISTS "Allow public read access" ON contacts;
DROP POLICY IF EXISTS "Allow public update access" ON contacts;

CREATE POLICY "Authenticated users can read" ON contacts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert" ON contacts
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON contacts
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete" ON contacts
  FOR DELETE TO authenticated USING (true);

-- EXPENSES table
DROP POLICY IF EXISTS "Allow public delete access" ON expenses;
DROP POLICY IF EXISTS "Allow public insert access" ON expenses;
DROP POLICY IF EXISTS "Allow public read access" ON expenses;
DROP POLICY IF EXISTS "Allow public update access" ON expenses;

CREATE POLICY "Authenticated users can read" ON expenses
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert" ON expenses
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON expenses
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete" ON expenses
  FOR DELETE TO authenticated USING (true);

-- INVENTORY_ITEMS table
DROP POLICY IF EXISTS "Allow public delete access" ON inventory_items;
DROP POLICY IF EXISTS "Allow public insert access" ON inventory_items;
DROP POLICY IF EXISTS "Allow public read access" ON inventory_items;
DROP POLICY IF EXISTS "Allow public update access" ON inventory_items;

CREATE POLICY "Authenticated users can read" ON inventory_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert" ON inventory_items
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON inventory_items
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete" ON inventory_items
  FOR DELETE TO authenticated USING (true);

-- TRANSACTIONS table
DROP POLICY IF EXISTS "Allow public delete access" ON transactions;
DROP POLICY IF EXISTS "Allow public insert access" ON transactions;
DROP POLICY IF EXISTS "Allow public read access" ON transactions;
DROP POLICY IF EXISTS "Allow public update access" ON transactions;

CREATE POLICY "Authenticated users can read" ON transactions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert" ON transactions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON transactions
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete" ON transactions
  FOR DELETE TO authenticated USING (true);