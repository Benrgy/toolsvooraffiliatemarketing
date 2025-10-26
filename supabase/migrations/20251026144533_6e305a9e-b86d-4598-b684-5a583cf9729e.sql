-- Fix security definer view issue
DROP VIEW IF EXISTS public.authors_public;

-- Recreate the view with SECURITY INVOKER (default, but making it explicit)
CREATE OR REPLACE VIEW public.authors_public 
WITH (security_invoker=true)
AS
SELECT 
  id,
  created_at,
  updated_at,
  name,
  bio,
  avatar_url
FROM public.authors;

-- Grant select on the public view
GRANT SELECT ON public.authors_public TO anon, authenticated;