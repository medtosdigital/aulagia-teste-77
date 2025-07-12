
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

    // Melhorar o prompt com estilo educacional consistente
    const enhancedPrompt = `${prompt.substring(0, 800)}. Clean, colorful, child-friendly educational illustration, no text, no words, no letters, simple educational style, with a soft golden or light golden background, warm tones, elegant but playful look, consistent lighting, high-resolution, professional educational content, vibrant colors, suitable for children`;

    console.log('📞 Calling Replicate API with FLUX model...');
    
    // Usar FLUX model que é mais estável e confiável
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: enhancedPrompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: 4
        }
      }
    );

    console.log('✅ Replicate response received:', output);
    
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
    
    // Baixar a imagem e converter para base64 para manter compatibilidade
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
    
    // Melhor conversão para base64
    const uint8Array = new Uint8Array(imageArrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const imageB64 = btoa(binaryString);
    
    // Detectar formato da imagem baseado no cabeçalho
    let mimeType = 'image/webp'; // Default para FLUX
    if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
      mimeType = 'image/jpeg';
    } else if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50) {
      mimeType = 'image/png';
    }
    
    const imageDataUrl = `data:${mimeType};base64,${imageB64}`;
    
    console.log('🎨 Image generated successfully with Replicate FLUX model');
    console.log('📊 Image stats - Size:', imageArrayBuffer.byteLength, 'bytes, Type:', mimeType);
    
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
