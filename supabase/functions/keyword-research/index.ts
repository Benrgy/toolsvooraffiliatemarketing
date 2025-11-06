import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KeywordSuggestion {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  relevanceScore: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { focusKeyword, country = 'NL', language = 'nl' } = await req.json();

    if (!focusKeyword) {
      return new Response(
        JSON.stringify({ error: 'Focus keyword is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Als SEO expert, genereer 15 gerelateerde keyword suggesties voor het focus keyword "${focusKeyword}" voor de ${country} markt in het ${language}.

Voor elk keyword, geef:
1. Het exacte keyword
2. Geschat maandelijks zoekvolume (realistisch nummer)
3. SEO difficulty score (0-100, waar 0 = makkelijk, 100 = zeer moeilijk)
4. Search intent (informational, commercial, transactional, navigational)
5. Relevance score (0-100, hoe relevant is het voor het focus keyword)

Geef een mix van:
- Long-tail keywords (lagere difficulty, specifiekere intent)
- Related topics en subtopics
- Question-based keywords
- Variaties met verschillende modifiers

Zorg dat de keywords relevant en waardevol zijn voor content creatie.`;

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
            content: 'Je bent een SEO expert gespecialiseerd in keyword research. Geef altijd nauwkeurige, actionable keyword suggesties.'
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
              name: 'suggest_keywords',
              description: 'Return keyword suggestions with metrics',
              parameters: {
                type: 'object',
                properties: {
                  keywords: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        keyword: { type: 'string' },
                        searchVolume: { type: 'number' },
                        difficulty: { type: 'number' },
                        intent: { 
                          type: 'string',
                          enum: ['informational', 'commercial', 'transactional', 'navigational']
                        },
                        relevanceScore: { type: 'number' }
                      },
                      required: ['keyword', 'searchVolume', 'difficulty', 'intent', 'relevanceScore']
                    }
                  }
                },
                required: ['keywords']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_keywords' } }
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
    const keywords: KeywordSuggestion[] = result.keywords;

    // Sort by relevance score
    keywords.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return new Response(
      JSON.stringify({
        keywords,
        metadata: {
          focusKeyword,
          country,
          language,
          totalResults: keywords.length,
          generatedAt: new Date().toISOString()
        },
        disclaimer: 'Search volume and difficulty scores are estimates based on AI analysis.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in keyword-research function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
