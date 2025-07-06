
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
Você é um professor especialista em planejamento pedagógico de acordo com a BNCC (Base Nacional Comum Curricular).

Crie um plano de aula diário completo com base nas seguintes informações:

TEMA DA AULA: ${tema}
DISCIPLINA: ${disciplina}
TURMA: ${serie}
PROFESSOR: ${professor}
DATA: ${data}
DURAÇÃO: ${duracao}

Desenvolva o plano de aula com os seguintes tópicos:

**1. DURAÇÃO DA AULA:**
${duracao}

**2. CÓDIGOS DA BNCC:**
Liste os códigos da BNCC aplicáveis ao tema da aula, considerando a disciplina e a turma. Formato: EF03MA01 - Descrição da habilidade

**3. OBJETIVOS DE APRENDIZAGEM:**
- Objetivo 1: [descrição clara]
- Objetivo 2: [descrição clara]
- Objetivo 3: [descrição clara]

**4. HABILIDADES:**
- Habilidade 1: [descrição]
- Habilidade 2: [descrição]
- Habilidade 3: [descrição]

**5. DESENVOLVIMENTO METODOLÓGICO:**

**INTRODUÇÃO**
Tempo: 10 min
Atividade: [descrição da atividade]
Recursos: [lista de recursos]

**DESENVOLVIMENTO**
Tempo: 25 min
Atividade: [descrição da atividade]
Recursos: [lista de recursos]

**PRÁTICA**
Tempo: 10 min
Atividade: [descrição da atividade]
Recursos: [lista de recursos]

**FECHAMENTO**
Tempo: 5 min
Atividade: [descrição da atividade]
Recursos: [lista de recursos]

**6. RECURSOS DIDÁTICOS:**
Quadro, Material impresso, Slides, Livro didático

**7. CONTEÚDOS PROGRAMÁTICOS:**
- Conteúdo 1
- Conteúdo 2
- Conteúdo 3

**8. METODOLOGIA:**
[Descrição da metodologia aplicada]

**9. AVALIAÇÃO:**
[Descrição da avaliação a ser aplicada]

**10. REFERÊNCIAS:**
- Base Nacional Comum Curricular (BNCC). Ministério da Educação, 2018.
- Livro didático de ${disciplina} adotado pela escola.

Certifique-se de que o conteúdo seja adaptado à faixa etária e nível da turma especificada.
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

**SLIDE 1: CAPA**
Título: ${tema}
Professor: ${professor}
Data: ${data}

**SLIDE 2: OBJETIVOS**
- Objetivo 1
- Objetivo 2
- Objetivo 3

**SLIDE 3: INTRODUÇÃO**
Conteúdo introdutório sobre o tema

**SLIDE 4: DESENVOLVIMENTO 1**
Primeiro aspecto do conteúdo

**SLIDE 5: DESENVOLVIMENTO 2**
Segundo aspecto do conteúdo

**SLIDE 6: CONCLUSÃO**
Síntese e conclusões

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

ESPECIFICAÇÕES:
- Número de questões: ${numQuestoes}
- Tipo de questões: ${tipoQuestoes}

**INSTRUÇÕES:**
Complete as questões abaixo sobre ${tema}. Leia atentamente cada enunciado antes de responder.

**QUESTÕES:**

${Array.from({length: numQuestoes}, (_, i) => `
**QUESTÃO ${i + 1}:**
[Pergunta sobre ${tema}]
${tipoQuestoes === 'fechadas' || tipoQuestoes === 'mistas' ? `
a) Alternativa A
b) Alternativa B  
c) Alternativa C
d) Alternativa D
` : ''}
`).join('')}

**CRITÉRIOS DE AVALIAÇÃO:**
- Compreensão dos conceitos
- Clareza na expressão das ideias
- Aplicação correta do conhecimento

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
- Assuntos: ${assuntos.join(', ')}
- Duração: ${duracao}

ESPECIFICAÇÕES:
- Número de questões: ${numQuestoesAval}
- Tipo de questões: ${tipoQuestoesAval}

**INSTRUÇÕES:**
Responda às questões abaixo sobre ${assuntos.join(', ')}.

**QUESTÕES:**

