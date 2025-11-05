-- Create backlinks table for tracking incoming links
CREATE TABLE IF NOT EXISTS public.backlinks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  source_domain TEXT NOT NULL,
  anchor_text TEXT,
  link_type TEXT NOT NULL DEFAULT 'dofollow' CHECK (link_type IN ('dofollow', 'nofollow', 'ugc', 'sponsored')),
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'lost', 'broken')),
  
  -- Quality metrics
  domain_authority INTEGER CHECK (domain_authority >= 0 AND domain_authority <= 100),
  spam_score INTEGER CHECK (spam_score >= 0 AND spam_score <= 100),
  relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
  traffic_estimate INTEGER,
  
  -- Additional metadata
  page_title TEXT,
  context_snippet TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(source_url, post_id)
);

-- Enable RLS
ALTER TABLE public.backlinks ENABLE ROW LEVEL SECURITY;

-- Admins can manage all backlinks
CREATE POLICY "Admins can manage backlinks"
  ON public.backlinks
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can view backlinks
CREATE POLICY "Authenticated users can view backlinks"
  ON public.backlinks
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create index for performance
CREATE INDEX idx_backlinks_post_id ON public.backlinks(post_id);
CREATE INDEX idx_backlinks_status ON public.backlinks(status);
CREATE INDEX idx_backlinks_domain ON public.backlinks(source_domain);

-- Add trigger for updated_at
CREATE TRIGGER update_backlinks_updated_at
  BEFORE UPDATE ON public.backlinks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create backlink_quality_history table for tracking changes over time
CREATE TABLE IF NOT EXISTS public.backlink_quality_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backlink_id UUID NOT NULL REFERENCES public.backlinks(id) ON DELETE CASCADE,
  domain_authority INTEGER,
  spam_score INTEGER,
  relevance_score INTEGER,
  status TEXT NOT NULL,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on history table
ALTER TABLE public.backlink_quality_history ENABLE ROW LEVEL SECURITY;

-- Admins can view history
CREATE POLICY "Admins can view backlink history"
  ON public.backlink_quality_history
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_backlink_history_backlink_id ON public.backlink_quality_history(backlink_id);
CREATE INDEX idx_backlink_history_checked_at ON public.backlink_quality_history(checked_at DESC);