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
      // Gera código BNCC específico baseado na disciplina e série
      const bnccCode = generateBNCCCodeForSubject(disciplina, serie, tema);
      
      return `
Você é um professor especialista em planejamento pedagógico de acordo com a BNCC (Base Nacional Comum Curricular).

Crie um plano de aula completo com base nas seguintes informações:
- TEMA DA AULA: ${tema}
- DISCIPLINA: ${disciplina}
- SÉRIE/ANO: ${serie}
- PROFESSOR: ${professor}
- DATA: ${data}
- DURAÇÃO: ${duracao}
- CÓDIGOS BNCC: ${bnccCode}

IMPORTANTE: Use EXATAMENTE estes valores no cabeçalho:
- Professor: ${professor}
- Data: ${data}
- Disciplina: ${disciplina}
- Série: ${serie}
- Tema: ${tema}
- Duração: ${duracao}
- BNCC: ${bnccCode}

Desenvolva o plano de aula seguindo EXATAMENTE esta estrutura:

**PLANO DE AULA - ${tema}**

**INFORMAÇÕES GERAIS:**
- Professor: ${professor}
- Data: ${data}
- Disciplina: ${disciplina}
- Série/Ano: ${serie}
- Tema: ${tema}
- Duração: ${duracao}
- BNCC: ${bnccCode}

**OBJETIVOS DE APRENDIZAGEM:**
• Identificar e compreender os conceitos fundamentais relacionados a ${tema}
• Aplicar os conhecimentos sobre ${tema} em situações práticas do cotidiano
• Desenvolver habilidades de análise e interpretação sobre ${tema}
• Estabelecer relações entre ${tema} e outras áreas do conhecimento

**HABILIDADES BNCC:**
• Reconhecer elementos e características específicas de ${tema}
• Analisar e interpretar informações relacionadas a ${tema}
• Aplicar conceitos de ${tema} na resolução de problemas

**DESENVOLVIMENTO DA AULA:**

**1. INTRODUÇÃO (15 minutos)**
- Atividade: Apresentação do tema ${tema} através de questionamentos sobre conhecimentos prévios dos alunos e contextualização do assunto
- Recursos: Quadro branco, marcadores, slides introdutórios

**2. DESENVOLVIMENTO (20 minutos)**
- Atividade: Exposição dialogada sobre ${tema} com apresentação de conceitos, exemplos práticos e interação constante com os alunos
- Recursos: Projetor, slides, material impresso, exemplos visuais

**3. PRÁTICA (10 minutos)**
- Atividade: Atividade prática em grupos sobre ${tema} com aplicação dos conceitos apresentados
- Recursos: Folhas de atividade, materiais manipuláveis, calculadora (se necessário)

**4. FECHAMENTO (5 minutos)**
- Atividade: Síntese dos principais pontos abordados sobre ${tema} e esclarecimento de dúvidas
- Recursos: Quadro branco, resumo dos conceitos principais

**RECURSOS DIDÁTICOS:**
• Quadro branco
• Marcadores coloridos
• Projetor multimídia
• Material impresso
• Livro didático

**CONTEÚDOS PROGRAMÁTICOS:**
• Conceitos fundamentais de ${tema}
• Características e propriedades de ${tema}
• Aplicações práticas de ${tema}
• Relações de ${tema} com o cotidiano

**METODOLOGIA:**
Metodologia ativa com exposição dialogada e atividades práticas sobre ${tema}

**AVALIAÇÃO:**
Avaliação formativa através da participação ativa dos alunos durante as atividades sobre ${tema}

**REFERÊNCIAS:**
• Base Nacional Comum Curricular (BNCC). Ministério da Educação, 2018.
• Livro didático de ${disciplina} adotado pela escola.
• Recursos digitais e materiais didáticos complementares.

IMPORTANTE: NÃO use placeholders como {{duracao.aula}} ou {{codigo.da.bncc}}. Use os valores reais fornecidos acima.
`;

    case 'slides':
      return `
Você é um professor especialista em criação de slides educativos seguindo a BNCC.

Crie slides educativos com base nas seguintes informações:

TEMA DA AULA: ${tema}
DISCIPLINA: ${disciplina}
SÉRIE: ${serie}
PROFESSOR: ${professor}
DATA: ${data}
DURAÇÃO: ${duracao}

Desenvolva um conjunto completo de slides com 12 páginas seguindo exatamente esta estrutura:

**SLIDE 1 - CAPA:**
- Título principal: ${tema}
- Informações básicas já definidas

**SLIDE 2 - OBJETIVOS:**
Crie 4 objetivos específicos para a aula:
- objetivo_1: [objetivo claro e específico]
- objetivo_2: [objetivo claro e específico]
- objetivo_3: [objetivo claro e específico]  
- objetivo_4: [objetivo claro e específico]

**SLIDE 3 - INTRODUÇÃO:**
- introducao_texto: [texto introdutório sobre o tema em 2-3 linhas]
- introducao_imagem: [descrição da imagem que ilustra a introdução]

**SLIDE 4 - CONCEITOS FUNDAMENTAIS:**
- conceitos_texto: [explicação dos conceitos principais em 2-3 linhas]
- conceito_principal: [conceito central do tema]
- conceitos_imagem: [descrição da imagem que ilustra os conceitos]

**SLIDE 5 - EXEMPLO PRÁTICO:**
- exemplo_titulo: [título do exemplo]
- exemplo_conteudo: [exemplo prático relacionado ao tema]
- exemplo_imagem: [descrição da imagem do exemplo]

**SLIDE 6 - DESENVOLVIMENTO:**
- desenvolvimento_texto: [texto de desenvolvimento em 2-3 linhas]
- ponto_1: [primeiro ponto importante]
- ponto_2: [segundo ponto importante]
- desenvolvimento_imagem: [descrição da imagem de apoio]

**SLIDE 7 - FÓRMULAS/REGRAS:**
- formula_titulo: [título da fórmula ou regra principal]
- formula_principal: [fórmula, regra ou conceito matemático/científico]
- formula_explicacao: [explicação da fórmula em 1-2 linhas]

**SLIDE 8 - TABELA/COMPARAÇÃO:**
- tabela_titulo: [título da tabela]
- coluna_1: [cabeçalho coluna 1]
- coluna_2: [cabeçalho coluna 2] 
- coluna_3: [cabeçalho coluna 3]
- linha_1_col_1, linha_1_col_2, linha_1_col_3: [dados linha 1]
- linha_2_col_1, linha_2_col_2, linha_2_col_3: [dados linha 2]
- linha_3_col_1, linha_3_col_2, linha_3_col_3: [dados linha 3]

**SLIDE 9 - IMAGEM CENTRAL:**
- imagem_titulo: [título descritivo]
- imagem_descricao: [descrição do que a imagem mostra]
- imagem_principal: [descrição detalhada da imagem principal]

**SLIDE 10 - ATIVIDADE INTERATIVA:**
- atividade_pergunta: [pergunta relacionada ao tema]
- opcao_a: [primeira alternativa]
- opcao_b: [segunda alternativa]
- opcao_c: [terceira alternativa]
- opcao_d: [quarta alternativa]

**SLIDE 11 - CONCLUSÃO:**
- conclusao_texto: [síntese dos principais pontos da aula]
- ponto_chave_1: [primeiro ponto-chave para memorizar]
- ponto_chave_2: [segundo ponto-chave para memorizar]

**SLIDE 12 - PRÓXIMOS PASSOS:**
- proximo_passo_1: [primeiro passo para continuar estudando]
- proximo_passo_2: [segundo passo para continuar estudando]
- proximo_passo_3: [terceiro passo para continuar estudando]

IMPORTANTE:
- Adapte todo o conteúdo à faixa etária da ${serie}
- Use linguagem adequada para ${disciplina}
- Seja específico e didático
- As descrições de imagens devem ser detalhadas e contextual ao tema
- Crie conteúdo original e educativo
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
  const duracao = formData.duracao || '50 minutos';

  try {
    switch (materialType) {
      case 'plano-de-aula':
        // Generate BNCC codes based on form data
        const bnccCodes = generateBNCCCodeForSubject(disciplina, serie, tema);
        
        return {
          titulo: `Plano de Aula - ${tema}`,
          professor: professor,
          data: data,
          disciplina: disciplina,
          serie: serie,
          tema: tema,
          duracao: duracao,
          bncc: bnccCodes,
          objetivos: extractObjectivesFromContent(content) || generateDefaultObjectives(tema),
          habilidades: extractSkills(content) || generateDefaultSkills(tema),
          desenvolvimento: extractDevelopmentStepsFromContent(content, duracao) || generateDefaultDevelopment(tema, duracao),
          recursos: extractResourcesFromContent(content) || generateDefaultResources(),
          conteudosProgramaticos: extractProgrammaticContent(content) || generateDefaultContent(tema),
          metodologia: extractMethodology(content) || `Metodologia ativa com exposição dialogada e atividades práticas sobre ${tema}`,
          avaliacao: extractEvaluation(content) || `Avaliação formativa através da participação ativa dos alunos durante as atividades sobre ${tema}`,
          referencias: extractReferences(content) || [
            'Base Nacional Comum Curricular (BNCC). Ministério da Educação, 2018.',
            `Livro didático de ${disciplina} adotado pela escola.`,
            'Recursos digitais e materiais didáticos complementares.'
          ]
        };

      case 'slides':
        const slideContent = extractSlidesContent(content, tema, professor, data, disciplina, serie);
        return {
          titulo: `Slides - ${tema}`,
          professor: professor,
          data: data,
          disciplina: disciplina,
          serie: serie,
          tema: tema,
          duracao: duracao,
          bncc: generateBNCCCodeForSubject(disciplina, serie, tema),
          ...slideContent
        };

      case 'atividade':
        return {
          titulo: `Atividade - ${tema}`,
          professor: professor,
          data: data,
          disciplina: disciplina,
          serie: serie,
          tema: tema,
          duracao: duracao,
          bncc: generateBNCCCodeForSubject(disciplina, serie, tema),
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
          professor: professor,
          data: data,
          disciplina: disciplina,
          serie: serie,
          tema: assuntos.join(', '),
          duracao: duracao,
          bncc: generateBNCCCodeForSubject(disciplina, serie, tema),
          instrucoes: `Responda às questões abaixo sobre ${assuntos.join(', ')}.`,
          questoes: extractQuestions(content, formData.numeroQuestoes || 5) || generateDefaultQuestions(assuntos.join(', '), formData.numeroQuestoes || 5),
          criterios_avaliacao: [
            'Compreensão dos conceitos (25%)',
            'Clareza na expressão das ideias (25%)',
            'Aplicação correta do conhecimento (50%)'
          ]
        };

      default:
        return { 
          titulo: `${materialType} - ${tema}`,
          professor: professor,
          data: data,
          disciplina: disciplina,
          serie: serie,
          tema: tema,
          duracao: duracao,
          content: content 
        };
    }
  } catch (error) {
    console.error('Error parsing content:', error);
    return {
      titulo: `${materialType} - ${tema}`,
      professor: professor,
      data: data,
      disciplina: disciplina,
      serie: serie,
      tema: tema,
      duracao: duracao,
      content: content
    };
  }
}

function generateBNCCCodeForSubject(disciplina: string, serie: string, tema: string): string {
  const disciplinaLower = disciplina?.toLowerCase() || '';
  const serieLower = serie?.toLowerCase() || '';
  
  // Mapear códigos BNCC por disciplina e faixa etária
  const codes: { [key: string]: { [key: string]: string[] } } = {
    'matemática': {
      'ensino fundamental i': ['EF01MA01', 'EF02MA01', 'EF03MA01'],
      '1º ano': ['EF01MA01', 'EF01MA06', 'EF01MA08'],
      '2º ano': ['EF02MA01', 'EF02MA06', 'EF02MA08'],
      '3º ano': ['EF03MA01', 'EF03MA06', 'EF03MA08'],
      '4º ano': ['EF04MA01', 'EF04MA06', 'EF04MA08'],
      '5º ano': ['EF05MA01', 'EF05MA06', 'EF05MA08'],
      'default': ['EF03MA01', 'EF03MA15', 'EF04MA01']
    },
    'português': {
      'ensino fundamental i': ['EF01LP01', 'EF02LP01', 'EF03LP01'],
      '1º ano': ['EF01LP01', 'EF01LP15', 'EF01LP20'],
      '2º ano': ['EF02LP01', 'EF02LP15', 'EF02LP20'],
      '3º ano': ['EF03LP01', 'EF03LP15', 'EF03LP20'],
      '4º ano': ['EF04LP01', 'EF04LP15', 'EF04LP20'],
      '5º ano': ['EF05LP01', 'EF05LP15', 'EF05LP20'],
      'default': ['EF03LP01', 'EF03LP15', 'EF04LP01']
    },
    'língua portuguesa': {
      'ensino fundamental i': ['EF01LP01', 'EF02LP01', 'EF03LP01'],
      '1º ano': ['EF01LP01', 'EF01LP15', 'EF01LP20'],
      '2º ano': ['EF02LP01', 'EF02LP15', 'EF02LP20'],
      '3º ano': ['EF03LP01', 'EF03LP15', 'EF03LP20'],
      '4º ano': ['EF04LP01', 'EF04LP15', 'EF04LP20'],
      '5º ano': ['EF05LP01', 'EF05LP15', 'EF05LP20'],
      'default': ['EF03LP01', 'EF03LP15', 'EF04LP01']
    },
    'história': {
      'ensino fundamental i': ['EF01HI01', 'EF02HI01', 'EF03HI01'],
      '1º ano': ['EF01HI01', 'EF01HI05', 'EF01HI08'],
      '2º ano': ['EF02HI01', 'EF02HI05', 'EF02HI08'],
      '3º ano': ['EF03HI01', 'EF03HI05', 'EF03HI08'],
      '4º ano': ['EF04HI01', 'EF04HI05', 'EF04HI08'],
      '5º ano': ['EF05HI01', 'EF05HI05', 'EF05HI08'],
      'default': ['EF03HI01', 'EF03HI05', 'EF04HI01']
    },
    'geografia': {
      'ensino fundamental i': ['EF01GE01', 'EF02GE01', 'EF03GE01'],
      '1º ano': ['EF01GE01', 'EF01GE02', 'EF01GE05'],
      '2º ano': ['EF02GE01', 'EF02GE02', 'EF02GE05'],
      '3º ano': ['EF03GE01', 'EF03GE02', 'EF03GE05'],
      '4º ano': ['EF04GE01', 'EF04GE02', 'EF04GE05'],
      '5º ano': ['EF05GE01', 'EF05GE02', 'EF05GE05'],
      'default': ['EF03GE01', 'EF03GE02', 'EF04GE01']
    },
    'ciências': {
      'ensino fundamental i': ['EF01CI01', 'EF02CI01', 'EF03CI01'],
      '1º ano': ['EF01CI01', 'EF01CI02', 'EF01CI05'],
      '2º ano': ['EF02CI01', 'EF02CI02', 'EF02CI05'],
      '3º ano': ['EF03CI01', 'EF03CI02', 'EF03CI05'],
      '4º ano': ['EF04CI01', 'EF04CI02', 'EF04CI05'],
      '5º ano': ['EF05CI01', 'EF05CI02', 'EF05CI05'],
      'default': ['EF03CI01', 'EF03CI02', 'EF04CI01']
    },
    'arte': {
      'default': ['EF15AR01', 'EF15AR02', 'EF15AR03']
    },
    'educação física': {
      'default': ['EF12EF01', 'EF35EF01', 'EF35EF03']
    }
  };
  
  const subjectCodes = codes[disciplinaLower] || codes['matemática'];
  let selectedCodes: string[];
  
  if (subjectCodes[serieLower]) {
    selectedCodes = subjectCodes[serieLower];
  } else if (subjectCodes['default']) {
    selectedCodes = subjectCodes['default'];
  } else {
    selectedCodes = codes['matemática']['default'];
  }
  
  // Retorna os primeiros 2-3 códigos
  return selectedCodes.slice(0, 2).join(', ');
}

function extractBNCCCodesFromContent(content: string): string {
  const bnccPattern = /\*\*CÓDIGOS DA BNCC:\*\*([\s\S]*?)(?=\*\*|$)/i;
  const match = content.match(bnccPattern);
  
  if (match) {
    const bnccSection = match[1];
    const codeRegex = /EF\d{2}[A-Z]{2}\d{2}/g;
    const codes = bnccSection.match(codeRegex);
    if (codes) {
      return codes.slice(0, 3).join(', ');
    }
  }
  
  return '';
}

function extractObjectivesFromContent(content: string): string[] {
  const objectivesPattern = /\*\*OBJETIVOS DE APRENDIZAGEM:\*\*([\s\S]*?)(?=\*\*|$)/i;
  const match = content.match(objectivesPattern);
  
  if (match) {
    const objectivesSection = match[1];
    const objectives = objectivesSection
      .split(/[•\-\n]/)
      .map(obj => obj.trim())
      .filter(obj => obj.length > 10 && !obj.includes('Objetivo'))
      .slice(0, 5);
    
    if (objectives.length > 0) {
      return objectives;
    }
  }
  
  return [];
}

function extractDevelopmentStepsFromContent(content: string, duration: string): any[] {
  const steps = [];
  const stepNames = ['Introdução', 'Desenvolvimento', 'Prática', 'Fechamento'];
  
  for (const stepName of stepNames) {
    const regex = new RegExp(`\\*\\*${stepName}[^\\*]*\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
    const match = content.match(regex);
    
    if (match) {
      const stepContent = match[1];
      const timeMatch = stepContent.match(/\(([^)]+)\)/);
      const activityMatch = stepContent.match(/Atividade:\s*([^\n]+)/i);
      const resourceMatch = stepContent.match(/Recursos:\s*([^\n]+)/i);
      
      steps.push({
        etapa: stepName,
        tempo: timeMatch ? timeMatch[1] : '10-15 min',
        atividade: activityMatch ? activityMatch[1].trim() : `Atividade de ${stepName.toLowerCase()}`,
        recursos: resourceMatch ? resourceMatch[1].trim() : 'Material básico'
      });
    }
  }
  
  return steps.length > 0 ? steps : [];
}

