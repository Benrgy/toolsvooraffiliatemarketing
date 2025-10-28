import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateContentRequest {
  title: string;
  wordCount: 500 | 750 | 1000 | 1250 | 1500;
  keywords: string[];
  includeFAQ: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, wordCount, keywords, includeFAQ }: GenerateContentRequest = await req.json();

    console.log('Generate content request:', { title, wordCount, keywords: keywords.length, includeFAQ });

    // Validate inputs
    if (!title) {
      throw new Error('Title is required');
    }

    if (keywords.length > 5) {
      throw new Error('Maximum 5 keywords allowed');
    }

    // Calculate section word targets
    const introWords = Math.floor(wordCount * 0.10); // 10%
    const mainWords = Math.floor(wordCount * (includeFAQ ? 0.60 : 0.75)); // 60-75%
    const faqWords = includeFAQ ? Math.floor(wordCount * 0.15) : 0; // 15%
    const conclusionWords = Math.floor(wordCount * 0.10); // 10%

    // Build prompt
    const keywordsText = keywords.length > 0 
      ? `SEO Keywords to naturally incorporate: ${keywords.join(', ')}`
      : '';

    const prompt = `Write a professional blog post about: "${title}"

TARGET WORD COUNT: ${wordCount} words (strict requirement: within ±5%)

CONTENT STRUCTURE:
1. Introduction (${introWords} words): Hook the reader and introduce the topic
2. Main Content (${mainWords} words): 3-4 detailed sections with headers
${includeFAQ ? `3. FAQ Section (${faqWords} words): 3-4 common questions with answers` : ''}
${includeFAQ ? '4' : '3'}. Conclusion (${conclusionWords} words): Summary with strong call-to-action

${keywordsText}

REQUIREMENTS:
- Use markdown formatting (##, ###, **, -, etc.)
- Professional, engaging tone for business audience
- Each main section should have a clear H2 heading
- Include actionable insights and practical advice
- Natural keyword integration (avoid keyword stuffing)
${keywords.length > 0 ? `- All keywords MUST appear in the content at least once` : ''}
- FAQ questions should use H3 headings if included

Write the complete blog post in markdown:`;

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
            content: 'You are an expert blog content writer specializing in business and AI automation content. Write engaging, SEO-optimized content that provides real value.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: Math.ceil(wordCount * 1.8), // Allow buffer for content generation
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', response.status, error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Count words
    const actualWordCount = generatedContent.trim().split(/\s+/).length;

    // Validate word count tolerance
    const tolerance = wordCount * 0.05; // 5% tolerance
    const warningTolerance = wordCount * 0.10; // 10% warning threshold

    if (Math.abs(actualWordCount - wordCount) > warningTolerance) {
      console.warn(`Word count outside tolerance: ${actualWordCount} vs ${wordCount} (±10%)`);
    }

    // Verify keywords usage
    const keywordsUsed: string[] = [];
    const contentLower = generatedContent.toLowerCase();
    
    keywords.forEach(keyword => {
      if (contentLower.includes(keyword.toLowerCase())) {
        keywordsUsed.push(keyword);
      }
    });

    if (keywords.length > 0 && keywordsUsed.length < keywords.length) {
      console.warn(`Not all keywords found in content: ${keywordsUsed.length}/${keywords.length}`);
    }

    console.log('Content generated successfully:', {
      targetWords: wordCount,
      actualWords: actualWordCount,
      variance: `${((actualWordCount - wordCount) / wordCount * 100).toFixed(1)}%`,
      keywordsUsed: keywordsUsed.length
    });

    return new Response(JSON.stringify({
      content: generatedContent,
      wordCount: actualWordCount,
      keywordsUsed: keywordsUsed,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'CONTENT_GENERATION_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
