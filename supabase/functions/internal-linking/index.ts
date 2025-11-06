import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId, content, title } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all published posts except the current one
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, content, focus_keyword')
      .eq('status', 'published')
      .neq('id', postId || '00000000-0000-0000-0000-000000000000');

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      throw postsError;
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Analyseer de volgende content en suggereer relevante interne links naar andere posts.

HUIDIGE POST:
Titel: ${title}
Content preview: ${content.substring(0, 1000)}...

BESCHIKBARE POSTS OM NAAR TE LINKEN:
${posts.map((p, i) => `${i + 1}. "${p.title}" (slug: ${p.slug})
   Focus keyword: ${p.focus_keyword || 'N/A'}
   Excerpt: ${p.excerpt || 'N/A'}`).join('\n\n')}

Geef 3-7 suggesties voor interne links met:
1. De anchor text (specifieke woorden uit de content die gelinkt moeten worden)
2. De target post slug
3. Context (waar in de tekst het zou moeten komen)
4. Relevance score (0-100)
5. Reasoning (waarom is deze link relevant)

Zorg dat:
- Anchor text natuurlijk is en geen "klik hier" bevat
- Links contextually relevant zijn
- Je verschillende delen van de content spreidt
- Je de meest relevante posts prioriteert`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Je bent een SEO expert gespecialiseerd in internal linking strategieën. Geef natuurlijke, contextueel relevante link suggesties.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'suggest_internal_links',
              description: 'Return internal linking suggestions',
              parameters: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        anchorText: { type: 'string' },
                        targetSlug: { type: 'string' },
                        context: { type: 'string' },
                        relevanceScore: { type: 'number' },
                        reasoning: { type: 'string' }
                      },
                      required: ['anchorText', 'targetSlug', 'context', 'relevanceScore', 'reasoning']
                    }
                  }
                },
                required: ['suggestions']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_internal_links' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    // Enrich suggestions with full post data
    const enrichedSuggestions = result.suggestions.map((suggestion: any) => {
      const targetPost = posts.find(p => p.slug === suggestion.targetSlug);
      return {
        ...suggestion,
        targetPost: targetPost ? {
          title: targetPost.title,
          slug: targetPost.slug,
          excerpt: targetPost.excerpt
        } : null
      };
    }).filter((s: any) => s.targetPost !== null);

    // Sort by relevance
    enrichedSuggestions.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);

    return new Response(
      JSON.stringify({
        suggestions: enrichedSuggestions,
        metadata: {
          totalSuggestions: enrichedSuggestions.length,
          availablePosts: posts.length,
          generatedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in internal-linking function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
