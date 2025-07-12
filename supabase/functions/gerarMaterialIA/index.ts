
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting material generation...');
    const { materialType, formData } = await req.json();
    console.log('📝 Material type:', materialType);
    console.log('📋 Form data:', formData);

    let prompt = '';
    let responseFormat = '';

    switch (materialType) {
      case 'plano-de-aula':
        prompt = createLessonPlanPrompt(formData);
        responseFormat = getLessonPlanResponseFormat();
        break;

      case 'slides':
        prompt = createSlidesPrompt(formData);
        responseFormat = getSlidesResponseFormat();
        break;

      case 'atividade':
        prompt = createActivityPrompt(formData);
        responseFormat = getActivityResponseFormat();
        break;

      case 'avaliacao':
        prompt = createAssessmentPrompt(formData);
        responseFormat = getAssessmentResponseFormat();
        break;

      default:
        throw new Error(`Tipo de material não suportado: ${materialType}`);
    }

    console.log('🤖 Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em educação brasileira, com conhecimento profundo da BNCC (Base Nacional Comum Curricular). Crie conteúdo educacional de alta qualidade, contextualizado para a realidade brasileira.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nFormato de resposta esperado:\n${responseFormat}`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('✅ Content generated successfully');
    console.log('📄 Generated content length:', generatedContent.length);

    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
      console.log('✅ Content parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      console.error('🔍 Raw content:', generatedContent);
      throw new Error('Erro ao processar resposta da IA');
    }

    // Post-process the content based on material type
    if (materialType === 'plano-de-aula') {
      parsedContent = postProcessLessonPlan(parsedContent);
    }

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
      error: error.message || 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createLessonPlanPrompt(formData: any): string {
  const { tema, disciplina, serie, professor = 'Professor', data = new Date().toLocaleDateString('pt-BR'), duracao = '50 minutos' } = formData;

  return `
Crie um plano de aula completo e detalhado para:

INFORMAÇÕES BÁSICAS:
- Tema: ${tema}
- Disciplina: ${disciplina}
- Série/Ano: ${serie}
- Professor: ${professor}
- Data: ${data}
- Duração: ${duracao}

INSTRUÇÕES ESPECÍFICAS:

1. OBJETIVOS: Crie 4-6 objetivos claros e específicos usando verbos de ação (compreender, analisar, identificar, aplicar, etc.)

2. HABILIDADES BNCC: Liste 4-6 habilidades específicas da BNCC relacionadas ao tema, disciplina e série. Seja preciso com códigos e descrições das habilidades.

3. DESENVOLVIMENTO DA AULA: Crie uma tabela detalhada com 6-8 etapas, incluindo:
   - Introdução/Motivação (5-10 min)
   - Apresentação do conteúdo (15-20 min)
   - Atividade prática (10-15 min)
   - Discussão/Debate (5-10 min)
   - Sistematização (5 min)
   - Avaliação (5 min)
   Para cada etapa, especifique RECURSOS ESPECÍFICOS (não genéricos)

4. RECURSOS DIDÁTICOS: Extraia e liste TODOS os recursos mencionados na tabela de desenvolvimento, mais recursos adicionais relevantes

5. CONTEÚDOS PROGRAMÁTICOS: Liste os conceitos e tópicos específicos que serão abordados

6. METODOLOGIA: Descreva detalhadamente as estratégias pedagógicas que serão utilizadas

7. AVALIAÇÃO: Explique como os alunos serão avaliados (formativa, somativa, critérios)

8. REFERÊNCIAS: Liste 4-6 referências bibliográficas confiáveis (livros didáticos, artigos, sites educacionais)

Contextualize todo o conteúdo para a realidade brasileira e faixa etária correspondente à série informada.
`;
}

function createSlidesPrompt(formData: any): string {
  const { tema, disciplina, serie } = formData;

  return `
Crie uma apresentação educativa em slides sobre:

INFORMAÇÕES:
- Tema: ${tema}
- Disciplina: ${disciplina}
- Série: ${serie}

Crie conteúdo para 12 slides com a seguinte estrutura:

SLIDE 1 - TÍTULO:
- Título principal atrativo
- Subtítulo explicativo
- Prompt para imagem da capa

SLIDE 2 - OBJETIVOS:
- 4 objetivos principais da apresentação

SLIDES 3-4 - INTRODUÇÃO E CONCEITOS:
- Texto introdutório envolvente
- Conceito principal destacado
- Prompts para imagens explicativas

SLIDES 5-8 - DESENVOLVIMENTO:
- 4 tópicos principais do tema
- Cada slide com título e texto explicativo
- Prompts para imagens de apoio

SLIDE 9 - EXEMPLO PRÁTICO:
- Exemplo real e contextualizado
- Prompt para imagem do exemplo

SLIDE 10 - TABELA/COMPARAÇÃO:
- Tabela 3x3 com informações organizadas
- Títulos das colunas e dados das linhas

SLIDE 11 - ATIVIDADE:
- Pergunta interativa com 4 alternativas (A, B, C, D)

SLIDE 12 - CONCLUSÃO:
- Texto de fechamento
- 2 pontos-chave e 3 próximos passos

Para cada prompt de imagem, seja específico e educativo, focando em ilustrações que ajudem na compreensão do conteúdo.
`;
}

function createActivityPrompt(formData: any): string {
  const { tema, disciplina, serie, tipoQuestoes, numeroQuestoes } = formData;

  return `
Crie uma atividade educacional sobre:

INFORMAÇÕES:
- Tema: ${tema}
- Disciplina: ${disciplina}
- Série: ${serie}
- Tipos de questões: ${tipoQuestoes}
- Número de questões: ${numeroQuestoes}

Crie:
1. Instruções claras para a atividade
2. ${numeroQuestoes} questões variadas dos tipos: ${tipoQuestoes}

Para cada questão, inclua:
- Enunciado claro e contextualizado
- Tipo de questão
- Opções (quando aplicável)
- Elementos visuais se necessário (descrição para imagens, gráficos, etc.)

Adapte a linguagem e complexidade para a série indicada.
`;
}

function createAssessmentPrompt(formData: any): string {
  const { assuntos, disciplina, serie, tiposQuestoes, quantidadeQuestoes } = formData;

  return `
Crie uma avaliação educacional sobre:

INFORMAÇÕES:
- Assuntos: ${assuntos?.join(', ')}
- Disciplina: ${disciplina}
- Série: ${serie}
- Tipos de questões: ${tiposQuestoes?.join(', ')}
- Quantidade: ${quantidadeQuestoes}

Crie:
1. Instruções da avaliação
2. ${quantidadeQuestoes} questões dos tipos especificados
3. Critérios de avaliação

Para cada questão:
- Enunciado claro
- Pontuação adequada
- Opções bem formuladas (quando aplicável)
- Nível de dificuldade apropriado para a série

Distribua as questões equilibradamente entre os assuntos informados.
`;
}

function getLessonPlanResponseFormat(): string {
  return `
{
  "titulo": "Título do plano de aula",
  "professor": "Nome do professor",
  "disciplina": "Disciplina",
  "serie": "Série/Ano",
  "tema": "Tema da aula",
  "data": "Data da aula",
  "duracao": "Duração da aula",
  "bncc": "Códigos e descrições das habilidades BNCC",
  "objetivos": [
    "Objetivo 1",
    "Objetivo 2",
    "Objetivo 3",
    "Objetivo 4"
  ],
  "habilidades": [
    "Habilidade BNCC 1 com código e descrição",
    "Habilidade BNCC 2 com código e descrição",
    "Habilidade BNCC 3 com código e descrição",
    "Habilidade BNCC 4 com código e descrição"
  ],
  "desenvolvimento": [
    {
      "etapa": "Introdução",
      "tempo": "10 min",
      "atividade": "Descrição da atividade",
      "recursos": "Recursos específicos necessários"
    }
  ],
  "recursos": [
    "Recurso específico 1",
    "Recurso específico 2",
    "Recurso específico 3"
  ],
  "conteudos_programaticos": [
    "Conteúdo 1",
    "Conteúdo 2",
    "Conteúdo 3"
  ],
  "metodologia": "Descrição detalhada da metodologia",
  "avaliacao": "Descrição dos critérios e formas de avaliação",
  "referencias": [
    "Referência 1",
    "Referência 2",
    "Referência 3"
  ]
}
`;
}

function getSlidesResponseFormat(): string {
  return `
{
  "slide_1_titulo": "Título principal",
  "slide_1_subtitulo": "Subtítulo",
  "tema_imagem": "Prompt para imagem da capa",
  "professor": "Professor",
  "data": "Data",
  "disciplina": "Disciplina",
  "serie": "Série",
  "objetivo_1": "Objetivo 1",
  "objetivo_2": "Objetivo 2",
  "objetivo_3": "Objetivo 3",
  "objetivo_4": "Objetivo 4",
  "introducao_texto": "Texto de introdução",
  "introducao_imagem": "Prompt para imagem de introdução",
  "conceitos_texto": "Texto sobre conceitos",
  "conceito_principal": "Conceito principal destacado",
  "conceitos_imagem": "Prompt para imagem de conceitos",
  "desenvolvimento_1_titulo": "Título do tópico 1",
  "desenvolvimento_1_texto": "Texto do tópico 1",
  "desenvolvimento_1_imagem": "Prompt para imagem do tópico 1",
  "desenvolvimento_2_titulo": "Título do tópico 2",
  "desenvolvimento_2_texto": "Texto do tópico 2",
  "desenvolvimento_2_imagem": "Prompt para imagem do tópico 2",
  "desenvolvimento_3_titulo": "Título do tópico 3",
  "desenvolvimento_3_texto": "Texto do tópico 3",
  "desenvolvimento_3_imagem": "Prompt para imagem do tópico 3",
  "desenvolvimento_4_titulo": "Título do tópico 4",
  "desenvolvimento_4_texto": "Texto do tópico 4",
  "desenvolvimento_4_imagem": "Prompt para imagem do tópico 4",
  "exemplo_titulo": "Título do exemplo",
  "exemplo_conteudo": "Conteúdo do exemplo",
  "exemplo_imagem": "Prompt para imagem do exemplo",
  "tabela_titulo": "Título da tabela",
  "coluna_1": "Título coluna 1",
  "coluna_2": "Título coluna 2",
  "coluna_3": "Título coluna 3",
  "linha_1_col_1": "Dado 1,1",
  "linha_1_col_2": "Dado 1,2",
  "linha_1_col_3": "Dado 1,3",
  "linha_2_col_1": "Dado 2,1",
  "linha_2_col_2": "Dado 2,2",
  "linha_2_col_3": "Dado 2,3",
  "linha_3_col_1": "Dado 3,1",
  "linha_3_col_2": "Dado 3,2",
  "linha_3_col_3": "Dado 3,3",
  "atividade_pergunta": "Pergunta da atividade",
  "opcao_a": "Opção A",
  "opcao_b": "Opção B",
  "opcao_c": "Opção C",
  "opcao_d": "Opção D",
  "conclusao_texto": "Texto de conclusão",
  "ponto_chave_1": "Ponto-chave 1",
  "ponto_chave_2": "Ponto-chave 2",
  "proximo_passo_1": "Próximo passo 1",
  "proximo_passo_2": "Próximo passo 2",
  "proximo_passo_3": "Próximo passo 3"
}
`;
}

function getActivityResponseFormat(): string {
  return `
{
  "titulo": "Título da atividade",
  "professor": "Professor",
  "disciplina": "Disciplina",
  "serie": "Série",
  "tema": "Tema",
  "data": "Data",
  "duracao": "Duração",
  "bncc": "Habilidades BNCC",
  "instrucoes": "Instruções da atividade",
  "questoes": [
    {
      "numero": 1,
      "tipo": "multipla_escolha",
      "pergunta": "Pergunta da questão",
      "opcoes": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "imagem": "Descrição da imagem se necessário",
      "icones": ["ícone1", "ícone2"] 
    }
  ]
}
`;
}

function getAssessmentResponseFormat(): string {
  return `
{
  "titulo": "Título da avaliação",
  "professor": "Professor",
  "disciplina": "Disciplina",
  "serie": "Série",
  "tema": "Tema",
  "data": "Data",
  "duracao": "Duração",
  "bncc": "Habilidades BNCC",
  "instrucoes": "Instruções da avaliação",
  "questoes": [
    {
      "numero": 1,
      "tipo": "multipla_escolha",
      "pergunta": "Pergunta da questão",
      "opcoes": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "pontuacao": "2.0 pontos",
      "imagem": "Descrição da imagem se necessário"
    }
  ],
  "criterios_avaliacao": [
    "Critério 1",
    "Critério 2",
    "Critério 3"
  ]
}
`;
}

function postProcessLessonPlan(content: any): any {
  // Extract all resources from desenvolvimento table and add to recursos
  if (content.desenvolvimento && Array.isArray(content.desenvolvimento)) {
    const developmentResources = content.desenvolvimento
      .map(etapa => etapa.recursos)
      .filter(resource => resource && resource.trim() !== '')
      .flatMap(resource => 
        resource.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '')
      );
    
    // Combine existing recursos with development resources
    const existingResources = content.recursos || [];
    const allResources = [...existingResources, ...developmentResources];
    
    // Remove duplicates and empty items
    content.recursos = Array.from(new Set(allResources.filter(item => item && item.trim() !== '')));
  }

  return content;
}
