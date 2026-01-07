-- Create owner enum
CREATE TYPE public.item_owner AS ENUM ('Parker Kleinman', 'Spencer Kleinman', 'Shared');

-- Create item status enum
CREATE TYPE public.item_status AS ENUM ('in-closet', 'listed', 'sold', 'shipped', 'archive-hold', 'scammed', 'refunded', 'traded');

-- Create platform enum
CREATE TYPE public.platform AS ENUM ('grailed', 'depop', 'poshmark', 'ebay', 'vinted', 'mercari', 'trade', 'none');

-- Create item category enum
CREATE TYPE public.item_category AS ENUM ('tops', 'bottoms', 'outerwear', 'footwear', 'accessories', 'bags', 'other');

-- Create expense category enum
CREATE TYPE public.expense_category AS ENUM ('supplies', 'shipping', 'platform-fees', 'other');

-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  size TEXT,
  category item_category NOT NULL DEFAULT 'other',
  acquisition_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  asking_price DECIMAL(10,2),
  lowest_acceptable_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  status item_status NOT NULL DEFAULT 'in-closet',
  platform platform NOT NULL DEFAULT 'none',
  platform_sold platform,
  source_platform TEXT,
  source TEXT,
  notes TEXT,
  owner item_owner NOT NULL DEFAULT 'Shared',
  owner_split TEXT,
  date_added DATE,
  date_sold DATE,
  days_held INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category expense_category NOT NULL DEFAULT 'other',
  owner item_owner NOT NULL DEFAULT 'Shared',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create capital_accounts table (single row for business state)
CREATE TABLE public.capital_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spencer_investment DECIMAL(10,2) NOT NULL DEFAULT 0,
  parker_investment DECIMAL(10,2) NOT NULL DEFAULT 0,
  cash_on_hand DECIMAL(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for bank/payment tracking
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  category TEXT,
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (but allow public access for now since no auth)
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create public access policies (since this is a personal business app without auth for now)
CREATE POLICY "Allow public read access" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.inventory_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.inventory_items FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.expenses FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.capital_accounts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.capital_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.capital_accounts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.capital_accounts FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.transactions FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_capital_accounts_updated_at
  BEFORE UPDATE ON public.capital_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial capital account row
INSERT INTO public.capital_accounts (spencer_investment, parker_investment, cash_on_hand) 
VALUES (0, 0, 0);