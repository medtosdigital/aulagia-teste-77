
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaterialFormData {
  tema?: string;
  topic?: string;
  disciplina?: string;
  subject?: string;
  serie?: string;
  grade?: string;
  assuntos?: string[];
  subjects?: string[];
  tipoQuestoes?: string;
  tiposQuestoes?: string[];
  numeroQuestoes?: number;
  quantidadeQuestoes?: number;
  professor?: string;
  data?: string;
  duracao?: string;
  bncc?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialType, formData } = await req.json() as {
      materialType: 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao';
      formData: MaterialFormData;
    };

    console.log('📋 Generating material:', { materialType, formData });

    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate the appropriate prompt based on material type
    const prompt = generatePrompt(materialType, formData);
    console.log('🎯 Generated prompt for', materialType);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em criar materiais educacionais seguindo a BNCC. Retorne sempre conteúdo estruturado e pedagógico com base nas diretrizes brasileiras de educação. Seja específico e detalhado em todas as seções, evitando campos vazios ou incompletos. GERE TODO O CONTEÚDO baseado no tema, disciplina e série informados - não use templates genéricos.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('❌ OpenAI API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to generate content' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('✅ Content generated successfully');

    // Parse the generated content and structure it appropriately
    const structuredContent = parseGeneratedContent(materialType, generatedContent, formData);

    return new Response(JSON.stringify({
      success: true,
      content: structuredContent,
      materialType,
      formData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in gerarMaterialIA function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePrompt(materialType: string, formData: MaterialFormData): string {
  const tema = formData.tema || formData.topic || '';
  const disciplina = formData.disciplina || formData.subject || '';
  const serie = formData.serie || formData.grade || '';
  const professor = formData.professor || '';
  const data = formData.data || '';
  const duracao = formData.duracao || '';

  switch (materialType) {
    case 'plano-de-aula':
      return `
Você é um professor especialista em planejamento pedagógico de acordo com a BNCC (Base Nacional Comum Curricular).

Crie um plano de aula COMPLETO e DETALHADO com base nas seguintes informações:
- TEMA DA AULA: ${tema}
- DISCIPLINA: ${disciplina}
- SÉRIE/ANO: ${serie}

IMPORTANTE: GERE TODO O CONTEÚDO baseado especificamente no tema "${tema}" para a disciplina de ${disciplina} na série ${serie}. NÃO use conteúdo genérico.

Retorne APENAS o JSON estruturado abaixo, preenchido com conteúdo REAL e ESPECÍFICO sobre "${tema}":

{
  "titulo": "Plano de Aula - ${tema}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "duracao": "[GERE uma duração adequada para o tema, ex: 50 minutos, 100 minutos (2 aulas), etc]",
  "bncc": "[BUSQUE e RETORNE códigos BNCC REAIS relevantes para ${tema} em ${disciplina} na ${serie}. Se não souber códigos específicos, deixe vazio]",
  "objetivos": [
    "[OBJETIVO 1 específico sobre ${tema}]",
    "[OBJETIVO 2 específico sobre ${tema}]",
    "[OBJETIVO 3 específico sobre ${tema}]",
    "[OBJETIVO 4 específico sobre ${tema}]"
  ],
  "habilidades": [
    "[HABILIDADE 1 que será desenvolvida com ${tema}]",
    "[HABILIDADE 2 que será desenvolvida com ${tema}]",
    "[HABILIDADE 3 que será desenvolvida com ${tema}]"
  ],
  "desenvolvimento": [
    { 
      "etapa": "Introdução", 
      "tempo": "[tempo em minutos para introdução]", 
      "atividade": "[ATIVIDADE ESPECÍFICA de introdução ao tema ${tema}]", 
      "recursos": "[RECURSOS específicos para introduzir ${tema}]" 
    },
    { 
      "etapa": "Desenvolvimento", 
      "tempo": "[tempo em minutos para desenvolvimento]", 
      "atividade": "[ATIVIDADE ESPECÍFICA de desenvolvimento do tema ${tema}]", 
      "recursos": "[RECURSOS específicos para desenvolver ${tema}]" 
    },
    { 
      "etapa": "Prática", 
      "tempo": "[tempo em minutos para prática]", 
      "atividade": "[ATIVIDADE PRÁTICA específica sobre ${tema}]", 
      "recursos": "[RECURSOS específicos para praticar ${tema}]" 
    },
    { 
      "etapa": "Fechamento", 
      "tempo": "[tempo em minutos para fechamento]", 
      "atividade": "[ATIVIDADE ESPECÍFICA de fechamento sobre ${tema}]", 
      "recursos": "[RECURSOS específicos para fechar o tema ${tema}]" 
    }
  ],
  "recursos": [
    "[RECURSO 1 específico para ensinar ${tema}]",
    "[RECURSO 2 específico para ensinar ${tema}]",
    "[RECURSO 3 específico para ensinar ${tema}]"
  ],
  "conteudosProgramaticos": [
    "[CONTEÚDO 1 específico sobre ${tema}]",
    "[CONTEÚDO 2 específico sobre ${tema}]",
    "[CONTEÚDO 3 específico sobre ${tema}]"
  ],
  "metodologia": "[METODOLOGIA ESPECÍFICA para ensinar ${tema} em ${disciplina} para ${serie}]",
  "avaliacao": "[MÉTODO DE AVALIAÇÃO específico para verificar aprendizado sobre ${tema}]",
  "referencias": [
    "[REFERÊNCIA 1 sobre ${tema} em ${disciplina}]",
    "[REFERÊNCIA 2 sobre ${tema} em ${disciplina}]",
    "[REFERÊNCIA 3 sobre ${tema} em ${disciplina}]"
  ]
}

GERE conteúdo REAL e ESPECÍFICO. NÃO deixe placeholders ou campos genéricos.
`;

    case 'slides':
      return `
Você é um professor especialista em criação de slides educativos seguindo a BNCC.

Crie slides educativos ESPECÍFICOS sobre "${tema}" para ${disciplina} na ${serie}.

IMPORTANTE: TODO O CONTEÚDO deve ser baseado especificamente no tema "${tema}". NÃO use conteúdo genérico.

Retorne APENAS o JSON estruturado com 12 slides específicos sobre "${tema}":

{
  "titulo": "${tema} - ${disciplina}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "duracao": "[duração adequada para apresentar slides sobre ${tema}]",
  "bncc": "[códigos BNCC relevantes para ${tema} em ${disciplina}]",
  "slide_1_titulo": "${tema}",
  "slide_1_subtitulo": "Aula de ${disciplina} - ${serie}",
  "objetivo_1": "[OBJETIVO 1 específico sobre ${tema}]",
  "objetivo_2": "[OBJETIVO 2 específico sobre ${tema}]",
  "objetivo_3": "[OBJETIVO 3 específico sobre ${tema}]",
  "objetivo_4": "[OBJETIVO 4 específico sobre ${tema}]",
  "introducao_texto": "[INTRODUÇÃO específica sobre ${tema}]",
  "introducao_imagem": "[descrição de imagem relevante para ${tema}]",
  "conceitos_texto": "[CONCEITOS fundamentais específicos sobre ${tema}]",
  "conceito_principal": "[CONCEITO principal de ${tema}]",
  "conceitos_imagem": "[descrição de imagem que ilustra conceitos de ${tema}]",
  "exemplo_titulo": "[TÍTULO de exemplo prático sobre ${tema}]",
  "exemplo_conteudo": "[EXEMPLO PRÁTICO específico sobre ${tema}]",
  "exemplo_imagem": "[descrição de imagem do exemplo de ${tema}]",
  "desenvolvimento_texto": "[DESENVOLVIMENTO específico sobre ${tema}]",
  "ponto_1": "[PONTO 1 importante sobre ${tema}]",
  "ponto_2": "[PONTO 2 importante sobre ${tema}]",
  "desenvolvimento_imagem": "[descrição de imagem de apoio para ${tema}]",
  "formula_titulo": "[TÍTULO de fórmula/regra específica de ${tema}]",
  "formula_principal": "[FÓRMULA/REGRA principal de ${tema}]",
  "formula_explicacao": "[EXPLICAÇÃO da fórmula/regra de ${tema}]",
  "tabela_titulo": "[TÍTULO de tabela específica sobre ${tema}]",
  "coluna_1": "[cabeçalho coluna 1 sobre ${tema}]",
  "coluna_2": "[cabeçalho coluna 2 sobre ${tema}]",
  "coluna_3": "[cabeçalho coluna 3 sobre ${tema}]",
  "linha_1_col_1": "[dado específico de ${tema}]",
  "linha_1_col_2": "[dado específico de ${tema}]",
  "linha_1_col_3": "[dado específico de ${tema}]",
  "linha_2_col_1": "[dado específico de ${tema}]",
  "linha_2_col_2": "[dado específico de ${tema}]",
  "linha_2_col_3": "[dado específico de ${tema}]",
  "linha_3_col_1": "[dado específico de ${tema}]",
  "linha_3_col_2": "[dado específico de ${tema}]",
  "linha_3_col_3": "[dado específico de ${tema}]",
  "imagem_titulo": "[TÍTULO descritivo sobre ${tema}]",
  "imagem_descricao": "[DESCRIÇÃO do que a imagem mostra sobre ${tema}]",
  "imagem_principal": "[DESCRIÇÃO detalhada da imagem principal sobre ${tema}]",
  "atividade_pergunta": "[PERGUNTA específica sobre ${tema}]",
  "opcao_a": "[alternativa A sobre ${tema}]",
  "opcao_b": "[alternativa B sobre ${tema}]",
  "opcao_c": "[alternativa C sobre ${tema}]",
  "opcao_d": "[alternativa D sobre ${tema}]",
  "conclusao_texto": "[SÍNTESE dos pontos principais sobre ${tema}]",
  "ponto_chave_1": "[PONTO-CHAVE 1 para memorizar sobre ${tema}]",
  "ponto_chave_2": "[PONTO-CHAVE 2 para memorizar sobre ${tema}]",
  "proximo_passo_1": "[PASSO 1 para continuar estudando ${tema}]",
  "proximo_passo_2": "[PASSO 2 para continuar estudando ${tema}]",
  "proximo_passo_3": "[PASSO 3 para continuar estudando ${tema}]"
}

GERE conteúdo REAL e ESPECÍFICO sobre "${tema}". Adapte à faixa etária de ${serie}.
`;

    case 'atividade':
      const numQuestoes = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
      const tipoQuestoes = formData.tipoQuestoes || 'mistas';
      return `
Crie uma atividade educacional ESPECÍFICA sobre "${tema}" para ${disciplina} na ${serie}.

IMPORTANTE: As questões devem ser ESPECÍFICAS sobre "${tema}". NÃO use questões genéricas.

Retorne APENAS o JSON estruturado:

{
  "titulo": "Atividade - ${tema}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "duracao": "[duração adequada para resolver atividade sobre ${tema}]",
  "bncc": "[códigos BNCC relevantes para ${tema}]",
  "instrucoes": "Complete as questões abaixo sobre ${tema}. Leia atentamente cada enunciado antes de responder.",
  "questoes": [
    ${Array.from({length: numQuestoes}, (_, i) => `{
      "numero": ${i + 1},
      "tipo": "${tipoQuestoes === 'fechadas' ? 'multipla_escolha' : tipoQuestoes === 'abertas' ? 'aberta' : (i % 2 === 0 ? 'multipla_escolha' : 'aberta')}",
      "pergunta": "[PERGUNTA ${i + 1} específica sobre ${tema}]",
      ${tipoQuestoes === 'fechadas' || (tipoQuestoes === 'mistas' && i % 2 === 0) ? `
      "alternativas": [
        "[alternativa A específica sobre ${tema}]",
        "[alternativa B específica sobre ${tema}]",
        "[alternativa C específica sobre ${tema}]",
        "[alternativa D específica sobre ${tema}]"
      ],
      "resposta_correta": 0` : ''}
    }`).join(',\n    ')}
  ],
  "criterios_avaliacao": [
    "Compreensão dos conceitos sobre ${tema}",
    "Clareza na expressão das ideias sobre ${tema}",
    "Aplicação correta do conhecimento sobre ${tema}"
  ]
}

GERE questões REAIS e ESPECÍFICAS sobre "${tema}". Adeque à ${serie}.
`;

    case 'avaliacao':
      const numQuestoesAval = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
      const tipoQuestoesAval = formData.tipoQuestoes || 'mistas';
      const assuntos = formData.assuntos || formData.subjects || [tema];
      return `
Crie uma avaliação educacional ESPECÍFICA sobre "${tema}" e assuntos relacionados: ${assuntos.join(', ')} para ${disciplina} na ${serie}.

IMPORTANTE: As questões devem ser ESPECÍFICAS sobre "${tema}" e os assuntos informados. NÃO use questões genéricas.

Retorne APENAS o JSON estruturado:

{
  "titulo": "Avaliação - ${tema}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${assuntos.join(', ')}",
  "duracao": "[duração adequada para avaliação sobre ${tema}]",
  "bncc": "[códigos BNCC relevantes para ${tema}]",
  "instrucoes": "Responda às questões abaixo sobre ${assuntos.join(', ')}. Esta é uma avaliação formal.",
  "questoes": [
    ${Array.from({length: numQuestoesAval}, (_, i) => `{
      "numero": ${i + 1},
      "tipo": "${tipoQuestoesAval === 'fechadas' ? 'multipla_escolha' : tipoQuestoesAval === 'abertas' ? 'aberta' : (i % 2 === 0 ? 'multipla_escolha' : 'aberta')}",
      "pergunta": "[PERGUNTA ${i + 1} específica sobre ${assuntos[i % assuntos.length]}]",
      ${tipoQuestoesAval === 'fechadas' || (tipoQuestoesAval === 'mistas' && i % 2 === 0) ? `
      "alternativas": [
        "[alternativa A específica sobre ${assuntos[i % assuntos.length]}]",
        "[alternativa B específica sobre ${assuntos[i % assuntos.length]}]",
        "[alternativa C específica sobre ${assuntos[i % assuntos.length]}]",
        "[alternativa D específica sobre ${assuntos[i % assuntos.length]}]"
      ],
      "resposta_correta": 0` : ''}
    }`).join(',\n    ')}
  ],
  "criterios_avaliacao": [
    "Compreensão dos conceitos sobre ${tema} (25%)",
    "Clareza na expressão das ideias (25%)",
    "Aplicação correta do conhecimento sobre ${tema} (50%)"
  ]
}

GERE questões REAIS e ESPECÍFICAS. Use nível apropriado para avaliação formal na ${serie}.
`;

    default:
      return `Crie um material educacional ESPECÍFICO sobre "${tema}" para ${disciplina}, série ${serie}. GERE conteúdo REAL baseado no tema informado.`;
  }
}

function parseGeneratedContent(materialType: string, content: string, formData: MaterialFormData): any {
  const tema = formData.tema || formData.topic || '';
  const disciplina = formData.disciplina || formData.subject || '';
  const serie = formData.serie || formData.grade || '';
  const professor = formData.professor || '';
  const data = formData.data || '';

  try {
    // Tentar parsear JSON diretamente do conteúdo gerado
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsedContent = JSON.parse(jsonMatch[0]);
        
        // Garantir que os campos do formulário sejam preservados
        parsedContent.professor = professor;
        parsedContent.data = data;
        parsedContent.disciplina = disciplina;
        parsedContent.serie = serie;
        parsedContent.tema = tema;

        // Para planos de aula, garantir que recursos não sejam duplicados
        if (materialType === 'plano-de-aula' && parsedContent.desenvolvimento) {
          const recursosEtapas = [];
          parsedContent.desenvolvimento.forEach(etapa => {
            if (etapa.recursos) {
              const recursos = typeof etapa.recursos === 'string' 
                ? etapa.recursos.split(/,|e/).map(r => r.trim()) 
                : etapa.recursos;
              recursosEtapas.push(...recursos);
            }
          });
          
          const recursosGerais = Array.isArray(parsedContent.recursos) 
            ? parsedContent.recursos 
            : (typeof parsedContent.recursos === 'string' 
              ? parsedContent.recursos.split(/,|e/).map(r => r.trim()) 
              : []);
          
          parsedContent.recursos = Array.from(new Set([...recursosEtapas, ...recursosGerais])).filter(Boolean);
        }

        console.log('✅ Conteúdo parseado com sucesso:', materialType);
        return parsedContent;
      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON:', parseError);
      }
    }

    // Fallback: estrutura básica se não conseguir parsear
    console.log('⚠️ Usando fallback para estrutura básica');
    return {
      titulo: `${materialType} - ${tema}`,
      professor,
      data,
      disciplina,
      serie,
      tema,
      duracao: '',
      bncc: '',
      content: content
    };

  } catch (error) {
    console.error('❌ Erro no parseGeneratedContent:', error);
    return {
      titulo: `${materialType} - ${tema}`,
      professor,
      data,
      disciplina,
      serie,
      tema,
      duracao: '',
      bncc: '',
      content: content
    };
  }
}
