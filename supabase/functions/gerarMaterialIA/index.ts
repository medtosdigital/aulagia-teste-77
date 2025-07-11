import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

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
    console.log('🚀 Starting material generation');
    
    const { materialType, formData } = await req.json();
    console.log('📋 Request data:', { materialType, formData });

    // Validate required environment variables
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenAI API key not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate content based on material type
    let content;
    let prompt = '';

    if (materialType === 'slides') {
      prompt = `Crie um conjunto de slides sobre "${formData.tema}" para ${formData.disciplina}, ${formData.serie}.

IMPORTANTE: Retorne APENAS um JSON válido, sem texto adicional, com a seguinte estrutura:

{
  "titulo": "${formData.tema}",
  "disciplina": "${formData.disciplina}",
  "serie": "${formData.serie}",
  "professor": "${formData.professor}",
  "data": "${formData.data}",
  "tema_imagem": "Prompt detalhado em português para gerar uma imagem ilustrativa sobre ${formData.tema}, adequada para crianças, estilo educativo",
  "introducao_imagem": "Prompt detalhado em português para gerar uma imagem de introdução ao tema ${formData.tema}, didática e colorida",
  "conceitos_imagem": "Prompt detalhado em português para gerar uma imagem explicativa dos conceitos principais de ${formData.tema}",
  "exemplo_imagem": "Prompt detalhado em português para gerar uma imagem com exemplos práticos de ${formData.tema}",
  "desenvolvimento_1_imagem": "Prompt detalhado em português para gerar uma imagem sobre o desenvolvimento inicial do tema ${formData.tema}",
  "desenvolvimento_2_imagem": "Prompt detalhado em português para gerar uma imagem sobre o aprofundamento do tema ${formData.tema}",
  "slides": [
    {
      "numero": 1,
      "titulo": "Título do Slide",
      "conteudo": ["Ponto 1", "Ponto 2", "Ponto 3"],
      "tipo": "titulo"
    }
  ]
}

Crie 8-10 slides educativos e engajantes. Cada slide deve ter conteúdo relevante e educativo.`;

    } else if (materialType === 'plano-de-aula') {
      prompt = `Crie um plano de aula completo sobre "${formData.tema}" para ${formData.disciplina}, ${formData.serie}.

IMPORTANTE: Retorne APENAS um JSON válido, sem texto adicional, com a seguinte estrutura:

{
  "titulo": "${formData.tema}",
  "professor": "${formData.professor}",
  "disciplina": "${formData.disciplina}",
  "serie": "${formData.serie}",
  "tema": "${formData.tema}",
  "data": "${formData.data}",
  "duracao": "${formData.duracao}",
  "bncc": "Códigos e habilidades da BNCC relacionadas",
  "objetivos": ["Objetivo 1", "Objetivo 2"],
  "habilidades": ["Habilidade 1", "Habilidade 2"],
  "desenvolvimento": [
    {
      "etapa": "Abertura",
      "atividade": "Descrição da atividade",
      "tempo": "10 minutos",
      "recursos": "Materiais necessários"
    }
  ],
  "recursos": ["Recurso 1", "Recurso 2"],
  "conteudosProgramaticos": ["Conteúdo 1", "Conteúdo 2"],
  "metodologia": "Descrição da metodologia",
  "avaliacao": "Descrição da avaliação",
  "referencias": ["Referência 1", "Referência 2"]
}`;

    } else if (materialType === 'atividade') {
      prompt = `Crie uma atividade educativa sobre "${formData.tema}" para ${formData.disciplina}, ${formData.serie} com ${formData.quantidadeQuestoes || formData.numeroQuestoes || 5} questões.

IMPORTANTE: Retorne APENAS um JSON válido, sem texto adicional, com a seguinte estrutura:

{
  "titulo": "Atividade - ${formData.tema}",
  "instrucoes": "Instruções claras para a atividade",
  "questoes": [
    {
      "numero": 1,
      "tipo": "multipla_escolha",
      "pergunta": "Pergunta aqui?",
      "opcoes": ["a) Opção 1", "b) Opção 2", "c) Opção 3", "d) Opção 4"],
      "resposta": "a"
    }
  ]
}

Varie os tipos de questões entre: multipla_escolha, dissertativa, completar, verdadeiro_falso, ligar.`;

    } else if (materialType === 'avaliacao') {
      const assuntos = formData.assuntos || formData.subjects || [];
      const assuntosTexto = assuntos.join(', ');
      
      prompt = `Crie uma avaliação sobre os seguintes conteúdos: ${assuntosTexto} para ${formData.disciplina}, ${formData.serie} com ${formData.quantidadeQuestoes || formData.numeroQuestoes || 5} questões.

IMPORTANTE: Retorne APENAS um JSON válido, sem texto adicional, com a seguinte estrutura:

{
  "titulo": "Avaliação - ${assuntosTexto}",
  "instrucoes": "Instruções da avaliação",
  "tempoLimite": "50 minutos",
  "questoes": [
    {
      "numero": 1,
      "tipo": "multipla_escolha",
      "pergunta": "Pergunta aqui?",
      "opcoes": ["a) Opção 1", "b) Opção 2", "c) Opção 3", "d) Opção 4"],
      "pontuacao": 2
    }
  ]
}

Varie os tipos de questões e distribua pontuações adequadas.`;
    }

    console.log('🤖 Calling OpenAI API');
    
    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um assistente especializado em educação que cria materiais pedagógicos em português. Sempre retorne apenas JSON válido, sem texto adicional.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    console.log('✅ OpenAI response received');

    const generatedText = openaiData.choices[0].message.content.trim();
    
    // Parse the JSON response
    try {
      content = JSON.parse(generatedText);
      console.log('✅ Content parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      console.error('Generated text:', generatedText);
      throw new Error('Failed to parse generated content as JSON');
    }

    // For slides, generate images using the gerarImagemIA function
    if (materialType === 'slides' && content) {
      console.log('🖼️ Starting image generation for slides');
      
      const imagePrompts = [
        { key: 'tema_imagem', prompt: content.tema_imagem },
        { key: 'introducao_imagem', prompt: content.introducao_imagem },
        { key: 'conceitos_imagem', prompt: content.conceitos_imagem },
        { key: 'exemplo_imagem', prompt: content.exemplo_imagem },
        { key: 'desenvolvimento_1_imagem', prompt: content.desenvolvimento_1_imagem },
        { key: 'desenvolvimento_2_imagem', prompt: content.desenvolvimento_2_imagem },
      ];

      // Create imagensGeradas object to store generated images
      content.imagensGeradas = {};

      for (const { key, prompt: imagePrompt } of imagePrompts) {
        if (imagePrompt && typeof imagePrompt === 'string' && imagePrompt.length > 10) {
          try {
            console.log(`🎨 Generating image for ${key}`);
            
            // Call the gerarImagemIA edge function
            const imageResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/gerarImagemIA`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
              },
              body: JSON.stringify({
                prompt: imagePrompt
              }),
            });

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              
              if (imageData.success && imageData.imageUrl) {
                content.imagensGeradas[key] = imageData.imageUrl;
                console.log(`✅ Image generated for ${key}`);
              } else {
                content.imagensGeradas[key] = null;
                console.log(`⚠️ Failed to generate image for ${key}:`, imageData.error);
              }
            } else {
              content.imagensGeradas[key] = null;
              console.log(`⚠️ Image generation request failed for ${key}: ${imageResponse.status}`);
            }
          } catch (imageError) {
            content.imagensGeradas[key] = null;
            console.warn(`⚠️ Error generating image for ${key}:`, imageError);
          }
        } else {
          content.imagensGeradas[key] = null;
          console.log(`⚠️ Invalid prompt for ${key}`);
        }
      }
      
      console.log('🖼️ Image generation completed');
    }

    console.log('✅ Material generation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        content 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error in gerarMaterialIA:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
