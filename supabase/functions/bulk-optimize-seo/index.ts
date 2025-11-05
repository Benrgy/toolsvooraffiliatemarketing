import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OptimizeSEORequest {
  postIds: string[];
}

interface SEOOptimization {
  postId: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  improvements: string[];
  score: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { postIds }: OptimizeSEORequest = await req.json();

    if (!postIds || postIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No post IDs provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting bulk SEO optimization for ${postIds.length} posts...`);

    // Fetch all posts
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content, excerpt, meta_title, meta_description')
      .in('id', postIds);

    if (fetchError) {
      console.error('Error fetching posts:', fetchError);
      throw fetchError;
    }

    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No posts found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${posts.length} posts to optimize`);

    const optimizations: SEOOptimization[] = [];

    // Process each post
    for (const post of posts) {
      console.log(`Optimizing post: ${post.title}`);

      try {
        // Call Lovable AI to generate optimized metadata
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `Je bent een expert SEO copywriter. Analyseer de content en genereer geoptimaliseerde SEO metadata.
                
Regels:
- Meta titel: max 60 karakters, bevat primary keyword, aantrekkelijk en click-worthy
- Meta beschrijving: max 160 karakters, bevat call-to-action, secundaire keywords
- Focus keyword: 1-3 woorden, meest relevante hoofdonderwerp
- Secondary keywords: 3-5 gerelateerde keywords
- Geef concrete verbeterpunten voor de content

Output moet in JSON formaat zijn.`
              },
              {
                role: 'user',
                content: `Optimaliseer de SEO voor dit artikel:

Titel: ${post.title}
${post.excerpt ? `Excerpt: ${post.excerpt}` : ''}
Content preview: ${post.content?.substring(0, 500) || ''}

Huidige meta titel: ${post.meta_title || 'Geen'}
Huidige meta beschrijving: ${post.meta_description || 'Geen'}

Genereer optimale SEO metadata.`
              }
            ],
            tools: [{
              type: "function",
              function: {
                name: "optimize_seo",
                description: "Generate optimized SEO metadata for a blog post",
                parameters: {
                  type: "object",
                  properties: {
                    metaTitle: {
                      type: "string",
                      description: "Optimized meta title (max 60 chars)"
                    },
                    metaDescription: {
                      type: "string",
                      description: "Optimized meta description (max 160 chars)"
                    },
                    focusKeyword: {
                      type: "string",
                      description: "Primary focus keyword"
                    },
                    secondaryKeywords: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 secondary keywords"
                    },
                    improvements: {
                      type: "array",
                      items: { type: "string" },
                      description: "List of improvement suggestions"
                    },
                    score: {
                      type: "number",
                      description: "SEO score out of 100"
                    }
                  },
                  required: ["metaTitle", "metaDescription", "focusKeyword", "secondaryKeywords", "improvements", "score"],
                  additionalProperties: false
                }
              }
            }],
            tool_choice: { type: "function", function: { name: "optimize_seo" } }
          }),
        });

        if (!aiResponse.ok) {
          if (aiResponse.status === 429) {
            console.error('Rate limit exceeded');
            throw new Error('AI rate limit exceeded. Please try again later.');
          }
          if (aiResponse.status === 402) {
            console.error('Payment required');
            throw new Error('AI credits exhausted. Please add funds to your workspace.');
          }
          const errorText = await aiResponse.text();
          console.error('AI API error:', aiResponse.status, errorText);
          throw new Error('AI generation failed');
        }

        const aiData = await aiResponse.json();
        console.log('AI Response:', JSON.stringify(aiData));

        // Extract tool call result
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall) {
          console.error('No tool call in response');
          throw new Error('Invalid AI response format');
        }

        const optimizedData = JSON.parse(toolCall.function.arguments);

        optimizations.push({
          postId: post.id,
          metaTitle: optimizedData.metaTitle,
          metaDescription: optimizedData.metaDescription,
          focusKeyword: optimizedData.focusKeyword,
          secondaryKeywords: optimizedData.secondaryKeywords,
          improvements: optimizedData.improvements,
          score: optimizedData.score
        });

        // Update the post with optimized metadata
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            meta_title: optimizedData.metaTitle,
            meta_description: optimizedData.metaDescription
          })
          .eq('id', post.id);

        if (updateError) {
          console.error('Error updating post:', updateError);
          throw updateError;
        }

        console.log(`Successfully optimized post: ${post.title}`);

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to optimize post ${post.id}:`, error);
        // Continue with other posts even if one fails
        optimizations.push({
          postId: post.id,
          metaTitle: post.meta_title || post.title,
          metaDescription: post.meta_description || '',
          focusKeyword: post.focus_keyword || '',
          secondaryKeywords: [],
          improvements: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
          score: 0
        });
      }
    }

    console.log(`Bulk optimization completed: ${optimizations.length} posts processed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        optimizations,
        totalProcessed: optimizations.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in bulk-optimize-seo function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
