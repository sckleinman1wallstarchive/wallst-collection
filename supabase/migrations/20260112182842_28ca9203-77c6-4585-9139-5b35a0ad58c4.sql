-- Update is_allowed_user() to explicitly reject unauthenticated users
CREATE OR REPLACE FUNCTION public.is_allowed_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN auth.uid() IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.allowed_emails
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  END
$$;