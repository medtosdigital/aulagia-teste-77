
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em criar materiais educacionais seguindo a BNCC. Retorne sempre conteúdo estruturado e pedagógico.'
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
  const tema = formData.tema || formData.topic || 'Conteúdo educacional';
  const disciplina = formData.disciplina || formData.subject || 'Disciplina';
  const serie = formData.serie || formData.grade || 'Série';
  const professor = formData.professor || 'Professor';
  const data = formData.data || new Date().toLocaleDateString('pt-BR');
  const duracao = formData.duracao || '50 minutos';
  const bncc = formData.bncc || 'Habilidades da BNCC relacionadas ao tema';

  switch (materialType) {
    case 'plano-de-aula':
      return `
Crie um plano de aula completo sobre "${tema}" para a disciplina de ${disciplina}, série ${serie}.

DADOS DO CABEÇALHO:
- Professor: ${professor}
- Data: ${data}
- Disciplina: ${disciplina}
- Série: ${serie}
- Tema: ${tema}
- Duração: ${duracao}
- BNCC: ${bncc}

ESTRUTURA OBRIGATÓRIA:
1. Objetivos (3-4 objetivos específicos)
2. Desenvolvimento metodológico (4 etapas: Introdução 10min, Desenvolvimento 25min, Prática 10min, Fechamento 5min)
3. Recursos necessários
4. Conteúdos programáticos
5. Metodologia
6. Avaliação
7. Referências

Para o desenvolvimento, crie 4 etapas detalhadas com atividades específicas, tempo e recursos para cada uma.
Seja específico e prático. Use linguagem pedagógica adequada.
`;

    case 'slides':
      return `
Crie uma apresentação em slides sobre "${tema}" para a disciplina de ${disciplina}, série ${serie}.

DADOS DO CABEÇALHO:
- Professor: ${professor}
- Data: ${data}
- Disciplina: ${disciplina}
- Série: ${serie}
- Tema: ${tema}
- Duração: ${duracao}
- BNCC: ${bncc}

ESTRUTURA DOS SLIDES:
1. Slide de capa com o tema
2. Slide de objetivos (lista com 3-4 objetivos)
3. Slide de introdução
4. 2-3 slides de desenvolvimento do conteúdo
5. Slide de conclusão

Para cada slide, forneça:
- Número do slide
- Título
- Conteúdo (texto, listas, pontos principais)
- Tipo (capa, lista, texto)

Use linguagem clara e didática apropriada para a série.
`;

    case 'atividade':
      const numQuestoes = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
      const tipoQuestoes = formData.tipoQuestoes || 'mistas';
      
      return `
Crie uma atividade educacional sobre "${tema}" para a disciplina de ${disciplina}, série ${serie}.

DADOS DO CABEÇALHO:
- Professor: ${professor}
- Data: ${data}
- Disciplina: ${disciplina}
- Série: ${serie}
- Tema: ${tema}
- Duração: ${duracao}
- BNCC: ${bncc}

ESPECIFICAÇÕES:
- Número de questões: ${numQuestoes}
- Tipo de questões: ${tipoQuestoes}

ESTRUTURA:
1. Instruções claras para o aluno
2. ${numQuestoes} questões sobre o tema
3. Critérios de avaliação

Para questões abertas: formule perguntas que estimulem reflexão e aplicação do conhecimento.
Para questões fechadas: crie alternativas com 4 opções (a, b, c, d) e indique a resposta correta.
Para questões mistas: combine ambos os tipos.

Adeque o nível de dificuldade à série informada.
`;

    case 'avaliacao':
      const numQuestoesAval = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
      const tipoQuestoesAval = formData.tipoQuestoes || 'mistas';
      const assuntos = formData.assuntos || formData.subjects || [tema];
      
      return `
Crie uma avaliação educacional sobre os seguintes assuntos: ${assuntos.join(', ')} para a disciplina de ${disciplina}, série ${serie}.

DADOS DO CABEÇALHO:
- Professor: ${professor}
- Data: ${data}
- Disciplina: ${disciplina}
- Série: ${serie}
- Tema: ${assuntos.join(', ')}
- Duração: ${duracao}
- BNCC: ${bncc}

ESPECIFICAÇÕES:
- Número de questões: ${numQuestoesAval}
- Tipo de questões: ${tipoQuestoesAval}

ESTRUTURA:
1. Instruções claras para a avaliação
2. ${numQuestoesAval} questões distribuídas entre os assuntos
3. Critérios de avaliação e pontuação

Para questões abertas: crie questões que avaliem compreensão, análise e aplicação.
Para questões fechadas: crie alternativas com 4 opções e indique a resposta correta com explicação.
Para questões mistas: combine ambos os tipos equilibradamente.

Distribua as questões entre todos os assuntos mencionados. Use nível apropriado para avaliação formal.
`;

    default:
      return `Crie um material educacional sobre "${tema}" para ${disciplina}, série ${serie}.`;
  }
}

