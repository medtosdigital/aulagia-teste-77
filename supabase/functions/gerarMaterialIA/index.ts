
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
            content: 'Você é um assistente especializado em criar materiais educacionais seguindo a BNCC. Retorne sempre conteúdo estruturado e pedagógico com base nas diretrizes brasileiras de educação. Seja específico e detalhado em todas as seções, evitando campos vazios ou incompletos. GERE TODO O CONTEÚDO baseado no tema, disciplina e série informados - não use templates genéricos. Use português brasileiro correto, sem erros de gramática ou ortografia.'
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

REGRAS CRÍTICAS PARA RECURSOS POR ETAPA:
1. Cada etapa deve ter APENAS de 1 a 3 recursos específicos e únicos
2. NÃO repita recursos entre diferentes etapas - cada recurso deve ser usado apenas uma vez
3. Cada recurso deve ser específico para a atividade daquela etapa
4. Use vírgulas para separar recursos dentro de cada etapa
5. Cada recurso deve ser gramaticalmente correto e específico

EXEMPLO DE RECURSOS CORRETOS:
- Introdução: "Quadro branco, marcadores coloridos"
- Desenvolvimento: "Material manipulativo, experimentos práticos"
- Prática: "Exercícios impressos, jogos educativos"
- Fechamento: "Fichas de avaliação"

Retorne APENAS o JSON estruturado abaixo, preenchido com conteúdo REAL e ESPECÍFICO sobre "${tema}":

{
  "titulo": "Plano de Aula - ${tema}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "duracao": "[GERE uma duração adequada baseada no tema, por exemplo: 50 minutos, 100 minutos (2 aulas), etc]",
  "bncc": "[BUSQUE e RETORNE códigos BNCC REAIS, ESPECÍFICOS e OBRIGATORIAMENTE EXATOS para o tema '${tema}' em ${disciplina} na ${serie}. O código BNCC deve ser SEMPRE o mais aderente e diretamente relacionado ao tema da aula, nunca genérico. Exemplo: Se o tema for 'Geometria', retorne apenas códigos BNCC que tratam de Geometria, como EF03MA17. NÃO retorne códigos de outros temas. Se não souber códigos específicos, deixe vazio.]",
  "objetivos": [
    "[OBJETIVO ESPECÍFICO 1 sobre ${tema}]",
    "[OBJETIVO ESPECÍFICO 2 sobre ${tema}]",
    "[OBJETIVO ESPECÍFICO 3 sobre ${tema}]"
  ],
  "habilidades": [
    "[HABILIDADE ESPECÍFICA 1 que será desenvolvida com ${tema}]",
    "[HABILIDADE ESPECÍFICA 2 que será desenvolvida com ${tema}]",
    "[HABILIDADE ESPECÍFICA 3 que será desenvolvida com ${tema}]"
  ],
  "desenvolvimento": [
    { 
      "etapa": "Introdução", 
      "tempo": "[tempo específico em minutos, ex: 10 minutos]", 
      "atividade": "[ATIVIDADE ESPECÍFICA de introdução ao tema ${tema} - descreva detalhadamente o que será feito]", 
      "recursos": "[1-3 RECURSOS ÚNICOS específicos APENAS para introdução, separados por vírgula. Ex: Quadro branco, marcadores coloridos]" 
    },
    { 
      "etapa": "Desenvolvimento", 
      "tempo": "[tempo específico em minutos, ex: 25 minutos]", 
      "atividade": "[ATIVIDADE ESPECÍFICA de desenvolvimento do tema ${tema} - descreva detalhadamente o que será feito]", 
      "recursos": "[1-3 RECURSOS ÚNICOS específicos APENAS para desenvolvimento, separados por vírgula. Ex: Material manipulativo, experimentos práticos]" 
    },
    { 
      "etapa": "Prática", 
      "tempo": "[tempo específico em minutos, ex: 10 minutos]", 
      "atividade": "[ATIVIDADE PRÁTICA ESPECÍFICA sobre ${tema} - descreva detalhadamente o que será feito]", 
      "recursos": "[1-3 RECURSOS ÚNICOS específicos APENAS para prática, separados por vírgula. Ex: Exercícios impressos, jogos educativos]" 
    },
    { 
      "etapa": "Fechamento", 
      "tempo": "[tempo específico em minutos, ex: 5 minutos]", 
      "atividade": "[ATIVIDADE ESPECÍFICA de fechamento sobre ${tema} - descreva detalhadamente o que será feito]", 
      "recursos": "[1-2 RECURSOS ÚNICOS específicos APENAS para fechamento, separados por vírgula. Ex: Fichas de avaliação]" 
    }
  ],
  "recursos": [
    "[RECURSO 1 específico para ensinar ${tema}]",
    "[RECURSO 2 específico para ensinar ${tema}]",
    "[RECURSO 3 específico para ensinar ${tema}]"
  ],
  "conteudosProgramaticos": [
    "[CONTEÚDO ESPECÍFICO 1 sobre ${tema}]",
    "[CONTEÚDO ESPECÍFICO 2 sobre ${tema}]",
    "[CONTEÚDO ESPECÍFICO 3 sobre ${tema}]"
  ],
  "metodologia": "[METODOLOGIA ESPECÍFICA e detalhada para ensinar ${tema} em ${disciplina} para ${serie} - descreva como será conduzida a aula]",
  "avaliacao": "[MÉTODO DE AVALIAÇÃO específico para verificar aprendizado sobre ${tema} - descreva como será avaliado]",
  "referencias": [
    "[REFERÊNCIA BIBLIOGRÁFICA 1 sobre ${tema} em ${disciplina}]",
    "[REFERÊNCIA BIBLIOGRÁFICA 2 sobre ${tema} em ${disciplina}]"
  ]
}

