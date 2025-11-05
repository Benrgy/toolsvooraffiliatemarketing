import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(url => {
    let entry = `  <url>\n    <loc>${url.loc}</loc>\n`;
    if (url.lastmod) {
      entry += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    if (url.changefreq) {
      entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    if (url.priority !== undefined) {
      entry += `    <priority>${url.priority}</priority>\n`;
    }
    entry += `  </url>`;
    return entry;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting sitemap generation...');

    // Get base URL from request or environment
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    console.log(`Base URL: ${baseUrl}`);

    const sitemapUrls: SitemapUrl[] = [];

    // Add homepage
    sitemapUrls.push({
      loc: baseUrl,
      changefreq: 'daily',
      priority: 1.0
    });

    // Add static pages
    sitemapUrls.push({
      loc: `${baseUrl}/tools`,
      changefreq: 'daily',
      priority: 0.9
    });

    sitemapUrls.push({
      loc: `${baseUrl}/blog`,
      changefreq: 'daily',
      priority: 0.9
    });

    // Fetch all published posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      throw postsError;
    }

    console.log(`Found ${posts?.length || 0} published posts`);

    // Add blog posts to sitemap
    if (posts) {
      posts.forEach(post => {
        sitemapUrls.push({
          loc: `${baseUrl}/blog/${post.slug}`,
          lastmod: post.updated_at || post.published_at,
          changefreq: 'weekly',
          priority: 0.8
        });
      });
    }

    // Fetch all published tools
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (toolsError) {
      console.error('Error fetching tools:', toolsError);
      throw toolsError;
    }

    console.log(`Found ${tools?.length || 0} published tools`);

    // Add tools to sitemap
    if (tools) {
      tools.forEach(tool => {
        sitemapUrls.push({
          loc: `${baseUrl}/tools/${tool.slug}`,
          lastmod: tool.updated_at || tool.published_at,
          changefreq: 'monthly',
          priority: 0.7
        });
      });
    }

    // Generate XML sitemap
    const sitemapXML = generateSitemapXML(sitemapUrls);

    console.log(`Sitemap generated successfully with ${sitemapUrls.length} URLs`);

    return new Response(sitemapXML, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error in generate-sitemap function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