function parseGeneratedContent(materialType: string, content: string, formData: MaterialFormData): any {
  const tema = formData.tema || formData.topic || 'Conteúdo';
  const disciplina = formData.disciplina || formData.subject || 'Disciplina';
  const serie = formData.serie || formData.grade || 'Série';
  const professor = formData.professor || 'Professor';
  const data = formData.data || new Date().toLocaleDateString('pt-BR');
  const duracao = formData.duracao || '50 minutos';
  const bncc = formData.bncc || 'Habilidades da BNCC relacionadas ao tema';

  // Common header for all materials
  const cabecalho = {
    professor,
    data,
    disciplina,
    serie,
    tema,
    duracao,
    bncc
  };

  switch (materialType) {
    case 'plano-de-aula':
      return {
        titulo: `Plano de Aula - ${tema}`,
        cabecalho,
        professor,
        data,
        disciplina,
        serie,
        tema,
        duracao,
        bncc,
        objetivos: extractListFromContent(content, 'objetivos') || [
          `Compreender os conceitos fundamentais sobre ${tema}`,
          `Aplicar conhecimentos de ${tema} em situações práticas`,
          `Desenvolver habilidades de análise crítica sobre o tema`
        ],
        desenvolvimento: extractDevelopmentSteps(content) || generateDefaultDevelopment(tema, disciplina),
        recursos: extractFromContent(content, 'recursos') || 'Quadro/Lousa, Projetor multimídia, Material impresso',
        conteudos: extractListFromContent(content, 'conteúdos') || [
          `Introdução ao ${tema}`,
          `Conceitos principais e definições`,
          `Aplicações práticas e exemplos`
        ],
        metodologia: extractFromContent(content, 'metodologia') || `Aula expositiva dialogada com uso de recursos visuais, seguida de atividades práticas para consolidação do aprendizado sobre ${tema}.`,
        avaliacao: extractFromContent(content, 'avaliação') || `Avaliação formativa através da participação nas discussões e atividades práticas sobre ${tema}.`,
        referencias: extractListFromContent(content, 'referências') || [
          'Referência bibliográfica 1',
          'Referência bibliográfica 2'
        ]
      };

    case 'slides':
      return {
        titulo: `Slides - ${tema}`,
        cabecalho,
        professor,
        data,
        disciplina,
        serie,
        tema,
        duracao,
        bncc,
        slides: extractSlides(content) || generateDefaultSlides(tema, disciplina)
      };

    case 'atividade':
      return {
        titulo: `Atividade - ${tema}`,
        cabecalho,
        professor,
        data,
        disciplina,
        serie,
        tema,
        duracao,
        bncc,
        instrucoes: extractFromContent(content, 'instruções') || `Complete as questões abaixo sobre ${tema}. Leia atentamente cada enunciado antes de responder.`,
        questoes: extractQuestions(content) || generateDefaultQuestions(tema, formData.numeroQuestoes || 5),
        criterios_avaliacao: extractListFromContent(content, 'critérios') || [
          'Compreensão dos conceitos',
          'Clareza na expressão das ideias',
          'Aplicação correta do conhecimento'
        ]
      };

    case 'avaliacao':
      return {
        titulo: `Avaliação - ${tema}`,
        cabecalho,
        professor,
        data,
        disciplina,
        serie,
        tema,
        duracao,
        bncc,
        instrucoes: extractFromContent(content, 'instruções') || `Responda às questões abaixo sobre ${tema}.`,
        questoes: extractQuestions(content) || generateDefaultQuestions(tema, formData.numeroQuestoes || 5),
        criterios_avaliacao: extractListFromContent(content, 'critérios') || [
          'Compreensão dos conceitos',
          'Clareza na expressão das ideias',
          'Aplicação correta do conhecimento'
        ]
      };

    default:
      return { content, cabecalho };
  }
}

// Helper functions to extract content from AI response
function extractFromContent(content: string, section: string): string | null {
  const regex = new RegExp(`${section}:?\\s*([^\\n]+(?:\\n(?!\\w+:)[^\\n]+)*)`, 'gi');
  const match = content.match(regex);
  return match ? match[0].replace(/^[^:]*:?\s*/, '').trim() : null;
}

