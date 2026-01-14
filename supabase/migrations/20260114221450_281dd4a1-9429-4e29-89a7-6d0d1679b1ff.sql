-- Create goals table for tracking business and personal milestones
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  owner TEXT NOT NULL CHECK (owner IN ('Parker', 'Spencer', 'WSC')),
  is_complete BOOLEAN DEFAULT false,
  image_url TEXT,
  art_style TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allowed users can read goals"
ON public.goals FOR SELECT
USING (is_allowed_user());

CREATE POLICY "Allowed users can insert goals"
ON public.goals FOR INSERT
WITH CHECK (is_allowed_user());

CREATE POLICY "Allowed users can update goals"
ON public.goals FOR UPDATE
USING (is_allowed_user());

CREATE POLICY "Allowed users can delete goals"
ON public.goals FOR DELETE
USING (is_allowed_user());

-- Create trigger for updated_at
CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();