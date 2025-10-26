-- Fix critical security vulnerabilities

-- 1. Remove public access to access_codes table
DROP POLICY IF EXISTS "Public can read active access codes" ON public.access_codes;

-- 2. Create authenticated-only policy for access_codes (restrict to admins in production)
CREATE POLICY "Authenticated users can read active access codes"
ON public.access_codes
FOR SELECT
TO authenticated
USING (is_active = true);

-- 3. Remove public read policy from authors table
DROP POLICY IF EXISTS "Public can view authors" ON public.authors;

-- 4. Create a view that exposes only non-sensitive author information publicly
CREATE OR REPLACE VIEW public.authors_public AS
SELECT 
  id,
  created_at,
  updated_at,
  name,
  bio,
  avatar_url
FROM public.authors;

-- 5. Grant select on the public view
GRANT SELECT ON public.authors_public TO anon, authenticated;

-- 6. Create policy for authenticated users to view full author details
CREATE POLICY "Authenticated users can view all author details"
ON public.authors
FOR SELECT
TO authenticated
USING (true);