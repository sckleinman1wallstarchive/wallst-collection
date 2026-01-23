-- Add unique constraint for upsert to work with api_key_id and month_year
ALTER TABLE public.removebg_usage 
ADD CONSTRAINT removebg_usage_api_key_month_unique 
UNIQUE (api_key_id, month_year);