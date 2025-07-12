
// Edge Function: gerarImagemIA
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Replicate from "https://esm.sh/replicate@0.30.0";

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
    console.log('🎨 Starting image generation process...');
    console.log('📝 Original prompt:', prompt?.substring(0, 100) + '...');
    
    if (!prompt || typeof prompt !== 'string') {
      console.error('❌ Invalid prompt provided:', typeof prompt);
      return new Response(JSON.stringify({ success: false, error: 'Prompt inválido.' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar chave da API Replicate
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
    if (!REPLICATE_API_TOKEN) {
      console.error('❌ Replicate API key not configured');
      return new Response(JSON.stringify({ success: false, error: 'API key não configurada.' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔑 API key found, initializing Replicate client...');

    // Inicializar cliente Replicate
    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });

    // Otimizar prompt com estrutura mais robusta contra texto
    const optimizedPrompt = `${prompt}. High quality educational illustration, clean design, vibrant colors, professional artwork, detailed visual elements, Brazilian educational context, no text, no words, no letters`;

    // Prompt negativo robusto específico contra texto
    const negativePrompt = "text, letters, words, writing, alphabet, numbers, symbols, typography, captions, labels, signs, watermarks, logos, inscriptions, script, handwriting, printed text, digital text, overlaid text, embedded text, readable characters, linguistic elements, textual content, written language, font, typeface, book, newspaper, document, paper with text";

    console.log('📞 Calling Replicate API with optimized SDXL parameters...');
    console.log('🎯 Optimized prompt:', optimizedPrompt.substring(0, 150) + '...');
    
    // Usar Stable Diffusion XL com parâmetros simplificados e testados
    const output = await replicate.run(
      "stability-ai/stable-diffusion-xl-base-1.0",
      {
        input: {
          prompt: optimizedPrompt,
          negative_prompt: negativePrompt,
          width: 1024,
          height: 1024,
          num_outputs: 1,
          scheduler: "DPMSolverMultistep",
          num_inference_steps: 20,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    );

    console.log('✅ SDXL API call completed');
    console.log('📦 Raw output type:', typeof output);
    console.log('📦 Raw output:', JSON.stringify(output).substring(0, 200) + '...');
    
    if (!output) {
      console.error('❌ No output from Replicate API');
      throw new Error('Nenhuma resposta da API Replicate');
    }

    let imageUrl;
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
      console.log('📸 Image URL from array:', imageUrl);
    } else if (typeof output === 'string') {
      imageUrl = output;
      console.log('📸 Image URL from string:', imageUrl);
    } else {
      console.error('❌ Unexpected output format:', output);
      throw new Error('Formato de resposta inesperado da API');
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('❌ Invalid image URL:', imageUrl);
      throw new Error('URL da imagem inválida');
    }

    console.log('📥 Downloading image from URL:', imageUrl.substring(0, 50) + '...');
    
    // Baixar a imagem com timeout e retry
    let imageResponse;
    let retries = 3;
    while (retries > 0) {
      try {
        console.log(`📡 Attempting download (${4 - retries}/3)...`);
        imageResponse = await fetch(imageUrl, {
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });
        
        if (imageResponse.ok) {
          break;
        } else {
          console.warn(`⚠️ Download attempt failed with status: ${imageResponse.status}`);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          }
        }
      } catch (error) {
        console.warn(`⚠️ Download attempt failed with error:`, error.message);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        }
      }
    }

    if (!imageResponse || !imageResponse.ok) {
      console.error('❌ Failed to download image after all retries');
      throw new Error('Falha ao baixar imagem gerada');
    }

    console.log('✅ Image downloaded successfully');
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    console.log('📦 Image size:', imageArrayBuffer.byteLength, 'bytes');
    
    // Conversão otimizada para base64 usando TextDecoder
    const uint8Array = new Uint8Array(imageArrayBuffer);
    console.log('🔄 Converting to base64...');
    
    // Método mais eficiente para conversão
    const chunks = [];
    const chunkSize = 0x8000; // 32KB chunks
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      chunks.push(String.fromCharCode.apply(null, Array.from(uint8Array.subarray(i, i + chunkSize))));
    }
    const binaryString = chunks.join('');
    const imageB64 = btoa(binaryString);
    
    console.log('✅ Base64 conversion completed, length:', imageB64.length);
    
    // Detectar formato da imagem
    let mimeType = 'image/png'; // Default
    if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
      mimeType = 'image/jpeg';
    } else if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50) {
      mimeType = 'image/png';
    } else if (uint8Array[0] === 0x47 && uint8Array[1] === 0x49) {
      mimeType = 'image/gif';
    } else if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49) {
      mimeType = 'image/webp';
    }
    
    const imageDataUrl = `data:${mimeType};base64,${imageB64}`;
    
    console.log('🎨 Image generation completed successfully!');
    console.log('📊 Final stats:');
    console.log('  - Model: stability-ai/stable-diffusion-xl-base-1.0');
    console.log('  - Size:', imageArrayBuffer.byteLength, 'bytes');
    console.log('  - Format:', mimeType);
    console.log('  - Base64 length:', imageB64.length);
    console.log('  - Anti-text measures: Advanced negative prompting');
    
    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: imageDataUrl,
      imageData: imageB64,
      model: 'stable-diffusion-xl-base-1.0',
      antiTextMeasures: true,
      stats: {
        sizeBytes: imageArrayBuffer.byteLength,
        mimeType: mimeType,
        base64Length: imageB64.length
      }
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Critical error in gerarImagemIA function:', error);
    console.error('📋 Error details:');
    console.error('  - Name:', error.name);
    console.error('  - Message:', error.message);
    console.error('  - Stack:', error.stack);
    
    // Fallback: Try simpler Flux model as backup
    try {
      console.log('🔄 Attempting fallback with Flux model...');
      
      const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
      if (!REPLICATE_API_TOKEN) {
        throw new Error('API key not available for fallback');
      }

      const replicate = new Replicate({
        auth: REPLICATE_API_TOKEN,
      });

      const { prompt } = await req.json();
      const simplePrompt = `${prompt}. Educational illustration, no text, clean design`;

      console.log('📞 Calling Flux fallback model...');
      const fallbackOutput = await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: simplePrompt,
            go_fast: true,
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "png",
            output_quality: 90
          }
        }
      );

      console.log('✅ Fallback model succeeded');
      
      if (fallbackOutput && Array.isArray(fallbackOutput) && fallbackOutput[0]) {
        const fallbackImageUrl = fallbackOutput[0];
        
        // Simple download and conversion for fallback
        const fallbackResponse = await fetch(fallbackImageUrl);
        if (fallbackResponse.ok) {
          const fallbackArrayBuffer = await fallbackResponse.arrayBuffer();
          const fallbackUint8Array = new Uint8Array(fallbackArrayBuffer);
          const fallbackBinaryString = Array.from(fallbackUint8Array, byte => String.fromCharCode(byte)).join('');
          const fallbackB64 = btoa(fallbackBinaryString);
          const fallbackDataUrl = `data:image/png;base64,${fallbackB64}`;
          
          console.log('🎨 Fallback image generation completed');
          
          return new Response(JSON.stringify({ 
            success: true, 
            imageUrl: fallbackDataUrl,
            imageData: fallbackB64,
            model: 'flux-schnell-fallback',
            fallback: true
          }), { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Erro na geração: ${error.message}`,
      details: error.name
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
