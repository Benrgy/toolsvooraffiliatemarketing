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

    console.log('Generating keyword suggestions for:', focusKeyword);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Je bent een SEO keyword research specialist. Analyseer het focus keyword "${focusKeyword}" voor de Nederlandse markt en genereer 15-20 gerelateerde keywords.

Voor elk keyword, geef een realistische schatting van:
- Search volume (maandelijkse zoekopdrachten in Nederland)
- Keyword difficulty (0-100, hoe moeilijk het is om te ranken)
- Search intent (informational, commercial, transactional, navigational)
- Relevance score (0-100, hoe relevant het keyword is voor het focus keyword)

Gebruik je kennis van:
- Nederlandse zoektrends en taal
- SEO best practices
- Keyword variaties (long-tail, gerelateerde topics, vragen)
- Seizoenaliteit en populariteit

Retourneer alleen de JSON array zonder extra tekst.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are a keyword research expert. Always return valid JSON arrays with keyword suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [{
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
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_keywords' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit bereikt. Probeer het later opnieuw.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData, null, 2));

    let keywords: KeywordSuggestion[] = [];

    if (aiData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      const functionArgs = JSON.parse(aiData.choices[0].message.tool_calls[0].function.arguments);
      keywords = functionArgs.keywords || [];
    }

    // Sort by relevance score
    keywords.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return new Response(
      JSON.stringify({ 
        keywords,
        metadata: {
          focusKeyword,
          country,
          language,
          generatedAt: new Date().toISOString(),
          disclaimer: 'Search volume en difficulty zijn AI-gegenereerde schattingen gebaseerd op industrie kennis en trends. Voor nauwkeurige data, gebruik professionele SEO tools.'
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in keyword-research function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
