
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

      // Especificações visuais essenciais - reforçando sem texto
      optimizedPrompt += ', high quality educational illustration, vibrant colors, clean design, detailed artwork, visual only, no text elements, pure visual content';
      
      console.log('✨ Prompt optimized');
      return optimizedPrompt;
    };

    // Negative Prompt Ultra-Reforçado para Eliminar Completamente Textos
    const ultraReinforcedNegativePrompt = [
      // TEXTOS E ELEMENTOS ESCRITOS - MÁXIMA PRIORIDADE
      'text, texts, word, words, letter, letters, alphabet, character, characters',
      'writing, written, handwriting, handwritten, script, scripted',
      'typography, typographic, font, fonts, typeface, typefaces',
      'title, titles, heading, headings, caption, captions, label, labels',
      'description, descriptions, subtitle, subtitles, annotation, annotations',
      'sign, signs, signage, signboard, signboards, billboard, billboards',
      'inscription, inscriptions, manuscript, manuscripts, document, documents',
      'book, books, page, pages, newspaper, newspapers, magazine, magazines',
      'poster, posters, flyer, flyers, brochure, brochures, pamphlet, pamphlets',
      
      // NÚMEROS E SÍMBOLOS MATEMÁTICOS
      'number, numbers, numeral, numerals, digit, digits, numeric, numerical',
      'symbol, symbols, mathematical symbol, math symbol, equation, equations',
      'formula, formulas, calculation, calculations, arithmetic, algebraic',
      'plus, minus, equals, multiply, divide, percentage, fraction, fractions',
      
      // MARCAS D\'ÁGUA E LOGOS
      'watermark, watermarks, logo, logos, brand, branding, trademark, trademarks',
      'copyright, copyrighted, signature, signatures, stamp, stamps, seal, seals',
      'emblem, emblems, badge, badges, mark, marks, marking, markings',
      
      // QUALIDADE BAIXA E DEFEITOS VISUAIS
      'low quality, poor quality, bad quality, worst quality, terrible quality',
      'blurry, blur, blurred, out of focus, unfocused, fuzzy, hazy',
      'pixelated, pixelation, pixel art, low resolution, low res, poor resolution',
      'distorted, distortion, deformed, malformed, warped, twisted',
      'grainy, grain, noise, noisy, artifacts, artifact, compression artifacts',
      'jpeg artifacts, compression, over-compressed, under-exposed, over-exposed',
      'dark, too dark, gloomy, dim, shadowy, murky, unclear, indistinct',
      
      // ELEMENTOS VISUAIS INDESEJADOS
      'cluttered, clutter, messy, chaotic, confusing, disorganized, jumbled',
      'broken, incomplete, unfinished, partial, fragmented, cropped badly',
      'ugly, hideous, grotesque, disturbing, inappropriate, offensive',
      'scary, frightening, horror, violent, aggressive, threatening',
      'wrong proportions, bad proportions, disproportionate, asymmetric badly',
      
      // CONTEXTOS INADEQUADOS PARA EDUCAÇÃO
      'adult content, mature content, inappropriate themes, explicit content',
      'religious symbols, political symbols, controversial content',
      'commercial advertising, promotional content, marketing material',
      'social media interface, app interface, website interface, UI elements',
      
      // ELEMENTOS TÉCNICOS INDESEJADOS
      'screenshot, screen capture, computer screen, monitor, display',
      'cursor, mouse pointer, selection box, highlight, border ugly',
      'frame ugly, border thick, outline heavy, shadow ugly, gradient ugly',
      
      // REFORÇO ADICIONAL ANTI-TEXTO
      'NO TEXT, NO WORDS, NO LETTERS, NO WRITING, NO TITLES, NO CAPTIONS',
      'VISUAL ONLY, IMAGE ONLY, PICTURE ONLY, ILLUSTRATION ONLY',
      'EDUCATIONAL VISUAL, PURE VISUAL CONTENT, CLEAN VISUAL DESIGN'
    ].join(', ');

    // Aplicar otimização
    const optimizedPrompt = optimizePrompt(prompt);

    console.log('🚀 Calling Open-DALLE v1.1 with ultra-reinforced anti-text parameters...');
    
    // Parâmetros com negative prompt ultra-reforçado
    const output = await replicate.run(
      "lucataco/open-dalle-v1.1:1c7d4c8dec39c7306df7794b28419078cb9d18b9213ab1c21fdc46a1deca0144",
      {
        input: {
          prompt: optimizedPrompt,
          negative_prompt: ultraReinforcedNegativePrompt,
          width: 512,
          height: 512,
          num_outputs: 1,
          guidance_scale: 8.0, // Aumentado para 8.0 para melhor controle do negative prompt
          num_inference_steps: 35, // Aumentado ligeiramente para melhor qualidade
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
    const timeoutId = setTimeout(() => controller.abort(), 25000); // Aumentado timeout
    
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
    
    console.log('🎨 Open-DALLE v1.1 ultra-reinforced anti-text generation completed successfully!');
    
    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: imageDataUrl,
      imageData: imageB64,
      model: 'open-dalle-v1.1-ultra-anti-text',
      optimizations: {
        promptOptimization: true,
        ultraReinforcedNegativePrompt: true,
        increasedGuidanceScale: true,
        enhancedInferenceSteps: true,
        optimizedDownload: true,
        streamlinedProcessing: true
      },
      stats: {
        sizeKB: imageSizeKB,
        mimeType: mimeType,
        dimensions: '512x512',
        originalFormat: originalFormat,
        inferenceSteps: 35,
        guidanceScale: 8.0,
        scheduler: 'K_EULER'
      },
      antiTextMeasures: [
        'Ultra-reinforced negative prompt with 50+ text-related exclusions',
        'Increased guidance scale to 8.0 for better negative prompt control',
        'Enhanced inference steps to 35 for better quality control',
        'Visual-only content specifications in positive prompt',
        'Multi-language text exclusions (português/english)',
        'Complete symbol and number exclusions'
      ],
      textPlacementSuggestion: 'Utilize a área superior ou inferior da imagem para sobreposição de texto, mantendo o centro livre para o conteúdo visual principal.'
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error in ultra-reinforced Open-DALLE v1.1:', error);
    
    // Sistema de fallback ultra-simplificado
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
      
      // Prompt ultra-simplificado para fallback com reforço anti-texto
      const ultraSimpleFallbackPrompt = `${originalPrompt.split('.')[0]}. Simple Brazilian educational illustration, clean design, visual only, no text, no words, no letters`;
      const ultraSimpleFallbackNegativePrompt = 'text, words, letters, numbers, titles, captions, labels, writing, typography, signs, low quality, blurry, pixelated, distorted, artifacts, noise, NO TEXT, NO WORDS, VISUAL ONLY';

      console.log('🔄 Attempting ultra-simple anti-text fallback...');
      const fallbackOutput = await replicate.run(
        "lucataco/open-dalle-v1.1:1c7d4c8dec39c7306df7794b28419078cb9d18b9213ab1c21fdc46a1deca0144",
        {
          input: {
            prompt: ultraSimpleFallbackPrompt,
            negative_prompt: ultraSimpleFallbackNegativePrompt,
            width: 512,
            height: 512,
            num_outputs: 1,
            guidance_scale: 8.0,
            num_inference_steps: 25
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
          
          console.log('🆘 Ultra-simple anti-text fallback completed successfully');
          
          return new Response(JSON.stringify({ 
            success: true, 
            imageUrl: fallbackDataUrl,
            imageData: fallbackB64,
            model: 'open-dalle-v1.1-ultra-anti-text-fallback',
            fallback: true,
            warning: 'Generated using ultra-simplified anti-text fallback due to primary generation failure'
          }), { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (fallbackError) {
      console.error('❌ Ultra-simple anti-text fallback also failed:', fallbackError.message);
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Erro na geração ultra-reforçada com Open-DALLE v1.1: ${error.message}`,
      errorType: error.constructor.name,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
