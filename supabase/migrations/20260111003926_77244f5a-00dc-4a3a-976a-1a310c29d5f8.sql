-- Create contacts table for buyer information
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  instagram_handle TEXT,
  phone_number TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access for internal tool)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (internal business tool, no auth)
CREATE POLICY "Allow public read access" 
ON public.contacts 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access" 
ON public.contacts 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access" 
ON public.contacts 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();