function extractListFromContent(content: string, section: string): string[] | null {
  const sectionContent = extractFromContent(content, section);
  if (!sectionContent) return null;
  
  return sectionContent
    .split(/\n|•|-/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

function extractDevelopmentSteps(content: string): any[] | null {
  // Try to extract development steps with time and activities
  const steps = [];
  const stepRegex = /(\d+\.\s*)?(.+?)(\d+\s*min)/gi;
  const matches = content.matchAll(stepRegex);
  
  for (const match of matches) {
    steps.push({
      etapa: match[2]?.trim() || 'Etapa',
      atividade: match[0]?.trim() || 'Atividade',
      tempo: match[3]?.trim() || '10 min',
      recursos: 'Recursos necessários'
    });
  }
  
  return steps.length > 0 ? steps : null;
}

function extractSlides(content: string): any[] | null {
  const slides = [];
  const slideRegex = /slide\s*(\d+):?\s*([^\n]+)\n([^]*?)(?=slide\s*\d+|$)/gi;
  const matches = content.matchAll(slideRegex);
  
  for (const match of matches) {
    slides.push({
      numero: parseInt(match[1]) || slides.length + 1,
      titulo: match[2]?.trim() || 'Título do Slide',
      conteudo: match[3]?.trim() || 'Conteúdo do slide',
      tipo: slides.length === 0 ? 'capa' : 'texto'
    });
  }
  
  return slides.length > 0 ? slides : null;
}

function extractQuestions(content: string): any[] | null {
  const questions = [];
  const questionRegex = /(\d+)\.?\s*([^]*?)(?=\d+\.|$)/g;
  const matches = content.matchAll(questionRegex);
  
  for (const match of matches) {
    const questionText = match[2]?.trim();
    if (questionText) {
      questions.push({
        numero: parseInt(match[1]),
        tipo: questionText.includes('a)') ? 'multipla_escolha' : 'aberta',
        pergunta: questionText,
        ...(questionText.includes('a)') && {
          alternativas: extractAlternatives(questionText),
          resposta_correta: 0
        })
      });
    }
  }
  
  return questions.length > 0 ? questions : null;
}

function extractAlternatives(text: string): string[] {
  const alternatives = [];
  const altRegex = /[a-d]\)\s*([^\n]+)/gi;
  const matches = text.matchAll(altRegex);
  
  for (const match of matches) {
    alternatives.push(match[1]?.trim());
  }
  
  return alternatives.length > 0 ? alternatives : [
    'Primeira alternativa',
    'Segunda alternativa', 
    'Terceira alternativa',
    'Quarta alternativa'
  ];
}

// Default generators for fallback
function generateDefaultDevelopment(tema: string, disciplina: string) {
  return [
    {
      etapa: 'Introdução',
      atividade: `Apresentação do tema "${tema}" contextualizando sua importância para ${disciplina}.`,
      tempo: '10 min',
      recursos: 'Quadro/Lousa, Projetor multimídia'
    },
    {
      etapa: 'Desenvolvimento',
      atividade: `Exposição dialogada dos principais conceitos de ${tema} com exemplos práticos.`,
      tempo: '25 min',
      recursos: 'Material impresso, Projetor multimídia'
    },
    {
      etapa: 'Prática',
      atividade: `Atividade prática aplicando os conceitos de ${tema} em situações-problema.`,
      tempo: '10 min',
      recursos: 'Material impresso, Recursos digitais'
    },
    {
      etapa: 'Fechamento',
      atividade: `Revisão dos pontos principais sobre ${tema} e feedback coletivo.`,
      tempo: '5 min',
      recursos: 'Quadro/Lousa'
    }
  ];
}

function generateDefaultSlides(tema: string, disciplina: string) {
  return [
    {
      numero: 1,
      titulo: tema,
      conteudo: `Apresentação sobre ${tema} em ${disciplina}`,
      tipo: 'capa'
    },
    {
      numero: 2,
      titulo: 'Objetivos',
      conteudo: `• Compreender ${tema}\n• Aplicar conceitos na prática\n• Desenvolver pensamento crítico`,
      tipo: 'lista'
    },
    {
      numero: 3,
      titulo: 'Desenvolvimento',
      conteudo: `Principais aspectos e características de ${tema}.`,
      tipo: 'texto'
    }
  ];
}

function generateDefaultQuestions(tema: string, count: number) {
  const questions = [];
  for (let i = 1; i <= count; i++) {
    questions.push({
      numero: i,
      tipo: i % 2 === 1 ? 'aberta' : 'multipla_escolha',
      pergunta: `Questão ${i} sobre ${tema}`,
      ...(i % 2 === 0 && {
        alternativas: [
          'Primeira alternativa',
          'Segunda alternativa',
          'Terceira alternativa',
          'Quarta alternativa'
        ],
        resposta_correta: 0
      })
    });
  }
  return questions;
}
