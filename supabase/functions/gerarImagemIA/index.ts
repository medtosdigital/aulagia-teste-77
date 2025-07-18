
// Edge Function: gerarImagemIA - Open-DALLE v1.1 Version
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
    console.log('🎨 Starting Open-DALLE v1.1 generation for prompt:', prompt);
    
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

    // Sistema Otimizado de Prompts para educação
    const optimizePrompt = (originalPrompt: string): string => {
      console.log('🧠 Optimizing prompt for educational content...');
      
      // Análise contextual para educação
      const context = {
        isMath: /math|geometric|número|forma|cálculo|equação|geometry|mathematical|multiplicação|divisão|adição|subtração/i.test(originalPrompt),
        isScience: /science|biology|ciência|biologia|química|física|scientific|laboratory/i.test(originalPrompt),
        isHistory: /history|história|brasil|cultura|historical|cultural/i.test(originalPrompt),
        isGeography: /geography|geografia|mapa|região|geographical|landscape/i.test(originalPrompt),
        isElementary: /elementary|fundamental|criança|infantil|children|kids|ensino fundamental/i.test(originalPrompt),
        isBrazilian: /brazilian|brasil|cultura brasileira/i.test(originalPrompt)
      };

      // Prompt otimizado para educação
      let optimizedPrompt = originalPrompt.trim();

      // Contexto educacional brasileiro
      optimizedPrompt += ', Brazilian educational illustration';

      // Especificações de disciplina
      if (context.isMath) {
        optimizedPrompt += ', clean mathematical illustration, geometric shapes, educational math content';
      } else if (context.isScience) {
        optimizedPrompt += ', scientific educational illustration, natural elements, learning materials';
      } else if (context.isHistory) {
        optimizedPrompt += ', Brazilian historical educational illustration, cultural elements';
      } else if (context.isGeography) {
        optimizedPrompt += ', Brazilian geographical educational illustration, landscape elements';
      }

      // Faixa etária apropriada
      if (context.isElementary) {
        optimizedPrompt += ', colorful and engaging for children, kid-friendly educational content';
      }

      // Especificações visuais essenciais para educação
      optimizedPrompt += ', high quality educational illustration, vibrant colors, clean design, detailed artwork, visual learning content, educational material, no text elements, pure visual educational content, classroom appropriate';
      
      console.log('✨ Educational prompt optimized');
      return optimizedPrompt;
    };

    // Negative Prompt Educacional
    const educationalNegativePrompt = [
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
      
      // CONTEÚDO INADEQUADO PARA EDUCAÇÃO
      'adult content, mature content, inappropriate themes, explicit content',
      'violent, aggressive, threatening, scary, frightening, horror',
      'commercial advertising, promotional content, marketing material',
      'social media interface, app interface, website interface, UI elements',
      
      // QUALIDADE BAIXA E DEFEITOS VISUAIS
      'low quality, poor quality, bad quality, worst quality, terrible quality',
      'blurry, blur, blurred, out of focus, unfocused, fuzzy, hazy',
      'pixelated, pixelation, pixel art, low resolution, low res, poor resolution',
      'distorted, distortion, deformed, malformed, warped, twisted',
      'grainy, grain, noise, noisy, artifacts, artifact, compression artifacts',
      'dark, too dark, gloomy, dim, shadowy, murky, unclear, indistinct',
      
      // ELEMENTOS VISUAIS INDESEJADOS PARA EDUCAÇÃO
      'cluttered, clutter, messy, chaotic, confusing, disorganized, jumbled',
      'broken, incomplete, unfinished, partial, fragmented, cropped badly',
      'ugly, hideous, grotesque, disturbing, inappropriate, offensive',
      'wrong proportions, bad proportions, disproportionate, asymmetric badly',
      
      // REFORÇO ADICIONAL ANTI-TEXTO PARA EDUCAÇÃO
      'NO TEXT, NO WORDS, NO LETTERS, NO WRITING, NO TITLES, NO CAPTIONS',
      'EDUCATIONAL VISUAL ONLY, LEARNING IMAGE ONLY, TEACHING ILLUSTRATION ONLY',
      'CLASSROOM APPROPRIATE, CHILD SAFE, EDUCATIONAL CONTENT ONLY'
    ].join(', ');

    // Aplicar otimização educacional
    const optimizedPrompt = optimizePrompt(prompt);

    console.log('🚀 Calling Open-DALLE v1.1 with educational parameters...');
    
    // Parâmetros otimizados para conteúdo educacional
    const output = await replicate.run(
      "lucataco/open-dalle-v1.1:1c7d4c8dec39c7306df7794b28419078cb9d18b9213ab1c21fdc46a1deca0144",
      {
        input: {
          prompt: optimizedPrompt,
          negative_prompt: educationalNegativePrompt,
          width: 512,
          height: 512,
          num_outputs: 1,
          guidance_scale: 8.5,
          num_inference_steps: 35,
          scheduler: "K_EULER"
        }
      }
    );

    console.log('✅ Educational image generation completed');
    
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

    console.log('📥 Downloading and processing educational image...');
    
    // Sistema de download otimizado com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const imageResponse = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AulagIA-Educational-Bot/2.0',
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
    
    console.log('🎨 Educational image generation completed successfully!');
    
    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: imageDataUrl,
      imageData: imageB64,
      model: 'open-dalle-v1.1-educational',
      optimizations: {
        educationalPromptOptimization: true,
        educationalNegativePrompt: true,
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
        guidanceScale: 8.5,
        scheduler: 'K_EULER'
      },
      educationalFeatures: [
        'Educational prompt optimization for Brazilian classroom content',
        'Child-safe and classroom-appropriate image generation',
        'Enhanced negative prompt for educational content',
        'Optimized for learning materials and teaching aids',
        'Brazilian educational context integration',
        'Age-appropriate content filtering'
      ]
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error in educational Open-DALLE v1.1:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Erro na geração educacional com Open-DALLE v1.1: ${error.message}`,
      errorType: error.constructor.name,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
