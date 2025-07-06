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
            content: 'Você é um assistente especializado em criar materiais educacionais seguindo a BNCC. Retorne sempre conteúdo estruturado e pedagógico com base nas diretrizes brasileiras de educação. Seja específico e detalhado em todas as seções, evitando campos vazios ou incompletos.'
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
<<<<<<< HEAD
Você é um professor especialista em planejamento pedagógico de acordo com a BNCC (Base Nacional Comum Curricular).  
Crie um plano de aula diário completo com base nas seguintes informações preenchidas no formulário de criação pelo usuário:

TEMA DA AULA: ${tema}  
DISCIPLINA: ${disciplina}  
TURMA: ${serie}

Com essas informações, desenvolva o plano de aula com os seguintes tópicos, preenchidos com clareza, objetividade e estrutura pedagógica:

1. **Duração da Aula**:  
   Informe quantas aulas de 50 minutos são necessárias para abordar o tema de forma completa.

2. **Códigos da BNCC**:  
   Liste os códigos da BNCC aplicáveis ao tema da aula, considerando a disciplina e a turma (ano escolar). Coloque o código e um breve resumo da habilidade descrita.

3. **Objetivos de Aprendizagem**:  
   Crie de 3 a 5 objetivos claros e alinhados à BNCC e ao tema da aula.

4. **Desenvolvimento Metodológico por Etapas da Aula**:
   Detalhe as etapas da aula com tempo estimado (em minutos), atividade a ser desenvolvida e os recursos a serem usados. Use o seguinte modelo:

   - **Introdução**  
     Tempo:  
     Atividade:  
     Recursos:

   - **Desenvolvimento**  
     Tempo:  
     Atividade:  
     Recursos:

   - **Prática**  
     Tempo:  
     Atividade:  
     Recursos:

   - **Fechamento**  
     Tempo:  
     Atividade:  
     Recursos:

5. **Recursos Didáticos**:  
   Liste todos os recursos usados em todas as etapas, separados por vírgula (ex: quadro branco, slides, folha de atividade, livro didático, projetor...).

6. **Avaliação**:  
   Elabore uma proposta de avaliação coerente com o tema da aula. Ela deve avaliar os objetivos propostos e pode incluir atividades práticas, participação, produção escrita, entre outras formas de avaliação diagnóstica, formativa ou somativa.
=======
Crie um plano de aula detalhado e completo seguindo EXATAMENTE esta estrutura:

INFORMAÇÕES BÁSICAS:
- Tema: ${tema}
- Disciplina: ${disciplina}
- Série: ${serie}  
- Professor: ${professor}
- Data: ${data}
- Duração: ${duracao}

ESTRUTURA OBRIGATÓRIA (preencha TODOS os campos com conteúdo específico):

**CABEÇALHO:**
Professor(a): ${professor}
Disciplina: ${disciplina}
Série/Ano: ${serie}  
Tema: ${tema}
Data: ${data}
Duração: ${duracao}
BNCC: [Liste 2-3 códigos específicos da BNCC para ${disciplina} série ${serie}]

**OBJETIVOS DE APRENDIZAGEM:**
[Liste 3-4 objetivos específicos iniciando com verbos de ação como: Identificar, Compreender, Aplicar, Analisar, etc.]

**DESENVOLVIMENTO METODOLÓGICO:**

**Introdução**
- Tempo: 10 minutos
- Atividade: [Descreva a atividade específica de introdução]
- Recursos: [Liste recursos específicos: quadro, slides, materiais concretos, etc.]

**Desenvolvimento** 
- Tempo: 25 minutos
- Atividade: [Descreva a atividade principal de desenvolvimento]
- Recursos: [Liste recursos específicos necessários]

**Prática**
- Tempo: 10 minutos  
- Atividade: [Descreva a atividade prática]
- Recursos: [Liste recursos específicos]

**Fechamento**
- Tempo: 5 minutos
- Atividade: [Descreva como será o fechamento]
- Recursos: [Liste recursos específicos]

