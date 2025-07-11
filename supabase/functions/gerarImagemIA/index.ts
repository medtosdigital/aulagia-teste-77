
// Edge Function: gerarImagemIA
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
    const { prompt } = await req.json();
    console.log('🎨 Generating image with prompt:', prompt);
    
    if (!prompt || typeof prompt !== 'string') {
      console.error('❌ Invalid prompt provided');
      return new Response(JSON.stringify({ success: false, error: 'Prompt inválido.' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Chave da OpenAI deve ser configurada como variável de ambiente segura
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured');
      return new Response(JSON.stringify({ success: false, error: 'API key não configurada.' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Usar a API correta de geração de imagens do OpenAI (DALL-E)
    console.log('📞 Calling OpenAI Images API...');
    const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-2', // Usar DALL-E 2 que é mais rápido e barato
        prompt: prompt.substring(0, 1000), // Limitar prompt para DALL-E 2
        n: 1,
        size: '512x512', // Tamanho fixo para consistência
        response_format: 'url'
      })
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error('❌ OpenAI API error:', openaiRes.status, errorText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erro na OpenAI: ' + errorText 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await openaiRes.json();
    console.log('✅ OpenAI response received');
    
    // Extrair URL da imagem gerada
    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('❌ No image URL in response:', data);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Imagem não gerada.' 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const imageUrl = data.data[0].url;
    console.log('🎨 Image generated successfully:', imageUrl);
    
    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: imageUrl 
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error in gerarImagemIA function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
