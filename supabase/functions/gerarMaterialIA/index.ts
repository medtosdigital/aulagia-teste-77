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
            content: 'Você é um assistente especializado em criar materiais educacionais seguindo a BNCC. Retorne sempre conteúdo estruturado e pedagógico com base nas diretrizes brasileiras de educação.'
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

  switch (materialType) {
    case 'plano-de-aula':
      return `
Crie um plano de aula COMPLETO e DETALHADO sobre "${tema}" para a disciplina de ${disciplina}, série/ano ${serie}.

IMPORTANTE: Responda APENAS com o conteúdo estruturado, sem explicações adicionais.

ESTRUTURA OBRIGATÓRIA:

1. CABEÇALHO:
- Professor: ${professor}
- Data: ${data}
- Disciplina: ${disciplina}
- Série/Ano: ${serie}
- Tema: ${tema}
- Duração da Aula: [CALCULE: Se for mencionado "1 aula" = 50 minutos, "2 aulas" = 100 minutos, etc. Se não especificado, use 50 minutos]
- Código BNCC: [FORNEÇA códigos específicos da BNCC relacionados ao tema "${tema}" da disciplina ${disciplina} para ${serie}]

2. OBJETIVOS DE APRENDIZAGEM (4-5 objetivos específicos):
Liste objetivos claros que os alunos devem alcançar.

3. DESENVOLVIMENTO METODOLÓGICO:
Organize em 4 ETAPAS obrigatórias:

ETAPA 1 - INTRODUÇÃO (10 minutos):
- Atividade: [Descreva detalhadamente o que o professor fará]
- Tempo: 10 min
- Recursos: [Liste recursos específicos como Quadro, Material impresso, etc.]

ETAPA 2 - DESENVOLVIMENTO (25 minutos):
- Atividade: [Descreva detalhadamente o que o professor fará]
- Tempo: 25 min
- Recursos: [Liste recursos específicos como Slides, Quadro, Material impresso, etc.]

ETAPA 3 - PRÁTICA (10 minutos):
- Atividade: [Descreva detalhadamente o que o professor fará]
- Tempo: 10 min
- Recursos: [Liste recursos específicos]

ETAPA 4 - FECHAMENTO (5 minutos):
- Atividade: [Descreva detalhadamente o que o professor fará]
- Tempo: 5 min
- Recursos: [Liste recursos específicos]

4. RECURSOS DIDÁTICOS:
[Liste TODOS os recursos mencionados nas etapas acima, organizados e separados por vírgulas]

5. CONTEÚDOS PROGRAMÁTICOS:
Liste os conteúdos que serão abordados.

6. METODOLOGIA:
Descreva a metodologia geral da aula.

7. AVALIAÇÃO:
[Descreva especificamente COMO o professor irá avaliar se os alunos aprenderam o tema "${tema}"]

8. REFERÊNCIAS:
Liste referências bibliográficas adequadas.

IMPORTANTE: Seja específico, prático e adequado para ${serie}. Use linguagem pedagógica profissional.
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
- BNCC: Forneça códigos específicos da BNCC relacionados ao tema

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
- BNCC: Forneça códigos específicos da BNCC relacionados ao tema

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
- BNCC: Forneça códigos específicos da BNCC relacionados aos assuntos

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

  switch (materialType) {
    case 'plano-de-aula':
      // Calcular duração da aula baseado no contexto
      let duracaoAula = '50 minutos'; // padrão
      if (duracao.includes('2') || content.includes('100 min')) {
        duracaoAula = '100 minutos';
      } else if (duracao.includes('3') || content.includes('150 min')) {
        duracaoAula = '150 minutos';
      }

      // Extrair código BNCC do conteúdo gerado
      const codigoBncc = extractBNCCCode(content, disciplina, serie) || `Código BNCC específico para ${tema} - ${disciplina} - ${serie}`;

      // Extrair objetivos
      const objetivos = extractObjectives(content) || [
        `Compreender os conceitos fundamentais sobre ${tema}`,
        `Aplicar conhecimentos de ${tema} em situações práticas`,
        `Desenvolver habilidades de análise crítica sobre o tema`,
        `Relacionar ${tema} com situações do cotidiano`
      ];

      // Extrair etapas do desenvolvimento metodológico
      const desenvolvimentoEtapas = extractMethodologicalDevelopment(content) || [
        {
          etapa: 'Introdução',
          atividade: `Apresentação do tema "${tema}" através de questionamentos para ativar conhecimentos prévios dos alunos.`,
          tempo: '10 min',
          recursos: 'Quadro, Material impresso'
        },
        {
          etapa: 'Desenvolvimento',
          atividade: `Exposição dialogada dos principais conceitos de ${tema} com exemplos práticos e interação com os alunos.`,
          tempo: '25 min',
          recursos: 'Slides, Quadro, Material impresso'
        },
        {
          etapa: 'Prática',
          atividade: `Atividade prática em grupos aplicando os conceitos de ${tema} através de exercícios dirigidos.`,
          tempo: '10 min',
          recursos: 'Folhas de atividade, Lápis, Material impresso'
        },
        {
          etapa: 'Fechamento',
          atividade: `Síntese dos principais pontos sobre ${tema} com feedback dos alunos e esclarecimento de dúvidas.`,
          tempo: '5 min',
          recursos: 'Quadro'
        }
      ];

      // Compilar todos os recursos didáticos
      const recursosDidaticos = compileDidacticResources(desenvolvimentoEtapas);

      // Extrair avaliação
      const avaliacao = extractEvaluation(content, tema) || `Avaliação formativa através da observação da participação dos alunos nas discussões e atividades práticas sobre ${tema}. Verificação da compreensão através de perguntas direcionadas e análise das respostas nas atividades propostas.`;

      return {
        titulo: `Plano de Aula - ${tema}`,
        professor,
        data,
        disciplina,
        serie,
        tema,
        duracaoAula,
        codigoBncc,
        objetivos,
        desenvolvimentoMetodologico: desenvolvimentoEtapas,
        recursosDidaticos,
        conteudosProgramaticos: extractProgrammaticContent(content) || [
          `Conceitos fundamentais de ${tema}`,
          `Aplicações práticas de ${tema}`,
          `Relações de ${tema} com o cotidiano`
        ],
        metodologia: extractMethodology(content) || `Aula expositiva dialogada com uso de recursos visuais e atividades práticas para consolidação do aprendizado sobre ${tema}.`,
        avaliacao,
        referencias: extractReferences(content) || [
          'Base Nacional Comum Curricular (BNCC). Ministério da Educação, 2018.',
          `Livro didático de ${disciplina} adotado pela escola.`,
          'Recursos pedagógicos complementares apropriados ao tema.'
        ]
      };

    case 'slides':
      return {
        titulo: `Slides - ${tema}`,
        professor,
        data,
        disciplina,
        serie,
        tema,
        duracao,
        bncc: extractBNCCCode(content, disciplina, serie) || `Código BNCC para ${tema}`,
        slides: extractSlides(content) || generateDefaultSlides(tema, disciplina)
      };

    case 'atividade':
      return {
        titulo: `Atividade - ${tema}`,
        professor,
        data,
        disciplina,
        serie,
        tema,
        duracao,
        bncc: extractBNCCCode(content, disciplina, serie) || `Código BNCC para ${tema}`,
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
        professor,
        data,
        disciplina,
        serie,
        tema,
        duracao,
        bncc: extractBNCCCode(content, disciplina, serie) || `Código BNCC para ${tema}`,
        instrucoes: extractFromContent(content, 'instruções') || `Responda às questões abaixo sobre ${tema}.`,
        questoes: extractQuestions(content) || generateDefaultQuestions(tema, formData.numeroQuestoes || 5),
        criterios_avaliacao: extractListFromContent(content, 'critérios') || [
          'Compreensão dos conceitos',
          'Clareza na expressão das ideias',
          'Aplicação correta do conhecimento'
        ]
      };

    default:
      return { content };
  }
}

// Funções auxiliares específicas para extração de conteúdo

function extractBNCCCode(content: string, disciplina: string, serie: string): string | null {
  const bnccRegex = /(?:BNCC|Código BNCC|código.*?bncc)[:\s]*([A-Z]{2}\d{2}[A-Z]{2}\d{2}(?:[A-Z]{2}\d{2})?)/gi;
  const match = content.match(bnccRegex);
  if (match && match[0]) {
    return match[0].replace(/(?:BNCC|Código BNCC|código.*?bncc)[:\s]*/gi, '').trim();
  }
  
  // Se não encontrar, gerar um código baseado na disciplina e série
  const disciplinaCodes: { [key: string]: string } = {
    'matemática': 'EF',
    'português': 'EF',
    'história': 'EF',
    'geografia': 'EF',
    'ciências': 'EF',
    'arte': 'EF',
    'educação física': 'EF'
  };
  
  const disciplinaKey = disciplina.toLowerCase();
  const prefix = disciplinaCodes[disciplinaKey] || 'EF';
  const serieNum = serie.replace(/\D/g, '');
  
  return `${prefix}${serieNum.padStart(2, '0')}MA01, ${prefix}${serieNum.padStart(2, '0')}MA02`;
}

function extractObjectives(content: string): string[] | null {
  const objectivesSection = content.match(/objetivos.*?aprendizagem[:\s]*(.*?)(?=\n.*?[A-Z]|\n\d\.|$)/gis);
  if (objectivesSection && objectivesSection[0]) {
    const objectives = objectivesSection[0]
      .split(/\n|•|-/)
      .map(item => item.replace(/objetivos.*?aprendizagem[:\s]*/gi, '').trim())
      .filter(item => item.length > 10);
    
    return objectives.length > 0 ? objectives : null;
  }
  return null;
}

function extractMethodologicalDevelopment(content: string): any[] | null {
  const developmentSection = content.match(/desenvolvimento.*?metodológico[:\s]*(.*?)(?=\n.*?recursos|\n.*?conteúdo|$)/gis);
  if (developmentSection && developmentSection[0]) {
    const stages = [];
    const stageRegex = /(?:etapa\s*\d*\s*-?\s*)?(introdução|desenvolvimento|prática|fechamento)[:\s]*\n?.*?atividade[:\s]*(.*?)\n.*?tempo[:\s]*(.*?)\n.*?recursos[:\s]*(.*?)(?=\n.*?etapa|\n.*?recursos|\n.*?conteúdo|$)/gis;
    
    let match;
    while ((match = stageRegex.exec(developmentSection[0])) !== null) {
      stages.push({
        etapa: match[1]?.trim() || 'Etapa',
        atividade: match[2]?.trim() || 'Atividade',
        tempo: match[3]?.trim() || '10 min',
        recursos: match[4]?.trim() || 'Recursos necessários'
      });
    }
    
    return stages.length > 0 ? stages : null;
  }
  return null;
}

function compileDidacticResources(etapas: any[]): string {
  const allResources = new Set<string>();
  
  etapas.forEach(etapa => {
    if (etapa.recursos) {
      const recursos = etapa.recursos.split(',').map((r: string) => r.trim());
      recursos.forEach((recurso: string) => {
        if (recurso && recurso.length > 0) {
          allResources.add(recurso);
        }
      });
    }
  });
  
  return Array.from(allResources).join(', ');
}

function extractEvaluation(content: string, tema: string): string | null {
  const evaluationSection = content.match(/avaliação[:\s]*(.*?)(?=\n.*?referência|\n.*?bibliografia|$)/gis);
  if (evaluationSection && evaluationSection[0]) {
    return evaluationSection[0].replace(/avaliação[:\s]*/gi, '').trim();
  }
  return null;
}

function extractProgrammaticContent(content: string): string[] | null {
  const contentSection = content.match(/conteúdos.*?programáticos[:\s]*(.*?)(?=\n.*?metodologia|\n.*?avaliação|$)/gis);
  if (contentSection && contentSection[0]) {
    const contents = contentSection[0]
      .split(/\n|•|-/)
      .map(item => item.replace(/conteúdos.*?programáticos[:\s]*/gi, '').trim())
      .filter(item => item.length > 5);
    
    return contents.length > 0 ? contents : null;
  }
  return null;
}

function extractMethodology(content: string): string | null {
  const methodologySection = content.match(/metodologia[:\s]*(.*?)(?=\n.*?avaliação|\n.*?recursos|$)/gis);
  if (methodologySection && methodologySection[0]) {
    return methodologySection[0].replace(/metodologia[:\s]*/gi, '').trim();
  }
  return null;
}

function extractReferences(content: string): string[] | null {
  const referencesSection = content.match(/referências[:\s]*(.*?)$/gis);
  if (referencesSection && referencesSection[0]) {
    const references = referencesSection[0]
      .split(/\n|•|-/)
      .map(item => item.replace(/referências[:\s]*/gi, '').trim())
      .filter(item => item.length > 10);
    
    return references.length > 0 ? references : null;
  }
  return null;
}

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
