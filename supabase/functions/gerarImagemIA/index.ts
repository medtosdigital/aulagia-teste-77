
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎨 Starting image generation');
    
    const { prompt } = await req.json();
    
    if (!prompt || typeof prompt !== 'string') {
      console.error('❌ Invalid prompt:', prompt);
      return new Response(
        JSON.stringify({ success: false, error: 'Prompt inválido.' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate OpenAI API key
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'API key não configurada.' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🖼️ Generating image with prompt:', prompt.substring(0, 100) + '...');

    // Call OpenAI Images API (DALL-E 3)
    const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${prompt}. Estilo: educativo, colorido, adequado para crianças, ilustração didática, sem texto`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ OpenAI API error:', openaiResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
    }

    const imageData = await openaiResponse.json();
    console.log('✅ OpenAI image response received');

    // Extract image URL
    const imageUrl = imageData.data?.[0]?.url;
    
    if (!imageUrl) {
      console.error('❌ No image URL in response:', imageData);
      return new Response(
        JSON.stringify({ success: false, error: 'Imagem não gerada - URL não encontrada.' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Image generated successfully:', imageUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: imageUrl 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error in gerarImagemIA:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro desconhecido ao gerar imagem' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
