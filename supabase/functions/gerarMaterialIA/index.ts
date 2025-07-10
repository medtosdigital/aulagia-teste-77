
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialType, formData } = await req.json();
    console.log('🚀 Generating material:', materialType, formData);

    let prompt = '';
    let systemPrompt = '';

    if (materialType === 'slides') {
      systemPrompt = `Você é um assistente especializado em criar slides educacionais. Gere conteúdo estruturado em formato JSON seguindo exatamente o formato especificado.`;
      
      prompt = `
Crie slides educacionais sobre o tema "${formData.tema}" para a disciplina ${formData.disciplina}, série ${formData.serie}.

IMPORTANTE: Retorne APENAS um JSON válido seguindo exatamente esta estrutura:

{
  "tema": "${formData.tema}",
  "professor": "${formData.professor}",
  "tema_imagem": "Ilustração educativa sobre ${formData.tema}, estilo didático colorido",
  "introducao": "Texto introdutório sobre o tema (2-3 frases)",
  "introducao_imagem": "Imagem ilustrativa para introdução de ${formData.tema}",
  "objetivos": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
  "conceitos": "Explicação dos conceitos principais (3-4 frases)",
  "conceitos_imagem": "Ilustração dos conceitos de ${formData.tema}",
  "exemplo": "Exemplo prático detalhado (4-5 frases)",
  "exemplo_imagem": "Exemplo visual de ${formData.tema}",
  "desenvolvimento1": "Primeiro tópico de desenvolvimento (3-4 frases)",
  "desenvolvimento1_imagem": "Ilustração do primeiro tópico de ${formData.tema}",
  "desenvolvimento2": "Segundo tópico de desenvolvimento (3-4 frases)", 
  "desenvolvimento2_imagem": "Ilustração do segundo tópico de ${formData.tema}",
  "desenvolvimento3": "Terceiro tópico de desenvolvimento (3-4 frases)",
  "desenvolvimento3_imagem": "Ilustração do terceiro tópico de ${formData.tema}",
  "desenvolvimento4": "Quarto tópico de desenvolvimento (3-4 frases)",
  "desenvolvimento4_imagem": "Ilustração do quarto tópico de ${formData.tema}",
  "exemplo_pratico": "Exemplo prático detalhado para aplicação (4-5 frases)",
  "imagem_principal": "Exemplo prático visual de ${formData.tema}"
}

Não inclua explicações adicionais, apenas o JSON.`;
    }

    else if (materialType === 'plano-de-aula') {
      systemPrompt = `Você é um assistente especializado em criar planos de aula detalhados. Gere conteúdo estruturado seguindo a BNCC.`;
      
      prompt = `
Crie um plano de aula detalhado sobre o tema "${formData.tema}" para a disciplina ${formData.disciplina}, série ${formData.serie}.

IMPORTANTE: Retorne APENAS um JSON válido seguindo exatamente esta estrutura:

{
  "titulo": "Plano de Aula: ${formData.tema}",
  "professor": "${formData.professor}",
  "disciplina": "${formData.disciplina}",
  "serie": "${formData.serie}",
  "tema": "${formData.tema}",
  "data": "${formData.data}",
  "duracao": "${formData.duracao}",
  "bncc": "Código da BNCC relacionado",
  "objetivos": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
  "habilidades": ["Habilidade 1", "Habilidade 2"],
  "desenvolvimento": [
    {
      "etapa": "Início da aula",
      "atividade": "Descrição da atividade",
      "tempo": "15 min",
      "recursos": "Recursos necessários"
    },
    {
      "etapa": "Desenvolvimento",
      "atividade": "Descrição da atividade principal",
      "tempo": "25 min", 
      "recursos": "Recursos necessários"
    },
    {
      "etapa": "Encerramento",
      "atividade": "Descrição do fechamento",
      "tempo": "10 min",
      "recursos": "Recursos necessários"
    }
  ],
  "recursos": ["Recurso 1", "Recurso 2", "Recurso 3"],
  "conteudosProgramaticos": ["Conteúdo 1", "Conteúdo 2"],
  "metodologia": "Descrição da metodologia utilizada",
  "avaliacao": "Descrição do processo de avaliação",
  "referencias": ["Referência 1", "Referência 2"]
}

Não inclua explicações adicionais, apenas o JSON.`;
    }

    else if (materialType === 'atividade') {
      systemPrompt = `Você é um assistente especializado em criar atividades educacionais. Gere questões variadas e educativas.`;
      
      prompt = `
Crie uma atividade educacional sobre o tema "${formData.tema}" para a disciplina ${formData.disciplina}, série ${formData.serie}.
Gere ${formData.numeroQuestoes} questões dos tipos: ${formData.tipoQuestoes}.

IMPORTANTE: Retorne APENAS um JSON válido seguindo exatamente esta estrutura:

{
  "titulo": "Atividade: ${formData.tema}",
  "instrucoes": "Instruções claras para realizar a atividade",
  "questoes": [
    {
      "numero": 1,
      "tipo": "multipla_escolha",
      "pergunta": "Texto da pergunta?",
      "opcoes": ["a) Opção 1", "b) Opção 2", "c) Opção 3", "d) Opção 4"],
      "resposta": "a"
    },
    {
      "numero": 2,
      "tipo": "dissertativa",
      "pergunta": "Pergunta dissertativa?",
      "linhasResposta": 3
    }
  ]
}

Não inclua explicações adicionais, apenas o JSON.`;
    }

    else if (materialType === 'avaliacao') {
      systemPrompt = `Você é um assistente especializado em criar avaliações educacionais. Gere questões adequadas para avaliação.`;
      
      prompt = `
Crie uma avaliação sobre os assuntos: ${formData.assuntos?.join(', ')} para a disciplina ${formData.disciplina}, série ${formData.serie}.
Gere ${formData.quantidadeQuestoes} questões dos tipos: ${formData.tiposQuestoes?.join(', ')}.

IMPORTANTE: Retorne APENAS um JSON válido seguindo exatamente esta estrutura:

{
  "titulo": "Avaliação: ${formData.assuntos?.join(', ')}",
  "instrucoes": "Instruções para a avaliação",
  "tempoLimite": "50 minutos",
  "questoes": [
    {
      "numero": 1,
      "tipo": "multipla_escolha",
      "pergunta": "Texto da pergunta?",
      "opcoes": ["a) Opção 1", "b) Opção 2", "c) Opção 3", "d) Opção 4"],
      "pontuacao": 2
    },
    {
      "numero": 2,
      "tipo": "dissertativa", 
      "pergunta": "Pergunta dissertativa?",
      "pontuacao": 3,
      "linhasResposta": 4
    }
  ]
}

Não inclua explicações adicionais, apenas o JSON.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('🤖 Generated content:', generatedText);

    // Parse the JSON response
    let parsedContent;
    try {
      // Remove any markdown formatting
      const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedContent = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('❌ Error parsing JSON:', parseError);
      console.error('Raw content:', generatedText);
      throw new Error('Falha ao processar o conteúdo gerado pela IA');
    }

    console.log('✅ Parsed content:', parsedContent);

    return new Response(JSON.stringify({ 
      success: true, 
      content: parsedContent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in gerarMaterialIA function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
