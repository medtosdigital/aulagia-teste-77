
// Edge Function: gerarImagemIA
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Replicate from "https://esm.sh/replicate@0.25.2";

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

    // Chave da Replicate deve ser configurada como variável de ambiente segura
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_TOKEN');
    if (!REPLICATE_API_KEY) {
      console.error('❌ Replicate API key not configured');
      return new Response(JSON.stringify({ success: false, error: 'API key não configurada.' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Inicializar cliente Replicate
    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    // Melhorar o prompt com estilo educacional consistente
    const enhancedPrompt = `${prompt.substring(0, 800)}. Clean, colorful, child-friendly educational illustration, no text, no words, no letters, simple educational style, with a soft golden or light golden background, warm tones, elegant but playful look, consistent lighting, high-resolution, professional educational content, vibrant colors, suitable for children`;

    console.log('📞 Calling Replicate API with Stable Diffusion...');
    
    // Usar Stable Diffusion com configurações otimizadas para conteúdo educacional
    const output = await replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      {
        input: {
          prompt: enhancedPrompt,
          width: 512,
          height: 512,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          scheduler: "DPMSolverMultistep",
          num_outputs: 1,
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    );

    console.log('✅ Replicate response received');
    
    if (!output || !Array.isArray(output) || output.length === 0) {
      console.error('❌ No image data in response:', output);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Imagem não gerada.' 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const imageUrl = output[0];
    
    // Baixar a imagem e converter para base64 para manter compatibilidade
    console.log('📥 Converting image to base64...');
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error('❌ Failed to fetch generated image');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erro ao baixar imagem gerada.' 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageB64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const imageDataUrl = `data:image/png;base64,${imageB64}`;
    
    console.log('🎨 Image generated successfully with Replicate');
    
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