${Array.from({length: numQuestoesAval}, (_, i) => `
**QUESTÃO ${i + 1}:**
[Pergunta sobre um dos assuntos: ${assuntos[i % assuntos.length]}]
${tipoQuestoesAval === 'fechadas' || tipoQuestoesAval === 'mistas' ? `
a) Alternativa A
b) Alternativa B
c) Alternativa C  
d) Alternativa D
` : ''}
`).join('')}

**CRITÉRIOS DE AVALIAÇÃO:**
- Compreensão dos conceitos (25%)
- Clareza na expressão das ideias (25%)
- Aplicação correta do conhecimento (50%)

Use nível apropriado para avaliação formal.
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

  try {
    switch (materialType) {
      case 'plano-de-aula':
        return {
          titulo: `Plano de Aula - ${tema}`,
          professor,
          data,
          disciplina,
          serie,
          tema,
          duracao: formData.duracao || '50 minutos',
          bncc: extractBNCCCodes(content) || `EF03${getSubjectCode(disciplina)}01`,
          objetivos: extractObjectives(content) || [
            `Compreender os conceitos fundamentais sobre ${tema}`,
            `Aplicar conhecimentos de ${tema} em situações práticas`,
            `Desenvolver habilidades de análise crítica sobre ${tema}`
          ],
          habilidades: extractSkills(content) || [
            `Identificar elementos relacionados a ${tema}`,
            `Analisar e interpretar informações sobre ${tema}`,
            `Aplicar conceitos de ${tema} em diferentes contextos`
          ],
          desenvolvimento: extractDevelopmentSteps(content) || [
            {
              etapa: 'Introdução',
              tempo: '10 min',
              atividade: `Apresentação do tema ${tema} com questionamentos iniciais`,
              recursos: 'Quadro, Material visual'
            },
            {
              etapa: 'Desenvolvimento',
              tempo: '25 min',
              atividade: `Exposição dialogada sobre ${tema} com exemplos práticos`,
              recursos: 'Slides, Material impresso'
            },
            {
              etapa: 'Prática',
              tempo: '10 min',
              atividade: `Atividade prática sobre ${tema}`,
              recursos: 'Folhas de atividade'
            },
            {
              etapa: 'Fechamento',
              tempo: '5 min',
              atividade: `Síntese e esclarecimento de dúvidas sobre ${tema}`,
              recursos: 'Quadro'
            }
          ],
          recursos: extractResources(content) || ['Quadro', 'Material impresso', 'Slides', 'Livro didático'],
          conteudosProgramaticos: extractProgrammaticContent(content) || [
            `Conceitos fundamentais de ${tema}`,
            `Aplicações práticas de ${tema}`,
            `Relações de ${tema} com o cotidiano`
          ],
          metodologia: extractMethodology(content) || `Aula expositiva dialogada com atividades práticas sobre ${tema}`,
          avaliacao: extractEvaluation(content) || `Avaliação formativa através da participação e atividades sobre ${tema}`,
          referencias: extractReferences(content) || [
            'Base Nacional Comum Curricular (BNCC). Ministério da Educação, 2018.',
            `Livro didático de ${disciplina} adotado pela escola.`
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
          duracao: formData.duracao || '50 minutos',
          bncc: extractBNCCCodes(content) || `EF03${getSubjectCode(disciplina)}01`,
          slides: extractSlides(content) || [
            {
              numero: 1,
              titulo: tema,
              conteudo: `Apresentação sobre ${tema}`,
              tipo: 'capa'
            },
            {
              numero: 2,
              titulo: 'Objetivos',
              conteudo: [`Compreender ${tema}`, `Aplicar conceitos`, `Desenvolver habilidades`],
              tipo: 'lista'
            },
            {
              numero: 3,
              titulo: 'Desenvolvimento',
              conteudo: `Principais aspectos de ${tema}`,
              tipo: 'texto'
            }
          ]
        };

      case 'atividade':
        return {
          titulo: `Atividade - ${tema}`,
          professor,
          data,
          disciplina,
          serie,
          tema,
          duracao: formData.duracao || '50 minutos',
          bncc: extractBNCCCodes(content) || `EF03${getSubjectCode(disciplina)}01`,
          instrucoes: `Complete as questões abaixo sobre ${tema}. Leia atentamente cada enunciado antes de responder.`,
          questoes: extractQuestions(content, formData.numeroQuestoes || 5) || generateDefaultQuestions(tema, formData.numeroQuestoes || 5),
          criterios_avaliacao: [
            'Compreensão dos conceitos',
            'Clareza na expressão das ideias',
            'Aplicação correta do conhecimento'
          ]
        };

      case 'avaliacao':
        const assuntos = formData.assuntos || formData.subjects || [tema];
        return {
          titulo: `Avaliação - ${assuntos.join(', ')}`,
          professor,
          data,
          disciplina,
          serie,
          tema: assuntos.join(', '),
          duracao: formData.duracao || '50 minutos',
          bncc: extractBNCCCodes(content) || `EF03${getSubjectCode(disciplina)}01`,
          instrucoes: `Responda às questões abaixo sobre ${assuntos.join(', ')}.`,
          questoes: extractQuestions(content, formData.numeroQuestoes || 5) || generateDefaultQuestions(assuntos.join(', '), formData.numeroQuestoes || 5),
          criterios_avaliacao: [
            'Compreensão dos conceitos (25%)',
            'Clareza na expressão das ideias (25%)',
            'Aplicação correta do conhecimento (50%)'
          ]
        };

      default:
        return { content };
    }
  } catch (error) {
    console.error('Error parsing content:', error);
    // Return a basic structure to prevent failures
    return {
      titulo: `${materialType} - ${tema}`,
      professor,
      data,
      disciplina,
      serie,
      tema,
      content: content
    };
  }
}