INSTRUÇÕES FINAIS CRÍTICAS:
1. Cada etapa no "desenvolvimento" deve ter recursos ÚNICOS que não se repetem em outras etapas
2. Use vírgulas para separar recursos dentro da string de cada etapa
3. Mantenha de 1 a 3 recursos por etapa (máximo 3)
4. Os recursos devem ser específicos e apropriados para a atividade daquela etapa
5. Use português brasileiro correto sem erros gramaticais
6. NÃO REPITA recursos entre etapas diferentes
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

GERE conteúdo REAL e ESPECÍFICO sobre "${tema}". Adapte à faixa etária de ${serie}. Use português brasileiro correto.
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

GERE questões REAIS e ESPECÍFICAS sobre "${tema}". Adeque à ${serie}. Use português brasileiro correto.
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

GERE questões REAIS e ESPECÍFICAS. Use nível apropriado para avaliação formal na ${serie}. Use português brasileiro correto.
`;

    default:
      return `Crie um material educacional ESPECÍFICO sobre "${tema}" para ${disciplina}, série ${serie}. GERE conteúdo REAL baseado no tema informado. Use português brasileiro correto.`;
  }
}

function cleanResourcesForStage(recursos: string): string[] {
  if (!recursos || typeof recursos !== 'string') return [];
  
  return recursos
    .split(',')
    .map(recurso => recurso.trim())
    .filter(recurso => recurso.length > 0)
    .slice(0, 3); // Limita a 3 recursos por etapa
}

function parseGeneratedContent(materialType: string, content: string, formData: MaterialFormData): any {
  const tema = formData.tema || formData.topic || '';
  const disciplina = formData.disciplina || formData.subject || '';
  const serie = formData.serie || formData.grade || '';
  const professor = formData.professor || '';
  const data = formData.data || '';

  try {
    // Try to parse JSON directly from generated content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsedContent = JSON.parse(jsonMatch[0]);
        
        // Preserve form fields
        parsedContent.professor = professor;
        parsedContent.data = data;
        parsedContent.disciplina = disciplina;
        parsedContent.serie = serie;
        parsedContent.tema = tema;

        // Special handling for lesson plans - ensure resources are properly structured per stage
        if (materialType === 'plano-de-aula' && parsedContent.desenvolvimento) {
          console.log('🔧 Processing lesson plan resources by stage');
          
          // Process each stage to ensure unique and limited resources
          const processedEtapas = parsedContent.desenvolvimento.map((etapa: any, index: number) => {
            if (etapa.recursos && typeof etapa.recursos === 'string') {
              // Clean and limit resources for this specific stage
              const cleanedResources = cleanResourcesForStage(etapa.recursos);
              etapa.recursos = cleanedResources.join(', ');
              
              console.log(`✅ Stage ${etapa.etapa}: ${cleanedResources.length} resources - ${etapa.recursos}`);
            }
            return etapa;
          });
          
          parsedContent.desenvolvimento = processedEtapas;

          // Create comprehensive resources list from all stages without duplicates
          const allResources = new Set<string>();
          
          parsedContent.desenvolvimento.forEach((etapa: any) => {
            if (etapa.recursos && typeof etapa.recursos === 'string') {
              const recursos = etapa.recursos.split(',').map((r: string) => r.trim()).filter((r: string) => r.length > 0);
              recursos.forEach((recurso: string) => allResources.add(recurso));
            }
          });
          
          // Update main resources list
          parsedContent.recursos = Array.from(allResources);
          
          console.log(`📋 Total unique resources: ${parsedContent.recursos.length}`);
        }

        console.log('✅ Content parsed successfully:', materialType);
        return parsedContent;
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError);
      }
    }

    // Fallback: basic structure if parsing fails
    console.log('⚠️ Using fallback for basic structure');
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
    console.error('❌ Error in parseGeneratedContent:', error);
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
