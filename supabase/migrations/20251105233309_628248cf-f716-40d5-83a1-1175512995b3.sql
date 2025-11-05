-- Fix the security definer view by recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.post_analytics_summary;

CREATE OR REPLACE VIEW public.post_analytics_summary 
WITH (security_invoker = true)
AS
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