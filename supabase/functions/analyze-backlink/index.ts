import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BacklinkAnalysisRequest {
  sourceUrl: string;
  sourceDomain: string;
  anchorText?: string;
  pageTitle?: string;
  contextSnippet?: string;
  postTitle?: string;
  postContent?: string;
}

interface BacklinkQualityMetrics {
  domainAuthority: number;
  spamScore: number;
  relevanceScore: number;
  trafficEstimate: number;
  qualityRating: 'excellent' | 'good' | 'fair' | 'poor';
  insights: string[];
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      sourceUrl, 
      sourceDomain, 
      anchorText, 
      pageTitle, 
      contextSnippet,
      postTitle,
      postContent 
    } = await req.json() as BacklinkAnalysisRequest;

    if (!sourceUrl || !sourceDomain) {
      return new Response(
        JSON.stringify({ error: 'Source URL and domain are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI to analyze backlink quality
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Je bent een SEO expert gespecialiseerd in backlink analyse en kwaliteitsbeoordeling.

Analyseer de gegeven backlink informatie en bepaal de kwaliteit op basis van:
1. Domain Authority (DA) - geschatte autoriteit van het linking domain (0-100)
2. Spam Score - waarschijnlijkheid dat het domain spam is (0-100, lager is beter)
3. Relevance Score - hoe relevant is de linking page voor de gelinkte content (0-100)
4. Traffic Estimate - geschat maandelijks organisch verkeer naar het domain

Geef ook:
- Een overall quality rating (excellent/good/fair/poor)
- Concrete insights over de backlink kwaliteit
- Aanbevelingen voor verbeteringen

Retourneer ALLEEN een JSON object zonder extra tekst of markdown formatting.`;

    const userPrompt = `Analyseer deze backlink:

Source URL: ${sourceUrl}
Source Domain: ${sourceDomain}
${anchorText ? `Anchor Text: ${anchorText}` : ''}
${pageTitle ? `Page Title: ${pageTitle}` : ''}
${contextSnippet ? `Context: ${contextSnippet}` : ''}

${postTitle ? `Gelinkte content titel: ${postTitle}` : ''}
${postContent ? `Gelinkte content (eerste 500 karakters): ${postContent.substring(0, 500)}` : ''}

Genereer een analyse in dit JSON formaat:
{
  "domainAuthority": 65,
  "spamScore": 15,
  "relevanceScore": 82,
  "trafficEstimate": 15000,
  "qualityRating": "good",
  "insights": [
    "Domain heeft een goede autoriteit in de niche",
    "Link komt van een relevante pagina",
    "Anchor text is natuurlijk en contextual"
  ],
  "recommendations": [
    "Monitor deze backlink regelmatig voor behoud",
    "Probeer meer backlinks van vergelijkbare domeinen te verkrijgen"
  ]
}`;

    console.log('Calling AI for backlink analysis');
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
        JSON.stringify({ error: 'Failed to analyze backlink quality' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    // Parse AI response
    let analysis: BacklinkQualityMetrics;
    try {
      const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse analysis',
          domainAuthority: 50,
          spamScore: 50,
          relevanceScore: 50,
          trafficEstimate: 0,
          qualityRating: 'fair',
          insights: ['Automatische analyse niet beschikbaar'],
          recommendations: ['Voer handmatige controle uit']
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-backlink function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
