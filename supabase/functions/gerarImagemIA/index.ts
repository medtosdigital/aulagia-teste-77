
// Edge Function: gerarImagemIA - Versão Otimizada 2.0
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
    console.log('🎨 Starting OPTIMIZED image generation v2.0...');
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

    // Sistema Ultra-Inteligente de Otimização de Prompts v2.0
    const ultraIntelligentPromptOptimizer = (originalPrompt: string): string => {
      console.log('🧠 Applying ultra-intelligent prompt optimization...');
      
      // Análise contextual avançada
      const context = {
        isMath: /math|geometric|número|forma|cálculo|equação/i.test(originalPrompt),
        isScience: /science|biology|ciência|biologia|química|física/i.test(originalPrompt),
        isHistory: /history|história|brasil|cultura/i.test(originalPrompt),
        isGeography: /geography|geografia|mapa|região/i.test(originalPrompt),
        isElementary: /elementary|fundamental|criança|infantil/i.test(originalPrompt),
        isBrazilian: /brazilian|brasil|cultura brasileira/i.test(originalPrompt)
      };

      // Simplificação radical do prompt (estratégia principal)
      let optimizedPrompt = originalPrompt
        .replace(/\b(texto|text|palavra|word|número|number|letra|letter|símbolo|symbol)\b/gi, '')
        .replace(/\b(escrito|written|digitado|typed)\b/gi, '')
        .trim();

      // Contexto educacional brasileiro essencial
      if (!context.isBrazilian) {
        optimizedPrompt += ', Brazilian educational context';
      }

      // Especificações de disciplina otimizadas
      if (context.isMath) {
        optimizedPrompt += ', clean geometric shapes, visual mathematics concept';
      } else if (context.isScience) {
        optimizedPrompt += ', scientific illustration, natural elements';
      } else if (context.isHistory) {
        optimizedPrompt += ', Brazilian historical illustration';
      } else if (context.isGeography) {
        optimizedPrompt += ', Brazilian geographical elements';
      }

      // Faixa etária apropriada
      if (context.isElementary) {
        optimizedPrompt += ', colorful and engaging for children';
      }

      // Especificações visuais essenciais
      optimizedPrompt += ', high quality educational illustration, vibrant colors, clean minimalist design';
      
      // ESTRATÉGIA ANTI-TEXTO ULTRA ROBUSTA
      optimizedPrompt += ', ABSOLUTELY NO TEXT, NO WORDS, NO LETTERS, NO NUMBERS, NO SYMBOLS, NO WRITING, pure visual illustration only, clean image without any textual elements';
      
      console.log('✨ Optimized prompt preview:', optimizedPrompt.substring(0, 150) + '...');
      return optimizedPrompt;
    };

    // Aplicar otimização ultra-inteligente
    const ultraOptimizedPrompt = ultraIntelligentPromptOptimizer(prompt);

    console.log('🚀 Calling Flux Schnell with ULTRA-OPTIMIZED parameters...');
    
    // Parâmetros ultra-otimizados para melhor qualidade
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: ultraOptimizedPrompt,
          go_fast: true,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp", // WEBP para melhor compressão
          output_quality: 90,     // Qualidade alta
          num_inference_steps: 4  // Otimizado para velocidade
        }
      }
    );

    console.log('✅ Ultra-optimized generation completed successfully');
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
    
    // Conversão ultra-otimizada para base64
    console.log('🔄 Converting to base64 with ultra-optimized method...');
    
    const uint8Array = new Uint8Array(imageArrayBuffer);
    
    // Método de conversão otimizado em chunks menores
    const chunkSize = 4096;
    const chunks: string[] = [];
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      chunks.push(String.fromCharCode(...chunk));
    }
    
    const binaryString = chunks.join('');
    const imageB64 = btoa(binaryString);
    
    console.log('✅ Ultra-optimized base64 conversion completed');
    console.log('📊 Base64 size:', Math.round(imageB64.length / 1024), 'KB');
    
    // Detecção inteligente de MIME type
    let mimeType = 'image/webp'; // Default para WEBP otimizado
    const signature = uint8Array.slice(0, 12);
    
    // Detecção precisa do formato
    if (signature[0] === 0xFF && signature[1] === 0xD8) {
      mimeType = 'image/jpeg';
    } else if (signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4E && signature[3] === 0x47) {
      mimeType = 'image/png';
    } else if (signature[0] === 0x47 && signature[1] === 0x49 && signature[2] === 0x46) {
      mimeType = 'image/gif';
    } else if (signature[0] === 0x52 && signature[1] === 0x49 && signature[2] === 0x46 && signature[3] === 0x46 &&
               signature[8] === 0x57 && signature[9] === 0x45 && signature[10] === 0x42 && signature[11] === 0x50) {
      mimeType = 'image/webp';
    }
    
    const imageDataUrl = `data:${mimeType};base64,${imageB64}`;
    
    console.log('🎨 ULTRA-OPTIMIZED image generation completed successfully!');
    console.log('📊 Final ultra-optimization stats:');
    console.log('  ✓ Model: black-forest-labs/flux-schnell (ultra-optimized)');
    console.log('  ✓ Format: WEBP (optimized compression)');
    console.log('  ✓ Quality: 90% (high quality)');
    console.log('  ✓ Size:', imageSizeKB, 'KB');
    console.log('  ✓ Anti-text strategy: ULTRA ROBUST');
    console.log('  ✓ Brazilian context: FULLY INTEGRATED');
    console.log('  ✓ Educational optimization: MAXIMUM');
    console.log('  ✓ Prompt simplification: RADICAL');
    
    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: imageDataUrl,
      imageData: imageB64,
      model: 'flux-schnell-ultra-optimized-v2',
      optimizations: {
        ultraIntelligentContext: true,
        antiTextStrategy: 'ultra-robust',
        brazilianContext: 'fully-integrated',
        educationalOptimization: 'maximum',
        promptSimplification: 'radical',
        webpFormat: true,
        highQuality: true
      },
      stats: {
        sizeKB: imageSizeKB,
        mimeType: mimeType,
        base64LengthKB: Math.round(imageB64.length / 1024),
        quality: 90,
        aspectRatio: '1:1',
        format: 'webp-optimized'
      },
      textPlacementSuggestion: 'Utilize a área superior ou inferior da imagem para sobreposição de texto, mantendo o centro livre para o conteúdo visual principal.'
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR in ultra-optimized gerarImagemIA v2.0:', error);
    console.error('📋 Detailed error analysis:');
    console.error('  - Type:', error.constructor.name);
    console.error('  - Message:', error.message);
    console.error('  - Stack preview:', error.stack?.substring(0, 300));
    
    // Sistema de fallback ultra-inteligente
    console.log('🔄 Activating ultra-intelligent fallback system...');
    
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

      console.log('📞 Ultra-simple fallback attempt...');
      const fallbackOutput = await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: ultraSimpleFallbackPrompt,
            go_fast: true,
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 80,
            num_inference_steps: 4
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
          const fallbackDataUrl = `data:image/webp;base64,${fallbackB64}`;
          
          console.log('🆘 Ultra-intelligent fallback completed successfully');
          
          return new Response(JSON.stringify({ 
            success: true, 
            imageUrl: fallbackDataUrl,
            imageData: fallbackB64,
            model: 'flux-schnell-ultra-fallback',
            fallback: true,
            warning: 'Generated using ultra-simplified fallback due to primary generation failure',
            textPlacementSuggestion: 'Coloque texto nas bordas da imagem para melhor legibilidade.'
          }), { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (fallbackError) {
      console.error('❌ Ultra-intelligent fallback also failed:', fallbackError.message);
    }
    
    // Resposta de erro final com sugestão
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Erro na geração ultra-otimizada: ${error.message}`,
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