// Helper functions for content extraction
function extractBNCCCodes(content: string): string {
  const bnccRegex = /EF\d{2}[A-Z]{2}\d{2}/g;
  const matches = content.match(bnccRegex);
  return matches ? matches.join(', ') : '';
}

function getSubjectCode(disciplina: string): string {
  const codes: { [key: string]: string } = {
    'matemática': 'MA',
    'português': 'LP',
    'língua portuguesa': 'LP',
    'história': 'HI',
    'geografia': 'GE',
    'ciências': 'CI',
    'arte': 'AR',
    'educação física': 'EF'
  };
  return codes[disciplina?.toLowerCase()] || 'GE';
}

function extractObjectives(content: string): string[] {
  const sections = content.split(/\*\*\d+\.\s*OBJETIVOS/i);
  if (sections.length > 1) {
    const objectiveSection = sections[1].split('**')[0];
    const objectives = objectiveSection.split(/[-•]\s*/).filter(obj => obj.trim().length > 10);
    if (objectives.length > 0) {
      return objectives.map(obj => obj.trim()).slice(0, 5);
    }
  }
  return [];
}

function extractSkills(content: string): string[] {
  const sections = content.split(/\*\*\d+\.\s*HABILIDADES/i);
  if (sections.length > 1) {
    const skillSection = sections[1].split('**')[0];
    const skills = skillSection.split(/[-•]\s*/).filter(skill => skill.trim().length > 10);
    if (skills.length > 0) {
      return skills.map(skill => skill.trim()).slice(0, 5);
    }
  }
  return [];
}