**RECURSOS DIDÁTICOS:**
[Liste pelo menos 5 recursos específicos como: quadro branco, projetor, material impresso, livro didático, calculadora, etc.]

**AVALIAÇÃO:**
[Descreva detalhadamente como será feita a avaliação: formativa, somativa, critérios específicos, instrumentos, etc.]
>>>>>>> a6cfcdcf9a0430d2163b8268bc9a9ac1cadc278c

IMPORTANTE: 
- NÃO deixe nenhum campo vazio
- NÃO use variáveis como {{duracao}} ou {{codigo}}
- Seja específico e detalhado em cada seção
- Use informações reais e aplicáveis ao contexto
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
      const numQuestoesAval = formData.numeroQuestoes || formData.quantidadeQuestões || 5;
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
  const duracaoPadrao = '1 aula de 50 minutos';

  try {
    switch (materialType) {
<<<<<<< HEAD
      case 'plano-de-aula': {
        // Duração
        let duracao = extractDuration(content);
        if (!duracao || duracao.includes('{{')) duracao = duracaoPadrao;

        // BNCC: priorizar extração do código e resumo, senão gerar código realista
        let bncc = extractBNCCCodes(content);
        if (!bncc || bncc.includes('{{') || bncc.match(/^EF\d{2}MA0[12]$/)) {
          bncc = generateBNCCCodeByTema(tema, disciplina, serie);
        }

        // Objetivos: garantir array de 3 a 5 itens, cada um curto
        let objetivos = extractObjectives(content);
        if (!objetivos || !Array.isArray(objetivos) || objetivos.length === 0) {
          objetivos = generateDefaultObjectives(tema);
        }
        objetivos = objetivos.map(obj => obj.replace(/^[-•\d\.\s]+/, '').trim()).filter(Boolean).map(obj => obj.length > 120 ? obj.slice(0, 120) + '...' : obj).slice(0, 5);
        if (objetivos.length < 3) {
          objetivos = objetivos.concat(generateDefaultObjectives(tema).slice(0, 5 - objetivos.length));
        }
        // Sempre formatar como lista com marcador
        objetivos = objetivos.map(obj => obj.startsWith('•') ? obj : `• ${obj}`);

        // Desenvolvimento: garantir 4 etapas, cada uma com tempo, atividade e recursos
        let desenvolvimento = extractDevelopmentSteps(content);
        if (!desenvolvimento || !Array.isArray(desenvolvimento) || desenvolvimento.length < 4) {
          desenvolvimento = generateDefaultDevelopment(tema, duracao);
        }
        // Corrigir etapas faltantes
        const etapasPadrao = ['Introdução', 'Desenvolvimento', 'Prática', 'Fechamento'];
        desenvolvimento = etapasPadrao.map((etapa, idx) => {
          const encontrada = desenvolvimento.find(e => e.etapa.toLowerCase().includes(etapa.toLowerCase()));
          if (encontrada) {
            return {
              etapa,
              tempo: encontrada.tempo || '10 min',
              atividade: encontrada.atividade.length > 140 ? encontrada.atividade.slice(0, 140) + '...' : encontrada.atividade,
              recursos: encontrada.recursos || 'Quadro branco, livro didático'
            };
          } else {
            return generateDefaultDevelopment(tema, duracao)[idx];
          }
        });

        // Recursos: garantir lista de até 6 itens
        let recursos = extractResources(content);
        if (!recursos || !Array.isArray(recursos) || recursos.length === 0) {
          recursos = generateDefaultResources();
        }
        recursos = recursos.map(r => r.length > 80 ? r.slice(0, 80) + '...' : r).slice(0, 6);

        // Avaliação: garantir texto objetivo
        let avaliacao = extractEvaluation(content);
        if (!avaliacao || avaliacao.includes('{{') || avaliacao.length < 10) {
          avaliacao = 'Avaliação formativa e/ou somativa baseada na participação, atividades práticas e produção escrita, conforme os objetivos propostos.';
        } else if (avaliacao.length > 220) {
          avaliacao = avaliacao.slice(0, 220) + '...';
        }

=======
      case 'plano-de-aula':
>>>>>>> a6cfcdcf9a0430d2163b8268bc9a9ac1cadc278c
        return {
          titulo: `Plano de Aula - ${tema}`,
          professor,
          data,
          disciplina,
          serie,
          tema,
          duracao,
<<<<<<< HEAD
          bncc,
          objetivos: (objetivos || generateDefaultObjectives(tema)).map(obj => obj.trim()),
          habilidades: [],
          desenvolvimento,
          recursos,
          conteudosProgramaticos: [],
          metodologia: '',
          avaliacao,
          referencias: []
=======
          bncc: extractBNCCCodes(content) || generateBNCCCode(disciplina, serie),
          objetivos: extractObjectives(content) || generateDefaultObjectives(tema),
          habilidades: extractSkills(content) || generateDefaultSkills(tema),
          desenvolvimento: extractDevelopmentSteps(content) || generateDefaultDevelopment(tema, duracao),
          recursos: extractResources(content) || generateDefaultResources(),
          conteudosProgramaticos: extractProgrammaticContent(content) || generateDefaultContent(tema),
          metodologia: extractMethodology(content) || `Metodologia ativa com exposição dialogada e atividades práticas sobre ${tema}`,
          avaliacao: extractEvaluation(content) || `Avaliação formativa através da participação ativa dos alunos durante as atividades sobre ${tema}, observação do desempenho nas tarefas práticas e verificação da compreensão através de questionamentos diretos`,
          referencias: extractReferences(content) || [
            'Base Nacional Comum Curricular (BNCC). Ministério da Educação, 2018.',
            `Livro didático de ${disciplina} adotado pela escola.`,
            'Recursos digitais e materiais didáticos complementares.'
          ]
>>>>>>> a6cfcdcf9a0430d2163b8268bc9a9ac1cadc278c
        };
      }

      case 'slides':
        return {
          titulo: `Slides - ${tema}`,
          professor,
          data,
          disciplina,
          serie,
          tema,
          duracao,
<<<<<<< HEAD
          bncc: extractBNCCCodes(content) || generateBNCCCodeByTema(tema, disciplina, serie),
          ...slideContent
=======
          bncc: extractBNCCCodes(content) || generateBNCCCode(disciplina, serie),
          slides: extractSlides(content) || generateDefaultSlides(tema, professor, data)
>>>>>>> a6cfcdcf9a0430d2163b8268bc9a9ac1cadc278c
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
          bncc: extractBNCCCodes(content) || generateBNCCCodeByTema(tema, disciplina, serie),
          instrucoes: `Complete as questões abaixo sobre ${tema}. Leia atentamente cada enunciado antes de responder.`,
          questoes: extractQuestions(content, formData.numeroQuestoes || 5) || generateDefaultQuestions(tema, formData.numeroQuestoes || 5),
          criterios_avaliacao: [
            'Compreensão dos conceitos apresentados',
            'Clareza na expressão das ideias',
            'Aplicação correta do conhecimento adquirido'
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
          duracao,
          bncc: extractBNCCCodes(content) || generateBNCCCodeByTema(tema, disciplina, serie),
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
    return {
      titulo: `${materialType} - ${tema}`,
      professor,
      data,
      disciplina,
      serie,
      tema,
      duracao: duracaoPadrao,
      bncc: generateBNCCCodeByTema(tema, disciplina, serie),
      objetivos: generateDefaultObjectives(tema),
      habilidades: [],
      desenvolvimento: generateDefaultDevelopment(tema, duracaoPadrao),
      recursos: generateDefaultResources(),
      conteudosProgramaticos: [],
      metodologia: '',
      avaliacao: 'Avaliação formativa e/ou somativa baseada na participação, atividades práticas e produção escrita, conforme os objetivos propostos.',
      referencias: []
    };
  }
}

// Helper functions for content extraction and generation
function generateBNCCCode(disciplina: string, serie: string): string {
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
  
  const subjectCode = codes[disciplina?.toLowerCase()] || 'GE';
  const gradeNumber = serie?.match(/\d+/)?.[0] || '03';
  
  return `EF${gradeNumber.padStart(2, '0')}${subjectCode}01, EF${gradeNumber.padStart(2, '0')}${subjectCode}02`;
}

function generateBNCCCodeByTema(tema: string, disciplina: string, serie: string): string {
  // Lógica baseada em palavras-chave do tema para matemática
  const temaLower = (tema || '').toLowerCase();
  const gradeNumber = serie?.match(/\d+/)?.[0] || '03';
  if (disciplina?.toLowerCase().includes('matemática')) {
    if (temaLower.includes('geometria')) {
      return `EF${gradeNumber}MA06, EF${gradeNumber}MA07, EF${gradeNumber}MA08`;
    }
    if (temaLower.includes('números') || temaLower.includes('operações')) {
      return `EF${gradeNumber}MA01, EF${gradeNumber}MA02, EF${gradeNumber}MA03`;
    }
    if (temaLower.includes('grandezas') || temaLower.includes('medidas')) {
      return `EF${gradeNumber}MA04, EF${gradeNumber}MA05`;
    }
    // Outros temas podem ser adicionados aqui
    return `EF${gradeNumber}MA01, EF${gradeNumber}MA02`;
  }
  // Fallback para outras disciplinas
  return generateBNCCCode(disciplina, serie);
}

function generateDefaultObjectives(tema: string): string[] {
  return [
    `Identificar e compreender os conceitos fundamentais relacionados a ${tema}`,
    `Aplicar os conhecimentos sobre ${tema} em situações práticas do cotidiano`,
    `Desenvolver habilidades de análise e interpretação sobre ${tema}`,
    `Estabelecer relações entre ${tema} e outras áreas do conhecimento`
  ];
}

function generateDefaultSkills(tema: string): string[] {
  return [
    `Reconhecer elementos e características específicas de ${tema}`,
    `Analisar e interpretar informações relacionadas a ${tema}`,
    `Aplicar conceitos de ${tema} na resolução de problemas`,
    `Comunicar ideias e conclusões sobre ${tema} de forma clara`
  ];
}

function generateDefaultDevelopment(tema: string, duracao: string): any[] {
  const totalMinutes = parseInt(duracao.match(/\d+/)?.[0] || '50');
  const introTime = Math.floor(totalMinutes * 0.2);
  const devTime = Math.floor(totalMinutes * 0.5);
  const pracTime = Math.floor(totalMinutes * 0.2);
  const closeTime = totalMinutes - introTime - devTime - pracTime;

  return [
    {
      etapa: 'Introdução',
      tempo: `${introTime} min`,
      atividade: `Apresentação do tema ${tema} através de questionamentos sobre conhecimentos prévios dos alunos e contextualização do assunto`,
      recursos: 'Quadro branco, marcadores, slides introdutórios'
    },
    {
      etapa: 'Desenvolvimento',
      tempo: `${devTime} min`,
      atividade: `Exposição dialogada sobre ${tema} com apresentação de conceitos, exemplos práticos e interação constante com os alunos`,
      recursos: 'Projetor, slides, material impresso, exemplos visuais'
    },
    {
      etapa: 'Prática',
      tempo: `${pracTime} min`,
      atividade: `Atividade prática em grupos sobre ${tema} com aplicação dos conceitos apresentados`,
      recursos: 'Folhas de atividade, materiais manipuláveis, calculadora (se necessário)'
    },
    {
      etapa: 'Fechamento',
      tempo: `${closeTime} min`,
      atividade: `Síntese dos principais pontos abordados sobre ${tema} e esclarecimento de dúvidas`,
      recursos: 'Quadro branco, resumo dos conceitos principais'
    }
  ];
}

function generateDefaultResources(): string[] {
  return [
    'Quadro branco',
    'Marcadores coloridos',
    'Projetor multimídia',
    'Material impresso',
    'Livro didático',
    'Recursos audiovisuais',
    'Materiais manipuláveis'
  ];
}

function generateDefaultContent(tema: string): string[] {
  return [
    `Conceitos fundamentais de ${tema}`,
    `Características e propriedades de ${tema}`,
    `Aplicações práticas de ${tema}`,
    `Relações de ${tema} com o cotidiano`
  ];
}

function generateDefaultSlides(tema: string, professor: string, data: string): any[] {
  return [
    {
      numero: 1,
      titulo: tema,
      conteudo: `Apresentação sobre ${tema}\nProfessor: ${professor}\nData: ${data}`,
      tipo: 'capa'
    },
    {
      numero: 2,
      titulo: 'Objetivos',
      conteudo: [`Compreender ${tema}`, `Aplicar conceitos práticos`, `Desenvolver habilidades analíticas`],
      tipo: 'lista'
    },
    {
      numero: 3,
      titulo: 'Desenvolvimento',
      conteudo: `Principais aspectos e características de ${tema}`,
      tipo: 'texto'
    }
  ];
}

function generateDefaultQuestions(tema: string, count: number): any[] {
  const questions = [];
  for (let i = 1; i <= count; i++) {
    const isMultiple = i % 2 === 0;
    const question: any = {
      numero: i,
      tipo: isMultiple ? 'multipla_escolha' : 'aberta',
      pergunta: `Questão ${i} sobre ${tema}. ${isMultiple ? 'Assinale a alternativa correta:' : 'Desenvolva sua resposta de forma clara e objetiva:'}`
    };
    
    if (isMultiple) {
      question.alternativas = [
        `Primeira alternativa relacionada a ${tema}`,
        `Segunda alternativa sobre ${tema}`,
        `Terceira alternativa referente a ${tema}`,
        `Quarta alternativa acerca de ${tema}`
      ];
      question.resposta_correta = 0;
    }
    
    questions.push(question);
  }
  return questions;
}

<<<<<<< HEAD
function extractDuration(content: string): string {
  // Tenta extrair pelo padrão original
  const sections = content.split(/\*\*.*DURAÇÃO DA AULA.*\*\*/i);
  if (sections.length > 1) {
    const durationSection = sections[1].split('**')[0].trim();
    // Aceita "aula(s) de 50 minutos" ou apenas "minutos"
    const durationMatch = durationSection.match(/(\d+\s*aulas?\s*de\s*\d+\s*minutos?|\d+\s*minutos?)/i);
    if (durationMatch) {
      return durationMatch[0];
    }
    // Tenta pegar o primeiro número
    const numberMatch = durationSection.match(/\d+/);
    if (numberMatch) {
      return `${numberMatch[0]} minutos`;
    }
  }
  // Fallback padrão
  return '50 minutos';
}

function extractBNCCCodes(content: string): string {
  // Tenta extrair pelo padrão original
  const sections = content.split(/\*\*.*CÓDIGOS DA BNCC.*\*\*/i);
  if (sections.length > 1) {
    const bnccSection = sections[1].split('**')[0];
    // Aceita códigos e descrições
    const bnccRegex = /(EF\d{2}[A-Z]{2}\d{2})([^\n]*)/g;
    let match;
    let results = [];
    while ((match = bnccRegex.exec(bnccSection)) !== null) {
      results.push(`${match[1]}${match[2] ? ' -' + match[2].trim() : ''}`);
    }
    if (results.length > 0) {
      return results.join('; ');
    }
    // Se não encontrar, tenta só os códigos
    const onlyCodes = bnccSection.match(/EF\d{2}[A-Z]{2}\d{2}/g);
    if (onlyCodes) {
      return onlyCodes.join(', ');
    }
  }
  // Fallback padrão
  return 'EF03MA01, EF03MA02';
=======
function extractBNCCCodes(content: string): string {
  const bnccRegex = /EF\d{2}[A-Z]{2}\d{2}/g;
  const matches = content.match(bnccRegex);
  return matches ? matches.join(', ') : '';
>>>>>>> a6cfcdcf9a0430d2163b8268bc9a9ac1cadc278c
}

function extractObjectives(content: string): string[] {
  // Tenta extrair pelo padrão original
  const sections = content.split(/\*\*.*OBJETIVOS.*DE.*APRENDIZAGEM.*\*\*/i);
  if (sections.length > 1) {
    const objectiveSection = sections[1].split('**')[0];
    // Primeiro tenta marcadores
    let objectives = objectiveSection.split(/[-•]\s*/).map(obj => obj.trim()).filter(obj => obj.length > 10);
    if (objectives.length > 0) {
      return objectives.slice(0, 5);
    }
    // Se não encontrar marcadores, tenta separar por número
    objectives = objectiveSection.split(/\d+\.\s*/).map(obj => obj.trim()).filter(obj => obj.length > 10);
    if (objectives.length > 0) {
      return objectives.slice(0, 5);
    }
    // Se não encontrar, tenta ponto e vírgula
    objectives = objectiveSection.split(/;|\./).map(obj => obj.trim()).filter(obj => obj.length > 10);
    if (objectives.length > 0) {
      return objectives.slice(0, 5);
    }
  }
  // Fallback padrão
  return [
    'Identificar e compreender os conceitos fundamentais do tema.',
    'Aplicar os conhecimentos em situações práticas.',
    'Desenvolver habilidades de análise e interpretação.',
    'Estabelecer relações entre o tema e outras áreas do conhecimento.'
  ];
}

function extractSkills(content: string): string[] {
  const sections = content.split(/\*\*.*HABILIDADES.*\*\*/i);
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
  const stepNames = ['Introdução', 'Desenvolvimento', 'Prática', 'Fechamento'];
  
  for (const stepName of stepNames) {
    const regex = new RegExp(`\\*\\*${stepName}\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
    const match = content.match(regex);
    
    if (match) {
      const stepContent = match[1];
      const timeMatch = stepContent.match(/Tempo:\s*([^\n]+)/i);
      const activityMatch = stepContent.match(/Atividade:\s*([^\n]+)/i);
      const resourceMatch = stepContent.match(/Recursos:\s*([^\n]+)/i);
      
      steps.push({
        etapa: stepName,
        tempo: timeMatch ? timeMatch[1].trim() : '10 min',
        atividade: activityMatch ? activityMatch[1].trim() : `Atividade de ${stepName.toLowerCase()}`,
        recursos: resourceMatch ? resourceMatch[1].trim() : 'Material básico'
      });
    }
  }
  
  return steps.length > 0 ? steps : [];
}

function extractResources(content: string): string[] {
  const sections = content.split(/\*\*.*RECURSOS DIDÁTICOS.*\*\*/i);
  if (sections.length > 1) {
    const resourceSection = sections[1].split('**')[0];
    const resources = resourceSection.split(/[,\n]/).map(r => r.trim()).filter(r => r.length > 0 && r !== ':');
    if (resources.length > 0) {
      return resources;
    }
  }
  return [];
}

function extractProgrammaticContent(content: string): string[] {
  const sections = content.split(/\*\*.*CONTEÚDOS PROGRAMÁTICOS.*\*\*/i);
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
  const sections = content.split(/\*\*.*METODOLOGIA.*\*\*/i);
  if (sections.length > 1) {
    const methodSection = sections[1].split('**')[0].trim();
    if (methodSection.length > 10) {
      return methodSection;
    }
  }
  return '';
}

function extractEvaluation(content: string): string {
  const sections = content.split(/\*\*.*AVALIAÇÃO.*\*\*/i);
  if (sections.length > 1) {
    const evalSection = sections[1].split('**')[0].trim();
    if (evalSection.length > 10) {
      return evalSection;
    }
  }
  return '';
}

function extractReferences(content: string): string[] {
  const sections = content.split(/\*\*.*REFERÊNCIAS.*\*\*/i);
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
