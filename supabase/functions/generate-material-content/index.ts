
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
  
  const baseContext = `Você é um especialista em educação brasileira e conhece profundamente a BNCC. Crie um ${type} detalhado e pedagógico sobre "${topic}" para a disciplina de ${subject}, voltado para ${grade}.`;
  
  switch (type) {
    case 'plano-de-aula':
      return `${baseContext}

INSTRUÇÕES ESPECÍFICAS:
- Crie objetivos de aprendizagem claros e mensuráveis
- Desenvolva atividades práticas e engajadoras
- Inclua metodologias ativas de ensino
- Sugira recursos didáticos variados
- Propose formas de avaliação formativa e somativa
- Alinhe com as competências da BNCC
- Considere diferentes estilos de aprendizagem

O plano deve ser estruturado, prático e aplicável em sala de aula, com atividades que promovam o protagonismo do aluno e o desenvolvimento de competências essenciais.`;

    case 'slides':
      return `${baseContext}

INSTRUÇÕES ESPECÍFICAS:
- Crie slides com conteúdo visual e objetivo
- Use linguagem clara e acessível para a faixa etária
- Inclua conceitos fundamentais e exemplos práticos
- Organize o conteúdo de forma lógica e progressiva
- Sugira elementos visuais quando relevante
- Mantenha cada slide focado em um conceito principal
- Inclua perguntas para engajar os alunos

Os slides devem ser didáticos, visualmente organizados e facilitar a compreensão do tema pelos estudantes.`;

    case 'atividade':
      const questionCount = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
      const questionType = formData.tipoQuestoes || 'mistas';
      
      return `${baseContext}

INSTRUÇÕES ESPECÍFICAS:
- Crie ${questionCount} questões do tipo: ${questionType}
- Para questões abertas: formulações que estimulem reflexão e análise crítica
- Para questões fechadas: alternativas plausíveis com apenas uma correta
- Para questões mistas: combine ambos os tipos equilibradamente
- Inclua diferentes níveis de dificuldade (básico, intermediário, avançado)
- Relacione as questões com situações do cotidiano quando possível
- Forneça gabaritos e explicações detalhadas
- Desenvolva critérios de avaliação claros

As questões devem avaliar diferentes habilidades cognitivas e promover o aprendizado significativo.`;

    case 'avaliacao':
      const subjects = formData.assuntos || formData.subjects || [topic];
      const evalQuestionCount = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
      const evalQuestionType = formData.tipoQuestoes || 'mistas';
      
      return `${baseContext}

CONTEÚDOS A AVALIAR: ${subjects.join(', ')}

INSTRUÇÕES ESPECÍFICAS:
- Crie ${evalQuestionCount} questões do tipo: ${evalQuestionType}
- Distribua as questões equilibradamente entre os conteúdos listados
- Para questões objetivas: 4 alternativas com apenas uma correta
- Para questões dissertativas: comando claro e critérios de correção
- Inclua questões de diferentes níveis taxonômicos (conhecimento, compreensão, aplicação, análise)
- Estabeleça pontuação para cada questão
- Defina tempo sugerido para resolução
- Inclua instruções claras para os estudantes

A avaliação deve ser justa, abrangente e alinhada aos objetivos de aprendizagem estabelecidos.`;

    default:
      return `${baseContext} Crie um material educativo de qualidade, seguindo as melhores práticas pedagógicas.`;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 Starting AI content generation...');
    
    const { type, formData }: MaterialRequest = await req.json();
    console.log('📋 Request data:', { type, formData });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = buildPromptForMaterial(type, formData);
    console.log('📝 Generated prompt for type:', type);

    console.log('🔄 Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em educação brasileira, pedagogo experiente e conhecedor da BNCC. Responda sempre em português do Brasil com linguagem técnica mas acessível.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI');
    }

    const generatedContent = data.choices[0].message.content;
    console.log('📝 Content generated successfully, length:', generatedContent.length);

    return new Response(JSON.stringify({ 
      success: true,
      content: generatedContent,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in generate-material-content function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