function extractDevelopmentSteps(content: string): any[] {
  const steps = [];
  const stepNames = ['INTRODUÇÃO', 'DESENVOLVIMENTO', 'PRÁTICA', 'FECHAMENTO'];
  
  for (const stepName of stepNames) {
    const regex = new RegExp(`\\*\\*${stepName}\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
    const match = content.match(regex);
    
    if (match) {
      const stepContent = match[1];
      const timeMatch = stepContent.match(/Tempo:\s*([^\n]+)/i);
      const activityMatch = stepContent.match(/Atividade:\s*([^\n]+)/i);
      const resourceMatch = stepContent.match(/Recursos:\s*([^\n]+)/i);
      
      steps.push({
        etapa: stepName.charAt(0) + stepName.slice(1).toLowerCase(),
        tempo: timeMatch ? timeMatch[1].trim() : '10 min',
        atividade: activityMatch ? activityMatch[1].trim() : `Atividade de ${stepName.toLowerCase()}`,
        recursos: resourceMatch ? resourceMatch[1].trim() : 'Material básico'
      });
    }
  }
  
  return steps.length > 0 ? steps : [];
}

function extractResources(content: string): string[] {
  const sections = content.split(/\*\*\d+\.\s*RECURSOS DIDÁTICOS/i);
  if (sections.length > 1) {
    const resourceSection = sections[1].split('**')[0];
    const resources = resourceSection.split(/[,\n]/).map(r => r.trim()).filter(r => r.length > 0);
    if (resources.length > 0) {
      return resources;
    }
  }
  return [];
}

function extractProgrammaticContent(content: string): string[] {
  const sections = content.split(/\*\*\d+\.\s*CONTEÚDOS PROGRAMÁTICOS/i);
  if (sections.length > 1) {
    const contentSection = sections[1].split('**')[0];
    const contents = contentSection.split(/[-•]\s*/).filter(c => c.trim().length > 5);
    if (contents.length > 0) {
      return contents.map(c => c.trim());
    }
  }
  return [];
}

function extractMethodology(content: string): string {
  const sections = content.split(/\*\*\d+\.\s*METODOLOGIA/i);
  if (sections.length > 1) {
    const methodSection = sections[1].split('**')[0].trim();
    if (methodSection.length > 10) {
      return methodSection;
    }
  }
  return '';
}

function extractEvaluation(content: string): string {
  const sections = content.split(/\*\*\d+\.\s*AVALIAÇÃO/i);
  if (sections.length > 1) {
    const evalSection = sections[1].split('**')[0].trim();
    if (evalSection.length > 10) {
      return evalSection;
    }
  }
  return '';
}

function extractReferences(content: string): string[] {
  const sections = content.split(/\*\*\d+\.\s*REFERÊNCIAS/i);
  if (sections.length > 1) {
    const refSection = sections[1].trim();
    const refs = refSection.split(/[-•]\s*/).filter(r => r.trim().length > 10);
    if (refs.length > 0) {
      return refs.map(r => r.trim());
    }
  }
  return [];
}

function extractSlides(content: string): any[] {
  const slides = [];
  const slideRegex = /\*\*SLIDE\s+(\d+):\s*([^\*]+)\*\*([^*]*?)(?=\*\*SLIDE|\*\*$|$)/gi;
  let match;
  
  while ((match = slideRegex.exec(content)) !== null) {
    slides.push({
      numero: parseInt(match[1]),
      titulo: match[2].trim(),
      conteudo: match[3].trim(),
      tipo: match[1] === '1' ? 'capa' : 'texto'
    });
  }
  
  return slides.length > 0 ? slides : [];
}

function extractQuestions(content: string, numQuestions: number): any[] {
  const questions = [];
  const questionRegex = /\*\*QUESTÃO\s+(\d+):\*\*([^*]*?)(?=\*\*QUESTÃO|\*\*$|$)/gi;
  let match;
  
  while ((match = questionRegex.exec(content)) !== null) {
    const questionText = match[2].trim();
    const hasAlternatives = questionText.includes('a)');
    
    const question: any = {
      numero: parseInt(match[1]),
      tipo: hasAlternatives ? 'multipla_escolha' : 'aberta',
      pergunta: questionText.split('\n')[0].trim()
    };
    
    if (hasAlternatives) {
      const alternatives = [];
      const altMatches = questionText.matchAll(/[a-d]\)\s*([^\n]+)/g);
      for (const altMatch of altMatches) {
        alternatives.push(altMatch[1].trim());
      }
      question.alternativas = alternatives;
      question.resposta_correta = 0;
    }
    
    questions.push(question);
  }
  
  return questions.length > 0 ? questions : [];
}

function generateDefaultQuestions(tema: string, count: number): any[] {
  const questions = [];
  for (let i = 1; i <= count; i++) {
    const isMultiple = i % 2 === 0;
    const question: any = {
      numero: i,
      tipo: isMultiple ? 'multipla_escolha' : 'aberta',
      pergunta: `Questão ${i} sobre ${tema}. ${isMultiple ? 'Assinale a alternativa correta:' : 'Desenvolva sua resposta:'}`
    };
    
    if (isMultiple) {
      question.alternativas = [
        'Primeira alternativa',
        'Segunda alternativa',
        'Terceira alternativa',
        'Quarta alternativa'
      ];
      question.resposta_correta = 0;
    }
    
    questions.push(question);
  }
  return questions;
}
