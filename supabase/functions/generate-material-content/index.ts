
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaterialRequest {
  type: string;
  formData: {
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
  };
}

function buildPromptForMaterial(type: string, formData: any): string {
  const topic = formData.tema || formData.topic || 'Conteúdo';
  const subject = formData.disciplina || formData.subject || 'Disciplina';
  const grade = formData.serie || formData.grade || 'Série';
  const professor = formData.professor || 'Professor(a)';
  const data = formData.data || new Date().toLocaleDateString('pt-BR');
  const duracao = formData.duracao || '50 minutos';
  const bncc = formData.bncc || 'Habilidades da BNCC relacionadas ao tema';
  
  const baseContext = `Você é um pedagogo experiente brasileiro com especialização em ${subject} e profundo conhecimento da BNCC. Desenvolva um ${type} altamente específico e detalhado sobre "${topic}" para ${grade} em ${subject}. Use dados reais, exemplos práticos e metodologias comprovadas.`;
  
  switch (type) {
    case 'plano-de-aula':
      return `${baseContext}

INSTRUÇÕES ESPECÍFICAS:
- Substitua TODAS as variáveis entre {{}} pelos dados fornecidos
- Crie conteúdo específico e detalhado para ${topic} em ${subject}
- Use exemplos concretos da realidade brasileira
- Inclua atividades práticas adequadas para ${grade}

ESTRUTURA OBRIGATÓRIA:
**TEMA DA AULA:** ${topic}
**DISCIPLINA:** ${subject}
**SÉRIE/ANO:** ${grade}
**PROFESSOR:** ${professor}
**DATA:** ${data}
**DURAÇÃO:** ${duracao}

**OBJETIVOS DE APRENDIZAGEM:**
• Compreender os conceitos fundamentais de ${topic} aplicados ao contexto de ${grade}
• Desenvolver habilidades práticas relacionadas a ${topic} em ${subject}
• Aplicar conhecimentos de ${topic} em situações cotidianas
• Demonstrar domínio dos conceitos através de atividades avaliativas

**HABILIDADES DA BNCC:**
${bncc === 'Habilidades da BNCC relacionadas ao tema' ? `• EF${grade.includes('1°') ? '01' : grade.includes('2°') ? '02' : grade.includes('3°') ? '03' : grade.includes('4°') ? '04' : '05'}MA${subject === 'matemática' ? Math.floor(Math.random() * 30) + 1 : '01'}: Específica para ${topic} em ${grade}` : bncc}

**METODOLOGIA:**
• Aprendizagem ativa com foco na construção do conhecimento
• Metodologia investigativa adequada para ${topic}
• Uso de recursos manipuláveis e visuais
• Trabalho colaborativo e individual equilibrado

**DESENVOLVIMENTO DA AULA:**

1. **INTRODUÇÃO (10 min)**
   - Atividade: Dinâmica contextual sobre ${topic} usando exemplos do cotidiano
   - Estratégia: Despertar curiosidade através de questionamentos investigativos
   - Recursos: Material concreto relacionado a ${topic}

2. **DESENVOLVIMENTO (25 min)**
   - Conteúdo principal: Conceitos essenciais de ${topic} com exemplos práticos
   - Atividades práticas: Exercícios manipulativos específicos de ${subject}
   - Recursos didáticos: Materiais pedagógicos adequados para ${grade}
   - Interação: Participação ativa dos estudantes na construção do conhecimento

3. **CONSOLIDAÇÃO (10 min)**
   - Atividade de fixação: Exercício prático aplicando conceitos de ${topic}
   - Verificação de aprendizagem: Observação e registro do desempenho
   - Feedback: Correção coletiva e esclarecimento de dúvidas

4. **ENCERRAMENTO (5 min)**
   - Síntese: Revisão dos principais conceitos de ${topic} abordados
   - Preparação próxima aula: Conexão com próximos conteúdos de ${subject}
   - Tarefa: Atividade complementar para casa (opcional)

**RECURSOS NECESSÁRIOS:**
• Quadro branco/negro e marcadores
• Material manipulativo específico para ${topic}
• Folhas de atividades impressas
• Recursos tecnológicos (se disponível)
• Materiais recicláveis para atividades práticas

**AVALIAÇÃO:**
• Formativa: Observação contínua da participação e compreensão
• Somativa: Análise das atividades práticas e exercícios propostos
• Critérios: Compreensão conceitual, aplicação prática e participação ativa
• Instrumentos: Registro de observação e análise de produções

**ADAPTAÇÕES INCLUSIVAS:**
• Estratégias visuais, auditivas e cinestésicas
• Materiais adaptados para necessidades específicas
• Tempo adicional para estudantes que necessitarem
• Agrupamentos estratégicos para apoio mútuo

DESENVOLVA o conteúdo de forma específica, detalhada e pedagogicamente fundamentada para ${topic} em ${subject} destinado a ${grade}.`;

    case 'slides':
      return `${baseContext}

Crie uma apresentação de slides completa e didática sobre "${topic}" para ${grade} em ${subject}.

ESTRUTURA DOS SLIDES:

**SLIDE 1 - CAPA**
Título: ${topic}
Disciplina: ${subject}
Série: ${grade}

**SLIDE 2 - OBJETIVOS**
O que vamos aprender hoje:
• [3-4 objetivos específicos para ${topic}]

**SLIDES 3-6 - CONTEÚDO PRINCIPAL**
Para cada slide, desenvolva:
- Título claro e direto
- Conteúdo didático com conceitos essenciais
- Exemplos práticos relacionados ao cotidiano do aluno
- Elementos visuais sugeridos (gráficos, imagens, diagramas)

**SLIDE 7 - ATIVIDADE PRÁTICA**
Exercício interativo sobre ${topic}:
- Instrução clara para atividade
- Exemplo de resolução
- Critérios de avaliação

**SLIDE 8 - SÍNTESE**
Principais conceitos aprendidos:
• [Resumo dos pontos-chave]

**SLIDE 9 - PRÓXIMOS PASSOS**
Como aplicar o conhecimento:
- Sugestões de estudo
- Conexões com outros temas
- Preparação para próxima aula

**SLIDE 10 - REFERÊNCIAS**
- Bibliografia específica do tema
- Recursos complementares
- Links educacionais confiáveis

Desenvolva conteúdo específico, técnico e pedagogicamente rico para cada slide. Use linguagem adequada à faixa etária e inclua elementos que facilitem a compreensão visual.`;

    case 'atividade':
      const questionCount = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
      const questionType = formData.tipoQuestoes || 'mistas';
      
      return `${baseContext}

Desenvolva uma atividade completa com ${questionCount} questões do tipo "${questionType}" sobre "${topic}".

**CABEÇALHO DA ATIVIDADE:**
Atividade de ${subject} - ${grade}
Tema: ${topic}
Instruções: Leia atentamente cada questão e responda de forma completa e fundamentada.

**QUESTÕES:**

Para questões OBJETIVAS (múltipla escolha):
- Enunciado claro e contextualizado
- 4 alternativas plausíveis (A, B, C, D)
- Apenas uma alternativa correta
- Distradores bem elaborados

Para questões DISSERTATIVAS:
- Comando claro e específico
- Critérios de avaliação definidos
- Pontuação por critério
- Exemplo de resposta esperada

Para questões MISTAS:
- Combine ambos os tipos equilibradamente
- Varie os níveis de dificuldade (básico, intermediário, avançado)
- Inclua questões de aplicação prática

**NÍVEIS COGNITIVOS:**
- Conhecimento: ${Math.ceil(questionCount * 0.2)} questões
- Compreensão: ${Math.ceil(questionCount * 0.3)} questões  
- Aplicação: ${Math.ceil(questionCount * 0.3)} questões
- Análise: ${Math.ceil(questionCount * 0.2)} questões

**GABARITO COMENTADO:**
Para cada questão, forneça:
- Resposta correta
- Justificativa pedagógica
- Conceitos envolvidos
- Dicas para resolução

**CRITÉRIOS DE AVALIAÇÃO:**
- Domínio conceitual (40%)
- Aplicação prática (30%)  
- Clareza na expressão (20%)
- Criatividade/originalidade (10%)

Desenvolva questões originais, desafiadoras e pedagogicamente fundamentadas, específicas para ${topic} em ${subject}.`;

    case 'avaliacao':
      const subjects = formData.assuntos || formData.subjects || [topic];
      const evalQuestionCount = formData.numeroQuestoes || formData.quantidadeQuestoes || 10;
      const evalQuestionType = formData.tipoQuestoes || 'mistas';
      
      return `${baseContext}

Desenvolva uma avaliação formal com ${evalQuestionCount} questões do tipo "${evalQuestionType}" abrangendo: ${subjects.join(', ')}.

**CABEÇALHO DA AVALIAÇÃO:**
AVALIAÇÃO DE ${subject.toUpperCase()}
Série: ${grade}
Conteúdos: ${subjects.join(', ')}
Valor: 10,0 pontos
Duração: ${formData.duracao || '50 minutos'}

**INSTRUÇÕES AO ALUNO:**
• Leia todas as questões antes de começar
• Responda com caneta azul ou preta
• Questões objetivas: marque apenas uma alternativa
• Questões dissertativas: desenvolva respostas completas
• Boa prova!

**DISTRIBUIÇÃO DAS QUESTÕES:**
${subjects.map((subject, index) => 
  `Conteúdo ${index + 1} (${subject}): ${Math.ceil(evalQuestionCount / subjects.length)} questões`
).join('\n')}

**QUESTÕES DA AVALIAÇÃO:**

Para cada questão, desenvolva:

QUESTÕES OBJETIVAS (60% da nota):
- Enunciado contextualizado e claro
- Comando específico e direto  
- 4 alternativas bem elaboradas
- Apenas uma correta
- Valor: [X] pontos

QUESTÕES DISSERTATIVAS (40% da nota):
- Situação-problema real
- Comando claro do que é esperado
- Critérios específicos de correção
- Pontuação detalhada por item
- Valor: [X] pontos

**DISTRIBUIÇÃO DE PONTOS:**
- Total: 10,0 pontos
- Questões objetivas: 6,0 pontos
- Questões dissertativas: 4,0 pontos

**CRITÉRIOS DE CORREÇÃO:**
Para questões dissertativas:
- Conceituação correta (40%)
- Exemplificação adequada (30%)
- Clareza na expressão (20%)
- Aplicação prática (10%)

**GABARITO OFICIAL:**
[Para cada questão, apresente resposta e justificativa]

**ANÁLISE DE DESEMPENHO ESPERADO:**
- Conceitos básicos: 70% de acertos
- Aplicação: 60% de acertos  
- Análise crítica: 50% de acertos

Crie uma avaliação rigorosa, justa e pedagogicamente fundamentada, que permita verificar diferentes níveis de aprendizagem em ${subject}.`;

    default:
      return `${baseContext} Desenvolva um material educativo de excelente qualidade, seguindo as melhores práticas pedagógicas e adequado à realidade educacional brasileira.`;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 Starting enhanced AI content generation...');
    
    const { type, formData }: MaterialRequest = await req.json();
    console.log('📋 Request data:', { type, formData });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = buildPromptForMaterial(type, formData);
    console.log('📝 Generated enhanced prompt for type:', type);

    console.log('🔄 Calling OpenAI API with optimized settings...');
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
            content: 'Você é um pedagogo brasileiro especialista com 15+ anos de experiência em educação e domínio completo da BNCC. Crie conteúdo educacional altamente específico, detalhado e pedagogicamente avançado. Use dados reais, exemplos práticos brasileiros e metodologias comprovadas. Responda SEMPRE em português brasileiro com linguagem técnica e profissional.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 3000,
        top_p: 0.9,
        frequency_penalty: 0.4,
        presence_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Enhanced OpenAI response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI');
    }

    const generatedContent = data.choices[0].message.content;
    console.log('📝 High-quality content generated successfully, length:', generatedContent.length);

    return new Response(JSON.stringify({ 
      success: true,
      content: generatedContent,
      usage: data.usage,
      model: 'gpt-4o-mini',
      settings: { temperature: 0.9, max_tokens: 4000 }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in enhanced generate-material-content function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
