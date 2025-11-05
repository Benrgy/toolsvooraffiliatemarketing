import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InternalLink {
  postId: string;
  title: string;
  slug: string;
  relevanceScore: number;
  suggestedAnchorText: string;
  context: string;
}

interface ExternalLink {
  url: string;
  title: string;
  relevanceScore: number;
  suggestedQuote: string;
  category: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, title, focusKeyword, excludePostId } = await req.json();

    if (!content || !title) {
      return new Response(
        JSON.stringify({ error: 'Content and title are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch published posts for internal linking
    let query = supabase
      .from('posts')
      .select('id, title, slug, excerpt, content, focus_keyword, secondary_keywords')
      .eq('status', 'published')
      .limit(50);

    if (excludePostId) {
      query = query.neq('id', excludePostId);
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch posts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI to analyze content and suggest links
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Je bent een SEO specialist die gespecialiseerd is in internal en external linking strategieën.
    
Analyseer de gegeven content en stel relevante interne en externe links voor.

Voor interne links:
- Identificeer relevante bestaande posts die gerelateerd zijn aan de content
- Stel natuurlijke anchor text voor die past in de context
- Geef een relevance score (0-100)
- Geef context waar de link het beste past

Voor externe links:
- Stel 5-7 autoritaire externe bronnen voor die relevant zijn voor het onderwerp
- Kies betrouwbare bronnen zoals overheidswebsites, academische publicaties, bekende nieuwsbronnen, of industrie experts
- Genereer een kort citaat/quote (1-2 zinnen) dat gebruikt kan worden als referentie
- Geef een relevance score (0-100)
- Categoriseer het type bron (Research, Statistics, Guide, News, Tool, etc.)

Retourneer ALLEEN een JSON object zonder extra tekst of markdown formatting.`;

    const postsContext = posts?.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      focusKeyword: p.focus_keyword,
      secondaryKeywords: p.secondary_keywords
    })) || [];

    const userPrompt = `Content titel: ${title}
Focus keyword: ${focusKeyword || 'niet opgegeven'}

Content (eerste 2000 karakters):
${content.substring(0, 2000)}

Beschikbare posts voor interne links:
${JSON.stringify(postsContext, null, 2)}

Genereer suggesties in dit JSON formaat:
{
  "internalLinks": [
    {
      "postId": "uuid",
      "title": "Post titel",
      "slug": "post-slug",
      "relevanceScore": 85,
      "suggestedAnchorText": "natuurlijke anchor text",
      "context": "Korte uitleg waarom deze link relevant is"
    }
  ],
  "externalLinks": [
    {
      "url": "https://example.com/artikel",
      "title": "Titel van de externe bron",
      "relevanceScore": 90,
      "suggestedQuote": "Een relevant citaat of feit van deze bron dat je kunt gebruiken.",
      "category": "Research"
    }
  ]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate link suggestions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    // Parse AI response
    let suggestions;
    try {
      // Remove markdown code blocks if present
      const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      suggestions = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse suggestions',
          internalLinks: [],
          externalLinks: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        internalLinks: suggestions.internalLinks || [],
        externalLinks: suggestions.externalLinks || [],
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
