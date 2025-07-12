
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
    console.log('🎨 Starting optimized image generation process...');
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

    // Sistema inteligente de contexto para otimizar prompts
    const intelligentPromptOptimizer = (originalPrompt: string): string => {
      // Detectar contexto educacional brasileiro
      const brazilianContext = originalPrompt.toLowerCase().includes('brazilian') || 
                              originalPrompt.toLowerCase().includes('brasil');
      
      // Detectar faixa etária
      const isElementary = originalPrompt.toLowerCase().includes('elementary') ||
                          originalPrompt.toLowerCase().includes('fundamental');
      
      // Detectar disciplina
      const isMath = originalPrompt.toLowerCase().includes('math') ||
                    originalPrompt.toLowerCase().includes('geometric');
      const isScience = originalPrompt.toLowerCase().includes('science') ||
                       originalPrompt.toLowerCase().includes('biology');
      
      // Construir prompt otimizado baseado no contexto
      let optimizedPrompt = originalPrompt;
      
      // Adicionar contexto brasileiro se não presente
      if (!brazilianContext) {
        optimizedPrompt += ', Brazilian educational context';
      }
      
      // Adicionar especificações de qualidade visual
      optimizedPrompt += ', high quality educational illustration, vibrant colors, clean design, professional artwork, detailed visual elements';
      
      // Adicionar especificações por disciplina
      if (isMath) {
        optimizedPrompt += ', clear geometric shapes, precise mathematical visualization';
      }
      if (isScience) {
        optimizedPrompt += ', scientific accuracy, educational diagrams';
      }
      
      // Adicionar especificações por faixa etária
      if (isElementary) {
        optimizedPrompt += ', age-appropriate for elementary students, engaging and colorful';
      }
      
      // Estratégia anti-texto ULTRA robusta
      optimizedPrompt += ', NO TEXT, NO WORDS, NO LETTERS, NO WRITING, pure visual content only';
      
      return optimizedPrompt;
    };

    // Otimizar prompt com sistema inteligente
    const optimizedPrompt = intelligentPromptOptimizer(prompt);

    console.log('🎯 Optimized prompt with intelligent context:', optimizedPrompt.substring(0, 150) + '...');
    
    // Usar Flux Schnell como modelo principal (mais confiável e rápido)
    console.log('📞 Calling Flux Schnell with optimized parameters...');
    
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: optimizedPrompt,
          go_fast: true,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 90,
          num_inference_steps: 4
        }
      }
    );

    console.log('✅ Flux Schnell API call completed successfully');
    console.log('📦 Raw output type:', typeof output);
    console.log('📦 Raw output structure:', Array.isArray(output) ? 'Array' : 'Object');
    
    if (!output) {
      console.error('❌ No output from Replicate API');
      throw new Error('Nenhuma resposta da API Replicate');
    }

    let imageUrl;
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
      console.log('📸 Image URL extracted from array:', imageUrl?.substring(0, 50) + '...');
    } else if (typeof output === 'string') {
      imageUrl = output;
      console.log('📸 Image URL from string:', imageUrl?.substring(0, 50) + '...');
    } else {
      console.error('❌ Unexpected output format:', output);
      throw new Error('Formato de resposta inesperado da API');
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('❌ Invalid image URL:', imageUrl);
      throw new Error('URL da imagem inválida');
    }

    console.log('📥 Downloading image with robust retry mechanism...');
    
    // Download da imagem com sistema de retry melhorado
    let imageResponse;
    let retries = 3;
    let delay = 1000; // Começar com 1 segundo
    
    while (retries > 0) {
      try {
        console.log(`📡 Download attempt ${4 - retries}/3...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
        
        imageResponse = await fetch(imageUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; EducationalImageBot/1.0)'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (imageResponse.ok) {
          console.log('✅ Image downloaded successfully on attempt', 4 - retries);
          break;
        } else {
          console.warn(`⚠️ Download failed with status: ${imageResponse.status} - ${imageResponse.statusText}`);
          retries--;
          if (retries > 0) {
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          }
        }
      } catch (error) {
        console.warn(`⚠️ Download attempt failed with error:`, error.message);
        retries--;
        if (retries > 0) {
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }

    if (!imageResponse || !imageResponse.ok) {
      console.error('❌ All download attempts failed');
      throw new Error('Falha ao baixar imagem após todas as tentativas');
    }

    console.log('✅ Image downloaded successfully');
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageSizeKB = Math.round(imageArrayBuffer.byteLength / 1024);
    console.log('📦 Image size:', imageSizeKB, 'KB');
    
    // Conversão otimizada e simplificada para base64
    console.log('🔄 Converting to base64 with optimized method...');
    
    const uint8Array = new Uint8Array(imageArrayBuffer);
    
    // Método otimizado para conversão base64 (mais eficiente)
    const chunkSize = 8192; // 8KB chunks para melhor performance
    const chunks: string[] = [];
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      chunks.push(String.fromCharCode(...chunk));
    }
    
    const binaryString = chunks.join('');
    const imageB64 = btoa(binaryString);
    
    console.log('✅ Base64 conversion completed successfully');
    console.log('📊 Base64 length:', Math.round(imageB64.length / 1024), 'KB');
    
    // Detectar formato da imagem com precisão
    let mimeType = 'image/png'; // Default para PNG
    const signature = uint8Array.slice(0, 8);
    
    if (signature[0] === 0xFF && signature[1] === 0xD8) {
      mimeType = 'image/jpeg';
    } else if (signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4E && signature[3] === 0x47) {
      mimeType = 'image/png';
    } else if (signature[0] === 0x47 && signature[1] === 0x49 && signature[2] === 0x46) {
      mimeType = 'image/gif';
    } else if (signature[0] === 0x52 && signature[1] === 0x49 && signature[2] === 0x46 && signature[3] === 0x46) {
      mimeType = 'image/webp';
    }
    
    const imageDataUrl = `data:${mimeType};base64,${imageB64}`;
    
    console.log('🎨 Image generation completed successfully!');
    console.log('📊 Final generation stats:');
    console.log('  ✓ Model: black-forest-labs/flux-schnell (optimized)');
    console.log('  ✓ Size:', imageSizeKB, 'KB');
    console.log('  ✓ Format:', mimeType);
    console.log('  ✓ Quality: High (90%)');
    console.log('  ✓ Anti-text strategy: Enhanced');
    console.log('  ✓ Brazilian context: Integrated');
    console.log('  ✓ Educational optimization: Active');
    
    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: imageDataUrl,
      imageData: imageB64,
      model: 'flux-schnell-optimized',
      optimizations: {
        intelligentContext: true,
        antiTextStrategy: 'enhanced',
        brazilianContext: true,
        educationalOptimization: true
      },
      stats: {
        sizeKB: imageSizeKB,
        mimeType: mimeType,
        base64LengthKB: Math.round(imageB64.length / 1024),
        quality: 90,
        aspectRatio: '1:1'
      }
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Critical error in optimized gerarImagemIA function:', error);
    console.error('📋 Error analysis:');
    console.error('  - Type:', error.constructor.name);
    console.error('  - Message:', error.message);
    console.error('  - Stack (first 500 chars):', error.stack?.substring(0, 500));
    
    // Sistema de fallback melhorado
    console.log('🔄 Initiating intelligent fallback system...');
    
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
      
      // Prompt simplificado para fallback
      const fallbackPrompt = `${originalPrompt}. Simple educational illustration, clean design, no text, Brazilian context`;

      console.log('📞 Attempting fallback with simplified Flux model...');
      const fallbackOutput = await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: fallbackPrompt,
            go_fast: true,
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "png",
            output_quality: 80
          }
        }
      );

      console.log('✅ Fallback succeeded');
      
      if (fallbackOutput && Array.isArray(fallbackOutput) && fallbackOutput[0]) {
        const fallbackImageUrl = fallbackOutput[0];
        
        // Download e conversão simplificada para fallback
        const fallbackResponse = await fetch(fallbackImageUrl);
        if (fallbackResponse.ok) {
          const fallbackArrayBuffer = await fallbackResponse.arrayBuffer();
          const fallbackUint8Array = new Uint8Array(fallbackArrayBuffer);
          
          // Conversão direta e simples
          const fallbackBinaryString = Array.from(fallbackUint8Array, byte => String.fromCharCode(byte)).join('');
          const fallbackB64 = btoa(fallbackBinaryString);
          const fallbackDataUrl = `data:image/png;base64,${fallbackB64}`;
          
          console.log('🎨 Fallback image generation completed successfully');
          
          return new Response(JSON.stringify({ 
            success: true, 
            imageUrl: fallbackDataUrl,
            imageData: fallbackB64,
            model: 'flux-schnell-fallback',
            fallback: true,
            warning: 'Generated using simplified fallback due to primary generation failure'
          }), { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (fallbackError) {
      console.error('❌ Fallback system also failed:', fallbackError.message);
    }
    
    // Resposta de erro final com informações detalhadas
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Erro na geração de imagem: ${error.message}`,
      errorType: error.constructor.name,
      timestamp: new Date().toISOString(),
      troubleshooting: 'Verifique a conectividade e tente novamente. Se o problema persistir, entre em contato com o suporte.'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
