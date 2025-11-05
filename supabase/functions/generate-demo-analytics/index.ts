import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postIds, days = 30 } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let targetPostIds = postIds;
    
    // If no postIds provided, fetch all published posts
    if (!targetPostIds || targetPostIds.length === 0) {
      const { data: posts } = await supabase
        .from('posts')
        .select('id')
        .eq('status', 'published');
      
      targetPostIds = posts?.map(p => p.id) || [];
    }

    if (targetPostIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No published posts found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analyticsData = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Generate demo data for each post and each day
    for (const postId of targetPostIds) {
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        
        // Generate realistic-looking random data with trends
        const dayFactor = i / days; // 0 to 1 over the period
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        
        const baseViews = 100 + Math.floor(Math.random() * 200);
        const trendViews = Math.floor(baseViews * (1 + dayFactor * 0.5)); // Upward trend
        const pageViews = Math.floor(trendViews * randomFactor);
        
        const uniqueVisitors = Math.floor(pageViews * (0.6 + Math.random() * 0.2));
        const organicTraffic = Math.floor(pageViews * (0.5 + Math.random() * 0.3));
        
        analyticsData.push({
          post_id: postId,
          date: currentDate.toISOString().split('T')[0],
          page_views: pageViews,
          unique_visitors: uniqueVisitors,
          avg_time_on_page: Math.floor(120 + Math.random() * 180), // 2-5 minutes
          bounce_rate: parseFloat((30 + Math.random() * 40).toFixed(2)), // 30-70%
          scroll_depth: parseFloat((60 + Math.random() * 30).toFixed(2)), // 60-90%
          social_shares: Math.floor(Math.random() * 20),
          comments_count: Math.floor(Math.random() * 5),
          click_through_rate: parseFloat((2 + Math.random() * 3).toFixed(2)), // 2-5%
          organic_traffic: organicTraffic,
          keyword_rankings: JSON.stringify([
            { keyword: 'main keyword', position: Math.floor(5 + Math.random() * 10), previousPosition: Math.floor(8 + Math.random() * 10) },
            { keyword: 'secondary keyword', position: Math.floor(10 + Math.random() * 20), previousPosition: Math.floor(15 + Math.random() * 20) },
          ]),
          backlinks_gained: Math.floor(Math.random() * 3),
          domain_authority_score: Math.floor(40 + Math.random() * 30),
          conversions: Math.floor(pageViews * 0.02 * Math.random()), // 0-2% conversion rate
          conversion_rate: parseFloat((Math.random() * 2).toFixed(2)),
        });
      }
    }

    // Batch insert analytics data
    const { error: insertError } = await supabase
      .from('post_analytics')
      .upsert(analyticsData, {
        onConflict: 'post_id,date',
        ignoreDuplicates: false,
      });

    if (insertError) {
      console.error('Error inserting analytics:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate analytics data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        postsProcessed: targetPostIds.length,
        daysGenerated: days,
        totalRecords: analyticsData.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-demo-analytics function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
