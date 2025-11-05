-- Create post_analytics table for tracking performance metrics
CREATE TABLE IF NOT EXISTS public.post_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Traffic metrics
  page_views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  avg_time_on_page INTEGER NOT NULL DEFAULT 0, -- in seconds
  bounce_rate NUMERIC(5,2) CHECK (bounce_rate >= 0 AND bounce_rate <= 100),
  
  -- Engagement metrics
  scroll_depth NUMERIC(5,2) CHECK (scroll_depth >= 0 AND scroll_depth <= 100),
  social_shares INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  click_through_rate NUMERIC(5,2) CHECK (click_through_rate >= 0 AND click_through_rate <= 100),
  
  -- SEO metrics
  organic_traffic INTEGER NOT NULL DEFAULT 0,
  keyword_rankings JSONB DEFAULT '[]'::jsonb, -- Array of {keyword: string, position: number, previousPosition: number}
  backlinks_gained INTEGER NOT NULL DEFAULT 0,
  domain_authority_score INTEGER CHECK (domain_authority_score >= 0 AND domain_authority_score <= 100),
  
  -- Conversion metrics
  conversions INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC(5,2) CHECK (conversion_rate >= 0 AND conversion_rate <= 100),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(post_id, date)
);

-- Enable RLS
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

-- Admins can manage analytics
CREATE POLICY "Admins can manage post analytics"
  ON public.post_analytics
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can view analytics
CREATE POLICY "Authenticated users can view post analytics"
  ON public.post_analytics
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_post_analytics_post_id ON public.post_analytics(post_id);
CREATE INDEX idx_post_analytics_date ON public.post_analytics(date DESC);
CREATE INDEX idx_post_analytics_post_date ON public.post_analytics(post_id, date DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_post_analytics_updated_at
  BEFORE UPDATE ON public.post_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create aggregate metrics view for easier querying
CREATE OR REPLACE VIEW public.post_analytics_summary AS
SELECT 
  p.id as post_id,
  p.title,
  p.slug,
  p.status,
  p.published_at,
  COUNT(DISTINCT pa.date) as days_tracked,
  SUM(pa.page_views) as total_views,
  SUM(pa.unique_visitors) as total_visitors,
  ROUND(AVG(pa.avg_time_on_page))::INTEGER as avg_time_on_page,
  ROUND(AVG(pa.bounce_rate), 2) as avg_bounce_rate,
  ROUND(AVG(pa.scroll_depth), 2) as avg_scroll_depth,
  SUM(pa.social_shares) as total_shares,
  SUM(pa.organic_traffic) as total_organic_traffic,
  SUM(pa.conversions) as total_conversions,
  ROUND(AVG(pa.conversion_rate), 2) as avg_conversion_rate
FROM public.posts p
LEFT JOIN public.post_analytics pa ON p.id = pa.post_id
WHERE p.status = 'published'
GROUP BY p.id, p.title, p.slug, p.status, p.published_at;