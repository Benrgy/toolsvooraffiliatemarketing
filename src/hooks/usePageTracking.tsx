import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const usePageTracking = () => {
  const location = useLocation();
  const startTime = useRef<number>(Date.now());
  const maxScroll = useRef<number>(0);

  useEffect(() => {
    // Reset tracking on page change
    startTime.current = Date.now();
    maxScroll.current = 0;

    // Track scroll depth
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const scrollPercent = Math.round((scrolled / scrollHeight) * 100);
      maxScroll.current = Math.max(maxScroll.current, scrollPercent);
    };

    // Send page view to GA4
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    }

    // Track to our database
    trackPageView(location.pathname);

    window.addEventListener('scroll', handleScroll);

    // Track time on page when leaving
    return () => {
      window.removeEventListener('scroll', handleScroll);
      const timeOnPage = Math.round((Date.now() - startTime.current) / 1000);
      trackEngagement(location.pathname, timeOnPage, maxScroll.current);
    };
  }, [location]);
};

const trackPageView = async (pathname: string) => {
  try {
    // Extract post slug from pathname (if it's a blog post)
    const blogMatch = pathname.match(/^\/blog\/(.+)$/);
    if (!blogMatch) return;

    const slug = blogMatch[1];

    // Get post_id from slug
    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!post) return;

    const today = new Date().toISOString().split('T')[0];

    // Check if entry exists for today
    const { data: existing } = await supabase
      .from('post_analytics')
      .select('id, page_views, unique_visitors')
      .eq('post_id', post.id)
      .eq('date', today)
      .single();

    if (existing) {
      // Update existing entry
      await supabase
        .from('post_analytics')
        .update({
          page_views: existing.page_views + 1,
          unique_visitors: existing.unique_visitors + 1, // Simplified - ideally track unique IPs
        })
        .eq('id', existing.id);
    } else {
      // Create new entry
      await supabase
        .from('post_analytics')
        .insert({
          post_id: post.id,
          date: today,
          page_views: 1,
          unique_visitors: 1,
          avg_time_on_page: 0,
          bounce_rate: 0,
          avg_scroll_depth: 0,
          organic_traffic: 0,
          social_shares: 0,
          conversions: 0,
          conversion_rate: 0,
        });
    }

    // Send event to GA4
    if (window.gtag) {
      window.gtag('event', 'blog_post_view', {
        post_id: post.id,
        post_slug: slug,
      });
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

const trackEngagement = async (pathname: string, timeOnPage: number, scrollDepth: number) => {
  try {
    const blogMatch = pathname.match(/^\/blog\/(.+)$/);
    if (!blogMatch || timeOnPage < 5) return; // Only track if spent at least 5 seconds

    const slug = blogMatch[1];

    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!post) return;

    const today = new Date().toISOString().split('T')[0];

    // Update engagement metrics
    const { data: existing } = await supabase
      .from('post_analytics')
      .select('id, avg_time_on_page, page_views')
      .eq('post_id', post.id)
      .eq('date', today)
      .single();

    if (existing) {
      // Calculate new average time
      const newAvgTime = Math.round(
        (existing.avg_time_on_page * existing.page_views + timeOnPage) / 
        (existing.page_views + 1)
      );

      await supabase
        .from('post_analytics')
        .update({
          avg_time_on_page: newAvgTime,
        })
        .eq('id', existing.id);
    }

    // Send engagement event to GA4
    if (window.gtag) {
      window.gtag('event', 'engagement', {
        post_id: post.id,
        time_on_page: timeOnPage,
        scroll_depth: scrollDepth,
      });
    }
  } catch (error) {
    console.error('Error tracking engagement:', error);
  }
};
