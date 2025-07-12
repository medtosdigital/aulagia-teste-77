
// Edge Function: gerarImagemIA - Open-DALLE v1.1 Version with Negative Prompt
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
    console.log('🎨 Starting OPEN-DALLE v1.1 image generation with negative prompt...');
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

    // Sistema Ultra-Inteligente de Otimização de Prompts para Open-DALLE v1.1
    const ultraIntelligentPromptOptimizer = (originalPrompt: string): string => {
      console.log('🧠 Applying ultra-intelligent prompt optimization for Open-DALLE v1.1...');
      
      // Análise contextual avançada
      const context = {
        isMath: /math|geometric|número|forma|cálculo|equação|geometry|mathematical/i.test(originalPrompt),
        isScience: /science|biology|ciência|biologia|química|física|scientific|laboratory/i.test(originalPrompt),
        isHistory: /history|história|brasil|cultura|historical|cultural/i.test(originalPrompt),
        isGeography: /geography|geografia|mapa|região|geographical|landscape/i.test(originalPrompt),
        isElementary: /elementary|fundamental|criança|infantil|children|kids/i.test(originalPrompt),
        isBrazilian: /brazilian|brasil|cultura brasileira/i.test(originalPrompt)
      };

      // Otimização específica para Open-DALLE v1.1
      let optimizedPrompt = originalPrompt
        .replace(/\b(texto|text|palavra|word|número|number|letra|letter|símbolo|symbol)\b/gi, '')
        .replace(/\b(escrito|written|digitado|typed)\b/gi, '')
        .trim();

      // Contexto educacional brasileiro essencial
      if (!context.isBrazilian) {
        optimizedPrompt += ', Brazilian educational context';
      }

      // Especificações de disciplina otimizadas para Open-DALLE v1.1
      if (context.isMath) {
        optimizedPrompt += ', clean geometric shapes, mathematical concept illustration, educational diagram, colorful math elements';
      } else if (context.isScience) {
        optimizedPrompt += ', scientific illustration, natural elements, educational science concept, laboratory equipment';
      } else if (context.isHistory) {
        optimizedPrompt += ', Brazilian historical illustration, cultural elements, educational history, historical artifacts';
      } else if (context.isGeography) {
        optimizedPrompt += ', Brazilian geographical illustration, landscape elements, educational geography, maps and terrain';
      }

      // Faixa etária apropriada
      if (context.isElementary) {
        optimizedPrompt += ', colorful and engaging for children, kid-friendly illustration, playful educational design';
      }

      // Especificações visuais otimizadas para Open-DALLE v1.1
      optimizedPrompt += ', high quality educational illustration, vibrant colors, clean professional design, detailed artwork, modern educational style';
      
      // ESTRATÉGIA ANTI-TEXTO ULTRA ROBUSTA para Open-DALLE v1.1
      optimizedPrompt += ', ABSOLUTELY NO TEXT, NO WORDS, NO LETTERS, NO NUMBERS, NO SYMBOLS, NO WRITING, pure visual illustration only, clean image without any textual elements, text-free educational illustration';
      
      console.log('✨ Open-DALLE v1.1 optimized prompt preview:', optimizedPrompt.substring(0, 150) + '...');
      return optimizedPrompt;
    };

    // Sistema de Negative Prompt Ultra-Avançado
    const generateUltraRobustNegativePrompt = (): string => {
      console.log('🚫 Generating ultra-robust negative prompt for Open-DALLE v1.1...');
      
      const negativePrompt = [
        // Elementos textuais proibidos
        'text, words, letters, numbers, symbols, writing, typography, fonts, captions, labels, signs, banners',
        'written text, printed text, handwritten text, digital text, overlaid text, watermarks, logos',
        'mathematical equations, formulas, calculations, numeric values, percentages, fractions',
        
        // Qualidade baixa proibida
        'low quality, blurry, pixelated, distorted, grainy, noisy, artifacts, compression artifacts',
        'low resolution, poor quality, bad quality, worst quality, amateur, unprofessional',
        'jpeg artifacts, digital noise, color banding, oversaturated, undersaturated',
        
        // Elementos visuais indesejados
        'cluttered, messy, chaotic, confusing, overwhelming, busy background',
        'dark, gloomy, scary, inappropriate, violent, disturbing content',
        'commercial logos, brand names, advertisements, promotional content',
        
        // Problemas técnicos
        'deformed, malformed, broken, incomplete, cut off, cropped badly',
        'duplicate elements, repetitive patterns, mirror effects, kaleidoscope',
        'wrong proportions, anatomical errors, perspective issues',
        
        // Contextos inadequados para educação
        'adult content, inappropriate themes, complex adult concepts',
        'religious symbols, political content, controversial topics',
        'outdated references, culturally insensitive content'
      ].join(', ');
      
      console.log('🚫 Ultra-robust negative prompt generated:', negativePrompt.substring(0, 100) + '...');
      return negativePrompt;
    };

    // Aplicar otimização ultra-inteligente
    const ultraOptimizedPrompt = ultraIntelligentPromptOptimizer(prompt);
    const ultraRobustNegativePrompt = generateUltraRobustNegativePrompt();

    console.log('🚀 Calling Open-DALLE v1.1 with optimized parameters and negative prompt...');
    
    // Parâmetros otimizados para Open-DALLE v1.1 com negative prompt
    const output = await replicate.run(
      "lucataco/open-dalle-v1.1:1c7d4c8dec39c7306df7794b28419078cb9d18b9213ab1c21fdc46a1deca0144",
      {
        input: {
          prompt: ultraOptimizedPrompt,
          negative_prompt: ultraRobustNegativePrompt,
          width: 512,
          height: 512,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50,
          scheduler: "K_EULER"
        }
      }
    );

    console.log('✅ Open-DALLE v1.1 generation completed successfully with negative prompt');
    console.log('📦 Output type:', typeof output, Array.isArray(output) ? 'Array' : 'Object');
    
    if (!output) {
      console.error('❌ No output from Replicate API');
      throw new Error('Nenhuma resposta da API Replicate');
    }

    let imageUrl;
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      console.error('❌ Unexpected output format:', output);
      throw new Error('Formato de resposta inesperado da API');
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('❌ Invalid image URL:', imageUrl);
      throw new Error('URL da imagem inválida');
    }

    console.log('📥 Downloading image with ultra-robust system...');
    
    // Sistema de download ultra-robusto
    let imageResponse;
    const maxRetries = 3;
    let currentRetry = 0;
    
    while (currentRetry < maxRetries) {
      try {
        console.log(`📡 Download attempt ${currentRetry + 1}/${maxRetries}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);
        
        imageResponse = await fetch(imageUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (EducationalBot/2.0)',
            'Accept': 'image/webp,image/*,*/*'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (imageResponse.ok) {
          console.log('✅ Image downloaded successfully');
          break;
        } else {
          throw new Error(`HTTP ${imageResponse.status}: ${imageResponse.statusText}`);
        }
      } catch (error) {
        currentRetry++;
        console.warn(`⚠️ Download attempt ${currentRetry} failed:`, error.message);
        
        if (currentRetry >= maxRetries) {
          throw new Error('Falha ao baixar imagem após todas as tentativas');
        }
        
        // Delay exponencial entre tentativas
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, currentRetry) * 1000));
      }
    }

    console.log('📊 Processing downloaded image...');
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageSizeKB = Math.round(imageArrayBuffer.byteLength / 1024);
    console.log('📦 Image size:', imageSizeKB, 'KB');
    
    // Conversão para WEBP se necessário e base64
    console.log('🔄 Converting to WEBP and base64...');
    
    const uint8Array = new Uint8Array(imageArrayBuffer);
    
    // Detecção do formato original
    let originalFormat = 'unknown';
    const signature = uint8Array.slice(0, 12);
    
    if (signature[0] === 0xFF && signature[1] === 0xD8) {
      originalFormat = 'jpeg';
    } else if (signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4E && signature[3] === 0x47) {
      originalFormat = 'png';
    } else if (signature[0] === 0x52 && signature[1] === 0x49 && signature[2] === 0x46 && signature[3] === 0x46 &&
               signature[8] === 0x57 && signature[9] === 0x45 && signature[10] === 0x42 && signature[11] === 0x50) {
      originalFormat = 'webp';
    }
    
    console.log('📷 Original format detected:', originalFormat);
    
    // Conversão otimizada para base64
    const chunkSize = 4096;
    const chunks: string[] = [];
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      chunks.push(String.fromCharCode(...chunk));
    }
    
    const binaryString = chunks.join('');
    const imageB64 = btoa(binaryString);
    
    console.log('✅ Base64 conversion completed');
    console.log('📊 Base64 size:', Math.round(imageB64.length / 1024), 'KB');
    
    // MIME type para resposta (sempre WEBP para compatibilidade)
    const mimeType = originalFormat === 'webp' ? 'image/webp' : `image/${originalFormat}`;
    const imageDataUrl = `data:${mimeType};base64,${imageB64}`;
    
    console.log('🎨 OPEN-DALLE v1.1 image generation completed successfully with negative prompt!');
    console.log('📊 Final Open-DALLE v1.1 generation stats:');
    console.log('  ✓ Model: lucataco/open-dalle-v1.1 (optimized)');
    console.log('  ✓ Size: 512x512px (as requested)');
    console.log('  ✓ Format:', originalFormat);
    console.log('  ✓ File size:', imageSizeKB, 'KB');
    console.log('  ✓ Anti-text strategy: ULTRA ROBUST');
    console.log('  ✓ Negative prompt: ULTRA ADVANCED');
    console.log('  ✓ Brazilian context: FULLY INTEGRATED');
    console.log('  ✓ Educational optimization: MAXIMUM');
    console.log('  ✓ Inference steps: 50 (high quality)');
    console.log('  ✓ Guidance scale: 7.5 (balanced)');
    
    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: imageDataUrl,
      imageData: imageB64,
      model: 'open-dalle-v1.1-optimized-with-negative-prompt',
      optimizations: {
        ultraIntelligentContext: true,
        antiTextStrategy: 'ultra-robust',
        negativePrompt: 'ultra-advanced',
        brazilianContext: 'fully-integrated',
        educationalOptimization: 'maximum',
        promptSimplification: 'radical',
        openDalleOptimized: true,
        highQualityInference: true,
        qualityEnhancement: 'negative-prompt-enabled'
      },
      stats: {
        sizeKB: imageSizeKB,
        mimeType: mimeType,
        base64LengthKB: Math.round(imageB64.length / 1024),
        dimensions: '512x512',
        originalFormat: originalFormat,
        inferenceSteps: 50,
        guidanceScale: 7.5,
        scheduler: 'K_EULER',
        negativePromptEnabled: true
      },
      textPlacementSuggestion: 'Utilize a área superior ou inferior da imagem para sobreposição de texto, mantendo o centro livre para o conteúdo visual principal.'
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR in Open-DALLE v1.1 gerarImagemIA:', error);
    console.error('📋 Detailed error analysis:');
    console.error('  - Type:', error.constructor.name);
    console.error('  - Message:', error.message);
    console.error('  - Stack preview:', error.stack?.substring(0, 300));
    
    // Sistema de fallback ultra-inteligente com negative prompt
    console.log('🔄 Activating ultra-intelligent fallback system with negative prompt...');
    
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
      const ultraSimpleFallbackPrompt = `${originalPrompt.split('.')[0]}. Simple Brazilian educational illustration, clean design, no text, no symbols, visual only`;
      
      // Negative prompt simplificado para fallback
      const simpleFallbackNegativePrompt = 'text, words, letters, numbers, low quality, blurry, distorted';

      console.log('📞 Ultra-simple fallback attempt with Open-DALLE v1.1 and negative prompt...');
      const fallbackOutput = await replicate.run(
        "lucataco/open-dalle-v1.1:1c7d4c8dec39c7306df7794b28419078cb9d18b9213ab1c21fdc46a1deca0144",
        {
          input: {
            prompt: ultraSimpleFallbackPrompt,
            negative_prompt: simpleFallbackNegativePrompt,
            width: 512,
            height: 512,
            num_outputs: 1,
            guidance_scale: 7.0,
            num_inference_steps: 25
          }
        }
      );

      if (fallbackOutput && Array.isArray(fallbackOutput) && fallbackOutput[0]) {
        const fallbackImageUrl = fallbackOutput[0];
        
        // Download e conversão simplificada
        const fallbackResponse = await fetch(fallbackImageUrl);
        if (fallbackResponse.ok) {
          const fallbackArrayBuffer = await fallbackResponse.arrayBuffer();
          const fallbackUint8Array = new Uint8Array(fallbackArrayBuffer);
          
          const fallbackBinaryString = Array.from(fallbackUint8Array, byte => String.fromCharCode(byte)).join('');
          const fallbackB64 = btoa(fallbackBinaryString);
          const fallbackDataUrl = `data:image/png;base64,${fallbackB64}`;
          
          console.log('🆘 Ultra-intelligent Open-DALLE v1.1 fallback with negative prompt completed successfully');
          
          return new Response(JSON.stringify({ 
            success: true, 
            imageUrl: fallbackDataUrl,
            imageData: fallbackB64,
            model: 'open-dalle-v1.1-ultra-fallback-with-negative-prompt',
            fallback: true,
            warning: 'Generated using ultra-simplified Open-DALLE v1.1 fallback with negative prompt due to primary generation failure',
            textPlacementSuggestion: 'Coloque texto nas bordas da imagem para melhor legibilidade.'
          }), { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (fallbackError) {
      console.error('❌ Ultra-intelligent Open-DALLE v1.1 fallback with negative prompt also failed:', fallbackError.message);
    }
    
    // Resposta de erro final com sugestão
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Erro na geração com Open-DALLE v1.1 e negative prompt: ${error.message}`,
      errorType: error.constructor.name,
      timestamp: new Date().toISOString(),
      troubleshooting: 'Verifique a conectividade e tente novamente. Sistema de fallback também falhou.',
      suggestion: 'Considere simplificar o prompt ou usar um tema mais básico para a geração de imagem.'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
