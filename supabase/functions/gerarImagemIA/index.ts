
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

    // Usar DALL-E 3 com configurações otimizadas para qualidade e custo
    console.log('📞 Calling OpenAI Images API with DALL-E 3...');
    const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${prompt.substring(0, 900)}. Clean educational illustration, no text, no words, no letters, simple and clear visual style, child-friendly colors, professional educational content`, // Melhor prompt sem texto
        n: 1,
        size: '1024x1024', // Tamanho padrão otimizado
        quality: 'standard', // Usar qualidade padrão para reduzir custo
        style: 'natural', // Estilo mais natural e educativo
        response_format: 'b64_json' // Usar base64 para melhor controle
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
    
    // Extrair dados da imagem gerada
    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
      console.error('❌ No image data in response:', data);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Imagem não gerada.' 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const imageB64 = data.data[0].b64_json;
    const imageDataUrl = `data:image/png;base64,${imageB64}`;
    
    console.log('🎨 Image generated successfully');
    
    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: imageDataUrl,
      imageData: imageB64 // Incluir dados base64 para salvamento
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