function extractResourcesFromContent(content: string): string[] {
  const resourcesPattern = /\*\*RECURSOS DIDÁTICOS:\*\*([\s\S]*?)(?=\*\*|$)/i;
  const match = content.match(resourcesPattern);
  
  if (match) {
    const resourceSection = match[1];
    const resources = resourceSection
      .split(/[,\n•]/)
      .map(r => r.trim())
      .filter(r => r.length > 0 && r !== ':');
    
    if (resources.length > 0) {
      return resources;
    }
  }
  
  return [];
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

function extractSlidesContent(content: string, tema: string, professor: string, data: string, disciplina: string, serie: string): any {
  const extractVariable = (varName: string) => {
    const regex = new RegExp(`${varName}:\\s*\\[([^\\]]+)\\]`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : `Conteúdo sobre ${tema}`;
  };

  return {
    objetivo_1: extractVariable('objetivo_1'),
    objetivo_2: extractVariable('objetivo_2'),
    objetivo_3: extractVariable('objetivo_3'),
    objetivo_4: extractVariable('objetivo_4'),
    introducao_texto: extractVariable('introducao_texto'),
    introducao_imagem: extractVariable('introducao_imagem'),
    conceitos_texto: extractVariable('conceitos_texto'),
    conceito_principal: extractVariable('conceito_principal'),
    conceitos_imagem: extractVariable('conceitos_imagem'),
    exemplo_titulo: extractVariable('exemplo_titulo'),
    exemplo_conteudo: extractVariable('exemplo_conteudo'),
    exemplo_imagem: extractVariable('exemplo_imagem'),
    desenvolvimento_texto: extractVariable('desenvolvimento_texto'),
    ponto_1: extractVariable('ponto_1'),
    ponto_2: extractVariable('ponto_2'),
    desenvolvimento_imagem: extractVariable('desenvolvimento_imagem'),
    formula_titulo: extractVariable('formula_titulo'),
    formula_principal: extractVariable('formula_principal'),
    formula_explicacao: extractVariable('formula_explicacao'),
    tabela_titulo: extractVariable('tabela_titulo'),
    coluna_1: extractVariable('coluna_1'),
    coluna_2: extractVariable('coluna_2'),
    coluna_3: extractVariable('coluna_3'),
    linha_1_col_1: extractVariable('linha_1_col_1'),
    linha_1_col_2: extractVariable('linha_1_col_2'),
    linha_1_col_3: extractVariable('linha_1_col_3'),
    linha_2_col_1: extractVariable('linha_2_col_1'),
    linha_2_col_2: extractVariable('linha_2_col_2'),
    linha_2_col_3: extractVariable('linha_2_col_3'),
    linha_3_col_1: extractVariable('linha_3_col_1'),
    linha_3_col_2: extractVariable('linha_3_col_2'),
    linha_3_col_3: extractVariable('linha_3_col_3'),
    imagem_titulo: extractVariable('imagem_titulo'),
    imagem_descricao: extractVariable('imagem_descricao'),
    imagem_principal: extractVariable('imagem_principal'),
    atividade_pergunta: extractVariable('atividade_pergunta'),
    opcao_a: extractVariable('opcao_a'),
    opcao_b: extractVariable('opcao_b'),
    opcao_c: extractVariable('opcao_c'),
    opcao_d: extractVariable('opcao_d'),
    conclusao_texto: extractVariable('conclusao_texto'),
    ponto_chave_1: extractVariable('ponto_chave_1'),
    ponto_chave_2: extractVariable('ponto_chave_2'),
    proximo_passo_1: extractVariable('proximo_passo_1'),
    proximo_passo_2: extractVariable('proximo_passo_2'),
    proximo_passo_3: extractVariable('proximo_passo_3')
  };
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
