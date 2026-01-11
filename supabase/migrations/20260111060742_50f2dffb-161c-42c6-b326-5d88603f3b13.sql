-- Create allowed_emails table
CREATE TABLE public.allowed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on allowed_emails
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is allowed
CREATE OR REPLACE FUNCTION public.is_allowed_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.allowed_emails
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
$$;

-- Seed the allowed emails
INSERT INTO public.allowed_emails (email) VALUES 
  ('sckleinman1@gmail.com'),
  ('parkerxk1@gmail.com');

-- RLS for allowed_emails table itself (only allowed users can manage it)
CREATE POLICY "Allowed users can read allowed_emails"
ON public.allowed_emails FOR SELECT
USING (public.is_allowed_user());

CREATE POLICY "Allowed users can insert allowed_emails"
ON public.allowed_emails FOR INSERT
WITH CHECK (public.is_allowed_user());

CREATE POLICY "Allowed users can delete allowed_emails"
ON public.allowed_emails FOR DELETE
USING (public.is_allowed_user());

-- Drop old policies and create new ones for inventory_items
DROP POLICY IF EXISTS "Authenticated users can read " ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can insert " ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can update " ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can delete " ON public.inventory_items;

CREATE POLICY "Allowed users can read inventory_items"
ON public.inventory_items FOR SELECT
USING (public.is_allowed_user());

CREATE POLICY "Allowed users can insert inventory_items"
ON public.inventory_items FOR INSERT
WITH CHECK (public.is_allowed_user());

CREATE POLICY "Allowed users can update inventory_items"
ON public.inventory_items FOR UPDATE
USING (public.is_allowed_user());

CREATE POLICY "Allowed users can delete inventory_items"
ON public.inventory_items FOR DELETE
USING (public.is_allowed_user());

-- Drop old policies and create new ones for contacts
DROP POLICY IF EXISTS "Authenticated users can read " ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can insert " ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can update " ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can delete " ON public.contacts;

CREATE POLICY "Allowed users can read contacts"
ON public.contacts FOR SELECT
USING (public.is_allowed_user());

CREATE POLICY "Allowed users can insert contacts"
ON public.contacts FOR INSERT
WITH CHECK (public.is_allowed_user());

CREATE POLICY "Allowed users can update contacts"
ON public.contacts FOR UPDATE
USING (public.is_allowed_user());

CREATE POLICY "Allowed users can delete contacts"
ON public.contacts FOR DELETE
USING (public.is_allowed_user());

-- Drop old policies and create new ones for capital_accounts
DROP POLICY IF EXISTS "Authenticated users can read " ON public.capital_accounts;
DROP POLICY IF EXISTS "Authenticated users can insert " ON public.capital_accounts;
DROP POLICY IF EXISTS "Authenticated users can update " ON public.capital_accounts;
DROP POLICY IF EXISTS "Authenticated users can delete " ON public.capital_accounts;

CREATE POLICY "Allowed users can read capital_accounts"
ON public.capital_accounts FOR SELECT
USING (public.is_allowed_user());

CREATE POLICY "Allowed users can insert capital_accounts"
ON public.capital_accounts FOR INSERT
WITH CHECK (public.is_allowed_user());

CREATE POLICY "Allowed users can update capital_accounts"
ON public.capital_accounts FOR UPDATE
USING (public.is_allowed_user());

CREATE POLICY "Allowed users can delete capital_accounts"
ON public.capital_accounts FOR DELETE
USING (public.is_allowed_user());

-- Drop old policies and create new ones for expenses
DROP POLICY IF EXISTS "Authenticated users can read " ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can insert " ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can update " ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can delete " ON public.expenses;

CREATE POLICY "Allowed users can read expenses"
ON public.expenses FOR SELECT
USING (public.is_allowed_user());

CREATE POLICY "Allowed users can insert expenses"
ON public.expenses FOR INSERT
WITH CHECK (public.is_allowed_user());

CREATE POLICY "Allowed users can update expenses"
ON public.expenses FOR UPDATE
USING (public.is_allowed_user());

CREATE POLICY "Allowed users can delete expenses"
ON public.expenses FOR DELETE
USING (public.is_allowed_user());

-- Drop old policies and create new ones for transactions
DROP POLICY IF EXISTS "Authenticated users can read " ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can insert " ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can update " ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can delete " ON public.transactions;

CREATE POLICY "Allowed users can read transactions"
ON public.transactions FOR SELECT
USING (public.is_allowed_user());

CREATE POLICY "Allowed users can insert transactions"
ON public.transactions FOR INSERT
WITH CHECK (public.is_allowed_user());

CREATE POLICY "Allowed users can update transactions"
ON public.transactions FOR UPDATE
USING (public.is_allowed_user());

CREATE POLICY "Allowed users can delete transactions"
ON public.transactions FOR DELETE
USING (public.is_allowed_user());