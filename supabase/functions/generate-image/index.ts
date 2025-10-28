import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title } = await req.json();

    console.log('Generate image request for:', title);

    if (!title) {
      throw new Error('Title is required');
    }

    // Generate image prompt
    const imagePrompt = `Professional blog header image for "${title}". 
Modern corporate aesthetic, ultra-realistic, clean composition. 
Business and AI automation theme, high quality, professional photography style. 
Suitable for a business blog article header.`;

    console.log('Generating image with DALL-E 3...');

    // Call DALL-E 3 API
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'url',
      }),
    });

    if (!imageResponse.ok) {
      const error = await imageResponse.text();
      console.error('DALL-E API error:', imageResponse.status, error);
      throw new Error(`DALL-E API error: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.data[0].url;

    console.log('Image generated, downloading...');

    // Download the generated image
    const imageDownload = await fetch(imageUrl);
    const imageBlob = await imageDownload.arrayBuffer();

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
    const filename = `blog-${sanitizedTitle}-${timestamp}.png`;

    console.log('Uploading to storage:', filename);

    // Upload to Supabase Storage
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filename, imageBlob, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filename);

    console.log('Image uploaded successfully:', publicUrl);

    // Generate alt text with GPT-4o
    console.log('Generating alt text...');
    
    const altTextResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'Generate concise, descriptive alt text for blog images. Maximum 125 characters. Focus on what the image shows and its relevance to the article topic.' 
          },
          { 
            role: 'user', 
            content: `Generate alt text for a blog header image about: "${title}". The image shows a professional, modern business/AI automation themed visual.` 
          }
        ],
        temperature: 0.7,
        max_tokens: 50,
      }),
    });

    if (!altTextResponse.ok) {
      console.error('Alt text generation failed, using fallback');
    }

    const altTextData = await altTextResponse.json();
    const altText = altTextData.choices[0].message.content.trim().substring(0, 125);

    console.log('Alt text generated:', altText);

    return new Response(JSON.stringify({
      imageUrl: publicUrl,
      altText: altText,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'IMAGE_GENERATION_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
