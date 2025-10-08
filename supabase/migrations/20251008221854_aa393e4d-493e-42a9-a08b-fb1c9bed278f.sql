-- Create categories table for tool organization
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tools table for AI automation tools
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  pricing_model TEXT, -- 'free', 'freemium', 'paid', 'subscription'
  featured BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published', -- 'draft', 'published', 'archived'
  affiliate_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create tool_tags table for flexible tagging
CREATE TABLE public.tool_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tool_features table for listing key features
CREATE TABLE public.tool_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_features ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON public.categories FOR ALL
  USING (true)
  WITH CHECK (true);

-- Tools policies (public read, admin write)
CREATE POLICY "Public can view published tools"
  ON public.tools FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all tools"
  ON public.tools FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage tools"
  ON public.tools FOR ALL
  USING (true)
  WITH CHECK (true);

-- Tool tags policies
CREATE POLICY "Public can view tool tags"
  ON public.tool_tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage tool tags"
  ON public.tool_tags FOR ALL
  USING (true)
  WITH CHECK (true);

-- Tool features policies
CREATE POLICY "Public can view tool features"
  ON public.tool_features FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage tool features"
  ON public.tool_features FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_tools_category ON public.tools(category_id);
CREATE INDEX idx_tools_slug ON public.tools(slug);
CREATE INDEX idx_tools_featured ON public.tools(featured);
CREATE INDEX idx_tools_status ON public.tools(status);
CREATE INDEX idx_tool_tags_tool_id ON public.tool_tags(tool_id);
CREATE INDEX idx_tool_features_tool_id ON public.tool_features(tool_id);