-- Add columns for metric goals
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS goal_type TEXT DEFAULT 'standard' CHECK (goal_type IN ('standard', 'metric')),
ADD COLUMN IF NOT EXISTS metric_type TEXT CHECK (metric_type IN ('inventory_cost', 'revenue', 'profit', 'items_sold', 'items_sourced')),
ADD COLUMN IF NOT EXISTS metric_target NUMERIC,
ADD COLUMN IF NOT EXISTS metric_current NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;