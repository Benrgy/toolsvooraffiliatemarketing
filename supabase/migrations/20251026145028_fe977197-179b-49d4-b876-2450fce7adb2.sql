-- Restrict content management to admins only

-- 1. Fix tool_tags table - restrict to admins
DROP POLICY IF EXISTS "Authenticated users can manage tool tags" ON public.tool_tags;

CREATE POLICY "Admins can manage tool tags"
ON public.tool_tags
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Fix tool_features table - restrict to admins
DROP POLICY IF EXISTS "Authenticated users can manage tool features" ON public.tool_features;

CREATE POLICY "Admins can manage tool features"
ON public.tool_features
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Fix categories table - restrict to admins
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;

CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Fix tools table - restrict to admins
DROP POLICY IF EXISTS "Authenticated users can manage tools" ON public.tools;
DROP POLICY IF EXISTS "Authenticated users can view all tools" ON public.tools;

CREATE POLICY "Admins can manage tools"
ON public.tools
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Keep public read access for published tools
-- (this policy already exists, just ensuring it's correct)