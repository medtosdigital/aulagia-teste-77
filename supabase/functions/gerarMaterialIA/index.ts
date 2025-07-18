
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para gerar imagem via edge function
async function generateImage(prompt: string): Promise<string> {
  try {
    console.log('🎨 Gerando imagem para prompt:', prompt);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/gerarImagemIA`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    if (!response.ok) {
      console.error('❌ Erro na geração de imagem:', response.status, response.statusText);
      throw new Error(`Falha na geração de imagem: ${response.status}`);
    }

    const result = await response.json();
    if (result.success && result.imageUrl) {
      console.log('✅ Imagem gerada com sucesso');
      return result.imageUrl;
    } else {
      console.error('❌ Falha na geração de imagem:', result.error);
      throw new Error(`Erro na geração: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Erro ao chamar gerarImagemIA:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialType, formData } = await req.json();
    console.log('🚀 Generating material:', materialType, formData);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let prompt = '';
    let systemMessage = '';

    if (materialType === 'slides') {
      systemMessage = `Você é um especialista em criação de materiais educacionais para apresentações de slides. 
Crie conteúdo educacional COMPLETO e ESTRUTURADO para cada variável específica do template de slides.

IMPORTANTE: Retorne APENAS um JSON válido com as variáveis preenchidas. NÃO inclua explicações, markdown ou texto adicional.

ESTRUTURA OBRIGATÓRIA para slides:
{
  "tema": "string - título principal da apresentação",
  "disciplina": "string - nome da disciplina",
  "serie": "string - série/ano escolar",
  "professor": "string - nome do professor",
  "objetivos": ["string", "string", "string"] - lista de objetivos de aprendizagem,
  "introducao": "string - texto introdutório do tema (2-3 frases)",
  "conceitos": "string - conceitos principais (2-3 parágrafos)",
  "desenvolvimento_1": "string - primeiro tópico de desenvolvimento (2-3 frases)",
  "desenvolvimento_2": "string - segundo tópico de desenvolvimento (2-3 frases)",
  "desenvolvimento_3": "string - terceiro tópico de desenvolvimento (2-3 frases)",
  "desenvolvimento_4": "string - quarto tópico de desenvolvimento (2-3 frases)",
  "exemplo": "string - exemplo prático aplicado (2-3 frases)",
  "atividade": "string - atividade interativa sugerida (2-3 frases)",
  "resumo": "string - resumo dos pontos principais (2-3 frases)",
  "conclusao": "string - conclusão da apresentação (1-2 frases)",
  "tema_imagem": "string - prompt para imagem da capa: descreva uma ilustração educativa relacionada ao tema principal para a capa da apresentação",
  "introducao_imagem": "string - prompt para imagem da introdução: descreva uma ilustração que represente visualmente o conceito introdutório",
  "conceitos_imagem": "string - prompt para imagem dos conceitos: descreva uma ilustração que explique visualmente os conceitos principais",
  "desenvolvimento_1_imagem": "string - prompt para imagem do desenvolvimento 1: descreva uma ilustração específica para este tópico",
  "desenvolvimento_2_imagem": "string - prompt para imagem do desenvolvimento 2: descreva uma ilustração específica para este tópico",
  "desenvolvimento_3_imagem": "string - prompt para imagem do desenvolvimento 3: descreva uma ilustração específica para este tópico",
  "desenvolvimento_4_imagem": "string - prompt para imagem do desenvolvimento 4: descreva uma ilustração específica para este tópico",
  "exemplo_imagem": "string - prompt para imagem do exemplo: descreva uma ilustração que mostre visualmente o exemplo prático"
}`;

      prompt = `Crie uma apresentação completa sobre "${formData.tema || formData.topic}" para ${formData.disciplina || formData.subject}, série ${formData.serie || formData.grade}.

Professor: ${formData.professor || 'Professor(a)'}

INSTRUÇÕES ESPECÍFICAS:
- Crie conteúdo educacional apropriado para a série informada
- Cada variável deve ter conteúdo específico e educativo
- Os prompts de imagem devem ser descritivos e educacionais
- Use linguagem adequada para o nível escolar
- Foque em aplicações práticas e exemplos relevantes

Retorne APENAS o JSON com todas as variáveis preenchidas.`;

    } else if (materialType === 'plano-de-aula') {
      systemMessage = `Você é um especialista em educação brasileira. Crie um plano de aula completo seguindo as diretrizes da BNCC.
Retorne APENAS um JSON válido com a estrutura especificada.`;

      prompt = `Crie um plano de aula sobre "${formData.tema || formData.topic}" para ${formData.disciplina || formData.subject}, ${formData.serie || formData.grade}.

ESTRUTURA OBRIGATÓRIA:
{
  "titulo": "string",
  "professor": "string",
  "disciplina": "string", 
  "serie": "string",
  "tema": "string",
  "data": "string",
  "duracao": "string",
  "bncc": "string",
  "objetivos": ["string", "string"],
  "habilidades": ["string", "string"],
  "desenvolvimento": [
    {"etapa": "string", "atividade": "string", "tempo": "string", "recursos": "string"}
  ],
  "recursos": ["string", "string"],
  "conteudosProgramaticos": ["string", "string"],
  "metodologia": "string",
  "avaliacao": "string",
  "referencias": ["string", "string"]
}`;

    } else if (materialType === 'atividade') {
      systemMessage = `Você é um especialista em criação de atividades educacionais. Crie questões variadas e educativas.
Retorne APENAS um JSON válido com a estrutura especificada.`;

      prompt = `Crie uma atividade sobre "${formData.assuntos?.join(', ') || formData.tema}" para ${formData.disciplina || formData.subject}, ${formData.serie || formData.grade}.
Número de questões: ${formData.numeroQuestoes || formData.quantidadeQuestoes || 5}

ESTRUTURA OBRIGATÓRIA:
{
  "titulo": "string",
  "instrucoes": "string",
  "questoes": [
    {
      "numero": number,
      "tipo": "string",
      "pergunta": "string",
      "opcoes": ["string"] // para múltipla escolha
    }
  ]
}`;

    } else if (materialType === 'avaliacao') {
      systemMessage = `Você é um especialista em avaliações educacionais. Crie questões de diferentes tipos para avaliação.
Retorne APENAS um JSON válido com a estrutura especificada.`;

      prompt = `Crie uma avaliação sobre "${formData.assuntos?.join(', ') || formData.tema}" para ${formData.disciplina || formData.subject}, ${formData.serie || formData.grade}.
Número de questões: ${formData.numeroQuestoes || formData.quantidadeQuestoes || 10}

ESTRUTURA OBRIGATÓRIA:
{
  "titulo": "string",
  "instrucoes": "string", 
  "tempoLimite": "string",
  "questoes": [
    {
      "numero": number,
      "tipo": "string",
      "pergunta": "string",
      "opcoes": ["string"], // para múltipla escolha
      "pontuacao": number
    }
  ]
}`;

    } else if (materialType === 'apoio') {
      systemMessage = `Você é um especialista em materiais de apoio educacional. Crie conteúdo complementar rico e detalhado.
Retorne APENAS um JSON válido com a estrutura especificada.`;

      prompt = `Crie um material de apoio sobre "${formData.tema || formData.topic}" para ${formData.disciplina || formData.subject}, ${formData.serie || formData.grade}.

ESTRUTURA OBRIGATÓRIA:
{
  "titulo": "string",
  "conteudo": "string - HTML rico com explicações detalhadas, exemplos e exercícios"
}`;
    }

    console.log('📤 Sending request to OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI');
    }

    let generatedContent = data.choices[0].message.content.trim();
    console.log('📝 Generated content preview:', generatedContent.substring(0, 200));

    // Limpar conteúdo para garantir JSON válido
    generatedContent = generatedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Tentar fazer parse do JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      console.error('❌ Raw content:', generatedContent);
      throw new Error('Generated content is not valid JSON');
    }

    // Processar imagens para slides
    if (materialType === 'slides') {
      console.log('🎨 Processando imagens para slides...');
      
      // Lista de campos de imagem para processar
      const imageFields = [
        'tema_imagem', 'introducao_imagem', 'conceitos_imagem',
        'desenvolvimento_1_imagem', 'desenvolvimento_2_imagem',
        'desenvolvimento_3_imagem', 'desenvolvimento_4_imagem', 'exemplo_imagem'
      ];

      // Processar cada campo de imagem sequencialmente
      for (const field of imageFields) {
        if (parsedContent[field]) {
          console.log(`🖼️ Gerando imagem para ${field}:`, parsedContent[field]);
          try {
            const imageUrl = await generateImage(parsedContent[field]);
            parsedContent[field] = imageUrl;
            console.log(`✅ Imagem gerada para ${field}`);
          } catch (error) {
            console.error(`❌ Erro ao gerar imagem para ${field}:`, error);
            throw new Error(`Falha na geração de imagem para ${field}: ${error.message}`);
          }
        }
      }

      console.log('✅ Processamento de imagens concluído');
    }

    // Validar estrutura específica para slides
    if (materialType === 'slides') {
      const requiredFields = [
        'tema', 'disciplina', 'serie', 'professor', 'objetivos', 'introducao', 
        'conceitos', 'desenvolvimento_1', 'desenvolvimento_2', 'desenvolvimento_3', 
        'desenvolvimento_4', 'exemplo', 'atividade', 'resumo', 'conclusao',
        'tema_imagem', 'introducao_imagem', 'conceitos_imagem', 
        'desenvolvimento_1_imagem', 'desenvolvimento_2_imagem', 
        'desenvolvimento_3_imagem', 'desenvolvimento_4_imagem', 'exemplo_imagem'
      ];

      for (const field of requiredFields) {
        if (!parsedContent[field]) {
          console.error(`❌ Missing required field for slides: ${field}`);
          throw new Error(`Missing required field: ${field}`);
        }
      }
      console.log('✅ All required fields present for slides');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      content: parsedContent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in gerarMaterialIA:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
