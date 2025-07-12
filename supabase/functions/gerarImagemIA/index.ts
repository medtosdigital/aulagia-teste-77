
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
    console.log('🎨 Generating image with optimized SDXL model:', prompt.substring(0, 100) + '...');
    
    if (!prompt || typeof prompt !== 'string') {
      console.error('❌ Invalid prompt provided');
      return new Response(JSON.stringify({ success: false, error: 'Prompt inválido.' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Chave da Replicate deve ser configurada como variável de ambiente segura
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
    if (!REPLICATE_API_TOKEN) {
      console.error('❌ Replicate API key not configured');
      return new Response(JSON.stringify({ success: false, error: 'API key não configurada.' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Inicializar cliente Replicate
    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });

    // Otimizar prompt com estrutura mais robusta contra texto
    const optimizedPrompt = `${prompt}. High quality illustration, clean design, educational style, vibrant colors, professional artwork, detailed visual elements, Brazilian educational context`;

    // Prompt negativo robusto específico contra texto
    const negativePrompt = "text, letters, words, writing, alphabet, numbers, symbols, typography, captions, labels, signs, watermarks, logos, inscriptions, script, handwriting, printed text, digital text, overlaid text, embedded text, readable characters, linguistic elements, textual content, written language, font, typeface";

    console.log('📞 Calling Replicate API with Stable Diffusion XL...');
    
    // Usar Stable Diffusion XL com parâmetros otimizados
    const output = await replicate.run(
      "stability-ai/stable-diffusion-xl-base-1.0",
      {
        input: {
          prompt: optimizedPrompt,
          negative_prompt: negativePrompt,
          width: 1024,
          height: 1024,
          num_outputs: 1,
          scheduler: "K_DPM_2_ANCESTRAL",
          num_inference_steps: 25,
          guidance_scale: 8.0,
          prompt_strength: 0.9,
          seed: Math.floor(Math.random() * 1000000),
          refine: "expert_ensemble_refiner",
          high_noise_frac: 0.8
        }
      }
    );

    console.log('✅ SDXL response received:', output);
    
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
    console.log('📥 Image URL received:', imageUrl);
    
    // Baixar a imagem e converter para base64
    console.log('📥 Converting image to base64...');
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error('❌ Failed to fetch generated image:', imageResponse.status, imageResponse.statusText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erro ao baixar imagem gerada.' 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const imageArrayBuffer = await imageResponse.arrayBuffer();
    console.log('📦 Image downloaded, size:', imageArrayBuffer.byteLength, 'bytes');
    
    // Conversão otimizada para base64
    const uint8Array = new Uint8Array(imageArrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const imageB64 = btoa(binaryString);
    
    // Detectar formato da imagem baseado no cabeçalho
    let mimeType = 'image/png'; // Default para SDXL
    if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
      mimeType = 'image/jpeg';
    } else if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50) {
      mimeType = 'image/png';
    }
    
    const imageDataUrl = `data:${mimeType};base64,${imageB64}`;
    
    console.log('🎨 Image generated successfully with Stable Diffusion XL');
    console.log('📊 Image stats - Size:', imageArrayBuffer.byteLength, 'bytes, Type:', mimeType);
    console.log('🚫 Anti-text measures applied: Negative prompt + SDXL model');
    
    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: imageDataUrl,
      imageData: imageB64,
      model: 'stable-diffusion-xl-base-1.0',
      antiTextMeasures: true
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error in gerarImagemIA function:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Erro na geração: ${error.message}` 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
