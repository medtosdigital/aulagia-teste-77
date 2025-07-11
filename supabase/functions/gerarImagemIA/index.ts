
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
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Prompt inválido.' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Chave da OpenAI deve ser configurada como variável de ambiente segura
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'API key não configurada.' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📸 Generating image with prompt:', prompt);

    const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        output_format: 'png'
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      console.error('❌ OpenAI API error:', err);
      return new Response(JSON.stringify({ success: false, error: 'Erro na OpenAI: ' + err }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await openaiRes.json();
    console.log('✅ OpenAI response received');
    
    // Para gpt-image-1, a resposta vem diretamente no formato base64
    if (data.data && data.data[0] && data.data[0].b64_json) {
      const imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
      console.log('✅ Image generated successfully');
      return new Response(JSON.stringify({ success: true, imageUrl }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Fallback para outros modelos que retornam URL
    if (data.data && data.data[0] && data.data[0].url) {
      console.log('✅ Image generated successfully');
      return new Response(JSON.stringify({ success: true, imageUrl: data.data[0].url }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.error('❌ No image data in response:', data);
    return new Response(JSON.stringify({ success: false, error: 'Imagem não gerada.' }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('❌ Error in gerarImagemIA function:', e);
    return new Response(JSON.stringify({ success: false, error: e.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
