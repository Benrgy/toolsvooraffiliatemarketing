import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { structuredData } = await req.json();

    if (!structuredData) {
      return new Response(
        JSON.stringify({ error: 'Structured data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON if it's a string
    let jsonData;
    try {
      jsonData = typeof structuredData === 'string' 
        ? JSON.parse(structuredData) 
        : structuredData;
    } catch (parseError) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          errors: ['Invalid JSON syntax'],
          warnings: [],
          suggestions: ['Check for missing commas, brackets, or quotes']
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Valideer de volgende structured data (Schema.org JSON-LD) en geef gedetailleerde feedback:

${JSON.stringify(jsonData, null, 2)}

Analyseer op:
1. Schema.org compliance
2. Vereiste velden voor het type
3. Data types en formaten
4. Best practices
5. Mogelijke verbeteringen

Geef terug:
- Of het valid is
- Lijst van errors (critical issues)
- Lijst van warnings (non-critical issues)
- Lijst van suggestions voor verbetering`;

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
            content: 'Je bent een Schema.org expert die structured data valideert volgens de officiële specificaties.'
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
              name: 'validate_structured_data',
              description: 'Validate Schema.org structured data',
              parameters: {
                type: 'object',
                properties: {
                  valid: { type: 'boolean' },
                  errors: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  warnings: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  suggestions: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                },
                required: ['valid', 'errors', 'warnings', 'suggestions']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'validate_structured_data' } }
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

    return new Response(
      JSON.stringify({
        ...result,
        metadata: {
          validatedAt: new Date().toISOString(),
          schemaType: jsonData['@type'] || 'Unknown'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-structured-data function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
