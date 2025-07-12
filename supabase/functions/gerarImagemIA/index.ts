
// Edge Function: gerarImagemIA - Optimized Open-DALLE v1.1 Version
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
    console.log('🎨 Starting optimized Open-DALLE v1.1 generation...');
    
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Prompt inválido.' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar chave da API Replicate
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
    if (!REPLICATE_API_TOKEN) {
      return new Response(JSON.stringify({ success: false, error: 'API key não configurada.' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Inicializar cliente Replicate
    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });

    // Sistema Otimizado de Prompts
    const optimizePrompt = (originalPrompt: string): string => {
      console.log('🧠 Optimizing prompt for Open-DALLE v1.1...');
      
      // Análise contextual simplificada
      const context = {
        isMath: /math|geometric|número|forma|cálculo|equação|geometry|mathematical/i.test(originalPrompt),
        isScience: /science|biology|ciência|biologia|química|física|scientific|laboratory/i.test(originalPrompt),
        isHistory: /history|história|brasil|cultura|historical|cultural/i.test(originalPrompt),
        isGeography: /geography|geografia|mapa|região|geographical|landscape/i.test(originalPrompt),
        isElementary: /elementary|fundamental|criança|infantil|children|kids/i.test(originalPrompt),
        isBrazilian: /brazilian|brasil|cultura brasileira/i.test(originalPrompt)
      };

      // Prompt otimizado básico
      let optimizedPrompt = originalPrompt.trim();

      // Contexto educacional brasileiro
      if (!context.isBrazilian) {
        optimizedPrompt += ', Brazilian educational context';
      }

      // Especificações de disciplina
      if (context.isMath) {
        optimizedPrompt += ', clean geometric shapes, mathematical illustration';
      } else if (context.isScience) {
        optimizedPrompt += ', scientific illustration, natural elements';
      } else if (context.isHistory) {
        optimizedPrompt += ', Brazilian historical illustration, cultural elements';
      } else if (context.isGeography) {
        optimizedPrompt += ', Brazilian geographical illustration, landscape elements';
      }

      // Faixa etária apropriada
      if (context.isElementary) {
        optimizedPrompt += ', colorful and engaging for children, kid-friendly';
      }

      // Especificações visuais essenciais
      optimizedPrompt += ', high quality educational illustration, vibrant colors, clean design, detailed artwork';
      
      console.log('✨ Prompt optimized');
      return optimizedPrompt;
    };

    // Negative Prompt Consolidado
    const consolidatedNegativePrompt = [
      // Elementos textuais
      'text, words, letters, numbers, symbols, writing, typography, captions, labels, signs',
      'mathematical equations, formulas, calculations, watermarks, logos',
      
      // Qualidade baixa
      'low quality, blurry, pixelated, distorted, grainy, noisy, artifacts',
      'low resolution, poor quality, bad quality, amateur, unprofessional',
      
      // Elementos visuais indesejados
      'cluttered, messy, chaotic, confusing, dark, gloomy, scary, inappropriate',
      'deformed, malformed, broken, incomplete, wrong proportions',
      
      // Contextos inadequados
      'adult content, inappropriate themes, religious symbols, political content'
    ].join(', ');

    // Aplicar otimização
    const optimizedPrompt = optimizePrompt(prompt);

    console.log('🚀 Calling Open-DALLE v1.1 with optimized parameters...');
    
    // Parâmetros otimizados para velocidade e qualidade
    const output = await replicate.run(
      "lucataco/open-dalle-v1.1:1c7d4c8dec39c7306df7794b28419078cb9d18b9213ab1c21fdc46a1deca0144",
      {
        input: {
          prompt: optimizedPrompt,
          negative_prompt: consolidatedNegativePrompt,
          width: 512,
          height: 512,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 30, // Reduzido de 50 para 30 para maior velocidade
          scheduler: "K_EULER"
        }
      }
    );

    console.log('✅ Generation completed');
    
    if (!output) {
      throw new Error('Nenhuma resposta da API Replicate');
    }

    let imageUrl;
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      throw new Error('Formato de resposta inesperado da API');
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('URL da imagem inválida');
    }

    console.log('📥 Downloading and processing image...');
    
    // Sistema de download otimizado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // Reduzido timeout
    
    const imageResponse = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (EducationalBot/2.0)',
        'Accept': 'image/webp,image/*,*/*'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!imageResponse.ok) {
      throw new Error(`HTTP ${imageResponse.status}: ${imageResponse.statusText}`);
    }

    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageSizeKB = Math.round(imageArrayBuffer.byteLength / 1024);
    
    // Conversão otimizada para base64
    const uint8Array = new Uint8Array(imageArrayBuffer);
    
    // Detecção do formato
    let originalFormat = 'png';
    const signature = uint8Array.slice(0, 12);
    
    if (signature[0] === 0xFF && signature[1] === 0xD8) {
      originalFormat = 'jpeg';
    } else if (signature[0] === 0x52 && signature[1] === 0x49 && signature[2] === 0x46 && signature[3] === 0x46 &&
               signature[8] === 0x57 && signature[9] === 0x45 && signature[10] === 0x42 && signature[11] === 0x50) {
      originalFormat = 'webp';
    }
    
    // Conversão direta para base64
    const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
    const imageB64 = btoa(binaryString);
    
    const mimeType = originalFormat === 'webp' ? 'image/webp' : `image/${originalFormat}`;
    const imageDataUrl = `data:${mimeType};base64,${imageB64}`;
    
    console.log('🎨 Open-DALLE v1.1 optimized generation completed successfully!');
    
    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: imageDataUrl,
      imageData: imageB64,
      model: 'open-dalle-v1.1-optimized',
      optimizations: {
        promptOptimization: true,
        consolidatedNegativePrompt: true,
        reducedInferenceSteps: true,
        optimizedDownload: true,
        streamlinedProcessing: true
      },
      stats: {
        sizeKB: imageSizeKB,
        mimeType: mimeType,
        dimensions: '512x512',
        originalFormat: originalFormat,
        inferenceSteps: 30,
        guidanceScale: 7.5,
        scheduler: 'K_EULER'
      },
      textPlacementSuggestion: 'Utilize a área superior ou inferior da imagem para sobreposição de texto, mantendo o centro livre para o conteúdo visual principal.'
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error in optimized Open-DALLE v1.1:', error);
    
    // Sistema de fallback simplificado
    try {
      const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
      if (!REPLICATE_API_TOKEN) {
        throw new Error('API key not available for fallback');
      }

      const replicate = new Replicate({
        auth: REPLICATE_API_TOKEN,
      });

      const requestBody = await req.json();
      const originalPrompt = requestBody.prompt;
      
      // Prompt ultra-simplificado para fallback
      const simpleFallbackPrompt = `${originalPrompt.split('.')[0]}. Simple Brazilian educational illustration, clean design, visual only`;
      const simpleFallbackNegativePrompt = 'text, words, letters, numbers, low quality, blurry';

      console.log('🔄 Attempting simple fallback...');
      const fallbackOutput = await replicate.run(
        "lucataco/open-dalle-v1.1:1c7d4c8dec39c7306df7794b28419078cb9d18b9213ab1c21fdc46a1deca0144",
        {
          input: {
            prompt: simpleFallbackPrompt,
            negative_prompt: simpleFallbackNegativePrompt,
            width: 512,
            height: 512,
            num_outputs: 1,
            guidance_scale: 7.0,
            num_inference_steps: 20
          }
        }
      );

      if (fallbackOutput && Array.isArray(fallbackOutput) && fallbackOutput[0]) {
        const fallbackImageUrl = fallbackOutput[0];
        
        const fallbackResponse = await fetch(fallbackImageUrl);
        if (fallbackResponse.ok) {
          const fallbackArrayBuffer = await fallbackResponse.arrayBuffer();
          const fallbackUint8Array = new Uint8Array(fallbackArrayBuffer);
          
          const fallbackBinaryString = Array.from(fallbackUint8Array, byte => String.fromCharCode(byte)).join('');
          const fallbackB64 = btoa(fallbackBinaryString);
          const fallbackDataUrl = `data:image/png;base64,${fallbackB64}`;
          
          console.log('🆘 Fallback completed successfully');
          
          return new Response(JSON.stringify({ 
            success: true, 
            imageUrl: fallbackDataUrl,
            imageData: fallbackB64,
            model: 'open-dalle-v1.1-fallback',
            fallback: true,
            warning: 'Generated using simplified fallback due to primary generation failure'
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
      error: `Erro na geração com Open-DALLE v1.1: ${error.message}`,
      errorType: error.constructor.name,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
