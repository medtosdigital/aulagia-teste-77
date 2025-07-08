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
  const tema = formData.tema || formData.topic || '';
  const disciplina = formData.disciplina || formData.subject || '';
  const serie = formData.serie || formData.grade || '';
  const professor = formData.professor || '';
  const data = formData.data || '';
  const duracao = formData.duracao || '';
  
  // Generate BNCC code for the prompt
  const bnccCode = generateBNCCCodeForSubject(disciplina, serie, tema);

  switch (materialType) {
    case 'plano-de-aula':
      return `
Você é um professor especialista em planejamento pedagógico de acordo com a BNCC (Base Nacional Comum Curricular).

Crie um plano de aula completo com base nas seguintes informações:
- TEMA DA AULA: ${tema}
- DISCIPLINA: ${disciplina}
- SÉRIE/ANO: ${serie}

**Desenvolvimento Metodológico por Etapas da Aula**:
Detalhe as etapas da aula com tempo estimado (em minutos), atividade a ser desenvolvida e os recursos a serem usados. Use o seguinte modelo:

- Introdução
  Tempo: ...
  Atividade: ...
  Recursos: ...
- Desenvolvimento
  Tempo: ...
  Atividade: ...
  Recursos: ...
- Prática
  Tempo: ...
  Atividade: ...
  Recursos: ...
- Fechamento
  Tempo: ...
  Atividade: ...
  Recursos: ...

IMPORTANTE:
- NÃO repita os mesmos recursos em todas as etapas, a não ser que seja realmente necessário. Cada etapa deve ter recursos específicos e diferentes, adequados à atividade daquela etapa.
- Considere que cada aula tem 50 minutos. Se o tema exigir mais de uma aula, escreva: "2 aulas de 50 minutos", "3 aulas de 50 minutos", etc.
- **BUSQUE e RETORNE apenas códigos BNCC reais e relevantes para o TEMA (principal), DISCIPLINA e SÉRIE informados. NÃO invente códigos. Se não encontrar, deixe o campo BNCC vazio.**
- Exemplo: Introdução pode usar slides e quadro branco; Desenvolvimento pode usar projetor e material impresso; Prática pode usar materiais manipuláveis; Fechamento pode usar apenas quadro e resumo.

Depois, retorne o plano de aula completo no seguinte JSON estruturado:

{
  "titulo": "Plano de Aula - ${tema}",
  "professor": "(preenchido pelo sistema)",
  "data": "(preenchido pelo sistema)",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "duracao": "...",
  "bncc": "...",
  "objetivos": [ ... ],
  "habilidades": [ ... ],
  "desenvolvimento": [
    { "etapa": "Introdução", "tempo": "...", "atividade": "...", "recursos": "..." },
    { "etapa": "Desenvolvimento", "tempo": "...", "atividade": "...", "recursos": "..." },
    { "etapa": "Prática", "tempo": "...", "atividade": "...", "recursos": "..." },
    { "etapa": "Fechamento", "tempo": "...", "atividade": "...", "recursos": "..." }
  ],
  "recursos": [ ... ],
  "conteudosProgramaticos": [ ... ],
  "metodologia": "...",
  "avaliacao": "...",
  "referencias": [ ... ]
}

Retorne primeiro o bloco textual das etapas, depois o JSON estruturado. Não adicione explicações extras.
`;

    case 'slides':
      return `
Você é um professor especialista em criação de slides educativos seguindo a BNCC.

Crie slides educativos com base nas seguintes informações:
TEMA DA AULA: ${tema}
DISCIPLINA: ${disciplina}
SÉRIE: ${serie}

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
  const tema = formData.tema || formData.topic || '';
  const disciplina = formData.disciplina || formData.subject || '';
  const serie = formData.serie || formData.grade || '';
  const professor = formData.professor || '';
  const data = formData.data || '';
  const duracao = formData.duracao || '';

  try {
    switch (materialType) {
      case 'plano-de-aula':
        // Try to parse JSON first
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedJson = JSON.parse(jsonMatch[0]);
            // União de todos os recursos das etapas, sem repetições
            let recursosEtapas = [];
            if (Array.isArray(parsedJson.desenvolvimento)) {
              recursosEtapas = parsedJson.desenvolvimento
                .map(etapa => (typeof etapa.recursos === 'string' ? etapa.recursos.split(/,| e /).map(r => r.trim()) : (Array.isArray(etapa.recursos) ? etapa.recursos : [])))
                .flat();
            }
            let recursosGerais = Array.isArray(parsedJson.recursos) ? parsedJson.recursos : (typeof parsedJson.recursos === 'string' ? parsedJson.recursos.split(/,| e /).map(r => r.trim()) : []);
            const recursosUnicos = Array.from(new Set([...recursosEtapas, ...recursosGerais])).filter(Boolean);
            return {
              ...parsedJson,
              professor: professor,
              data: data,
              disciplina: disciplina,
              serie: serie,
              tema: tema,
              duracao: parsedJson.duracao || '',
              bncc: parsedJson.bncc || '',
              objetivos: parsedJson.objetivos || [],
              habilidades: parsedJson.habilidades || [],
              desenvolvimento: parsedJson.desenvolvimento || [],
              recursos: recursosUnicos,
              conteudosProgramaticos: parsedJson.conteudosProgramaticos || [],
              metodologia: parsedJson.metodologia || '',
              avaliacao: parsedJson.avaliacao || '',
              referencias: parsedJson.referencias || []
            };
          }
        } catch (error) {
          // Se não conseguir parsear JSON, retorna tudo vazio
          return {
            titulo: '',
            professor,
            data,
            disciplina,
            serie,
            tema,
            duracao: '',
            bncc: '',
            objetivos: [],
            habilidades: [],
            desenvolvimento: [],
            recursos: [],
            conteudosProgramaticos: [],
            metodologia: '',
            avaliacao: '',
            referencias: []
          };
        }

        // Fallback: parse bloco textual das etapas
        const etapas = ['Introdução', 'Desenvolvimento', 'Prática', 'Fechamento'];
        const desenvolvimento = [];
        for (const etapa of etapas) {
          const regex = new RegExp(`-?\s*\*?\*?${etapa}\*?\*?\s*[\r\n]+\s*Tempo:\s*([^\r\n]+)[\r\n]+\s*Atividade:\s*([^\r\n]+)[\r\n]+\s*Recursos:\s*([^\r\n]+)`, 'i');
          const match = content.match(regex);
          if (match) {
            desenvolvimento.push({
              etapa,
              tempo: match[1].trim(),
              atividade: match[2].trim(),
              recursos: match[3].trim()
            });
          }
        }
        // União de todos os recursos das etapas, sem repetições
        const recursosUnicos = Array.from(new Set(desenvolvimento.map(e => e.recursos).join(',').split(/,| e /).map(r => r.trim()).filter(Boolean)));
        return {
          titulo: `Plano de Aula - ${tema}`,
          professor,
          data,
          disciplina,
          serie,
          tema,
          duracao: extractFieldFromContent(content, 'Tempo') || '',
          bncc: extractBNCCCodesFromContent(content) || '',
          objetivos: extractObjectivesFromContent(content) || [],
          habilidades: extractSkills(content) || [],
          desenvolvimento,
          recursos: recursosUnicos,
          conteudosProgramaticos: extractProgrammaticContent(content) || [],
          metodologia: extractMethodology(content) || '',
          avaliacao: extractEvaluation(content) || '',
          referencias: extractReferences(content) || []
        };

      case 'slides':
        const slideContent = extractSlidesContent(content);
        return {
          titulo: '',
          professor,
          data,
          disciplina,
          serie,
          tema,
          duracao: slideContent.duracao || '',
          bncc: slideContent.bncc || '',
          ...slideContent
        };

      case 'atividade':
        return {
          titulo: '',
          professor,
          data,
          disciplina,
          serie,
          tema,
          duracao: '',
          bncc: '',
          instrucoes: '',
          questoes: extractQuestions(content, formData.numeroQuestoes || 5) || [],
          criterios_avaliacao: extractFieldFromContent(content, 'Critérios') ? [extractFieldFromContent(content, 'Critérios')] : []
        };

      case 'avaliacao':
        const assuntos = formData.assuntos || formData.subjects || [tema];
        return {
          titulo: '',
          professor,
          data,
          disciplina,
          serie,
          tema: '',
          duracao: '',
          bncc: '',
          instrucoes: '',
          questoes: extractQuestions(content, formData.numeroQuestoes || 5) || [],
          criterios_avaliacao: extractFieldFromContent(content, 'Critérios') ? [extractFieldFromContent(content, 'Critérios')] : []
        };

      default:
        return { content };
    }
  } catch (error) {
    return {
      titulo: '',
      professor,
      data,
      disciplina,
      serie,
      tema,
      duracao: '',
      content: ''
    };
  }
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
      .split(/[,\n]/)
      .map(r => r.trim())
      .filter(r => r.length > 0 && r !== ':');
    
    if (resources.length > 0) {
      return resources;
    }
  }
  
  return [];
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

function extractSlidesContent(content: string): any {
  // Implementação mínima: tenta parsear JSON, senão retorna campos vazios
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {}
  return {};
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

function extractFieldFromContent(content: string, fieldName: string): string {
  const regex = new RegExp(`${fieldName}:\\s*\\[([^\\]]+)\\]`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}
