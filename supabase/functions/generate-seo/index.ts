import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, excerpt } = await req.json();

    console.log('Generate SEO request for:', title);

    if (!title) {
      throw new Error('Title is required');
    }

    const prompt = `Generate SEO metadata for a blog post with title: "${title}"
${excerpt ? `\nExisting excerpt: "${excerpt}"` : ''}

Generate the following (respond in JSON format):

1. excerpt: 2-3 sentences summarizing the article (150-200 characters)
2. altText: Descriptive alt text for a blog header image (max 125 characters)
3. metaTitle: SEO-optimized title tag (55-60 characters, include main keyword)
4. metaDescription: Compelling meta description (150-160 characters, include call-to-action)

REQUIREMENTS:
- All content must be within character limits (STRICT)
- Natural language, avoid keyword stuffing
- Compelling and click-worthy
- Business/professional tone
- Include power words where appropriate
${excerpt ? '- Use existing excerpt as reference but optimize for SEO' : '- Create engaging excerpt that hooks readers'}

Respond ONLY with valid JSON in this exact format:
{
  "excerpt": "...",
  "altText": "...",
  "metaTitle": "...",
  "metaDescription": "..."
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are an SEO expert specializing in metadata optimization. Always respond with valid JSON only. Strictly adhere to character limits.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', response.status, error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let generatedContent = data.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    generatedContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const seoData = JSON.parse(generatedContent);

    // Validate and enforce character limits
    const result = {
      excerpt: seoData.excerpt.substring(0, 200),
      altText: seoData.altText.substring(0, 125),
      metaTitle: seoData.metaTitle.substring(0, 60),
      metaDescription: seoData.metaDescription.substring(0, 160),
    };

    console.log('SEO metadata generated:', {
      excerptLength: result.excerpt.length,
      altTextLength: result.altText.length,
      metaTitleLength: result.metaTitle.length,
      metaDescriptionLength: result.metaDescription.length,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-seo function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'SEO_GENERATION_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
