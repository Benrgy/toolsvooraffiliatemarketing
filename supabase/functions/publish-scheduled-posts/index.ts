import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Checking for scheduled posts to publish...');

    // Find all scheduled posts where published_at is in the past
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, slug, published_at')
      .eq('status', 'scheduled')
      .lte('published_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError);
      throw fetchError;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log('No scheduled posts to publish');
      return new Response(
        JSON.stringify({ 
          success: true, 
          published: 0,
          message: 'No posts to publish' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${scheduledPosts.length} posts to publish`);

    // Publish all scheduled posts
    const { data: updatedPosts, error: updateError } = await supabase
      .from('posts')
      .update({ status: 'published' })
      .in('id', scheduledPosts.map(p => p.id))
      .select();

    if (updateError) {
      console.error('Error publishing scheduled posts:', updateError);
      throw updateError;
    }

    console.log(`Successfully published ${updatedPosts?.length || 0} posts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        published: updatedPosts?.length || 0,
        posts: updatedPosts?.map(p => ({ id: p.id, title: p.title, slug: p.slug }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in publish-scheduled-posts:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});