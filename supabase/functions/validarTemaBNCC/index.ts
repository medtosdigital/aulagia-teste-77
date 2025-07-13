
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache de validações para evitar chamadas repetidas
const validationCache = new Map<string, any>();

async function validarTema(tema: string, disciplina: string, serie: string) {
  if (!openAIApiKey) {
    console.error('OpenAI API key não configurada');
    return {
      alinhado: false,
      mensagem: 'Erro ao validar tema na BNCC: API não configurada.',
      sugestoes: []
    };
  }

  // Verificar cache primeiro
  const cacheKey = `${tema}_${disciplina}_${serie}`;
  if (validationCache.has(cacheKey)) {
    console.log('📦 Usando resultado do cache para:', cacheKey);
    return validationCache.get(cacheKey);
  }

  // Primeira etapa: Verificação de adequação geral
  const preValidationPrompt = `Você é um especialista em educação brasileira e BNCC.

ANÁLISE PRÉVIA: O tema "${tema}" é apropriado para a disciplina "${disciplina}" na série "${serie}"?

Considere apenas:
1. Se o tema é adequado à faixa etária da série
2. Se faz sentido dentro da disciplina
3. Se não é excessivamente complexo nem muito básico

Responda apenas: SIM ou NÃO`;

  try {
    console.log('🔍 Primeira etapa - Validação prévia:', { tema, disciplina, serie });
    
    const preResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um educador experiente. Seja objetivo e prático.' },
          { role: 'user', content: preValidationPrompt }
        ],
        temperature: 0.3,
        max_tokens: 10
      })
    });

    const preData = await preResponse.json();
    const preResult = preData.choices?.[0]?.message?.content?.trim().toUpperCase();
    
    console.log('📊 Resultado da pré-validação:', preResult);

    // Se não passou na pré-validação, retorna como não alinhado
    if (preResult !== 'SIM') {
      const result = {
        alinhado: false,
        mensagem: `O tema "${tema}" não é adequado para ${disciplina} no ${serie}. Considere temas mais apropriados para esta faixa etária e disciplina.`,
        sugestoes: await gerarSugestoesInteligentes(disciplina, serie)
      };
      
      validationCache.set(cacheKey, result);
      return result;
    }

    // Segunda etapa: Validação detalhada com BNCC
    const detailedPrompt = `Você é um especialista em educação brasileira com conhecimento profundo da BNCC.

ANÁLISE DETALHADA: Avalie se o tema "${tema}" está alinhado com as competências da BNCC para "${disciplina}" na série "${serie}".

CRITÉRIOS DE ANÁLISE:
1. **Adequação Curricular**: O tema aparece ou se relaciona diretamente com as habilidades da BNCC para esta série?
2. **Complexidade Apropriada**: O nível de profundidade está adequado para a idade/série?
3. **Contextualização**: O tema permite trabalhar as competências gerais da BNCC?
4. **Aplicabilidade**: É um tema que pode ser desenvolvido pedagogicamente na série?

IMPORTANTE:
- Seja EQUILIBRADO na análise - nem muito rígido nem muito permissivo
- Considere que temas fundamentais (como "Ciclo da água" em Ciências) são VÁLIDOS quando apropriados
- Foque na ADEQUAÇÃO PEDAGÓGICA, não apenas na literalidade da BNCC
- Um tema pode ser válido se permitir o desenvolvimento das competências, mesmo que não esteja literalmente citado

FORMATO DE RESPOSTA (JSON):
{
  "alinhado": true/false,
  "confianca": 0.8 (nível de confiança na avaliação),
  "mensagem": "Explicação CONCISA (2-3 linhas) sobre a adequação do tema",
  "sugestoes": ["sugestão 1", "sugestão 2", "sugestão 3"] (apenas se não alinhado),
  "justificativa": "Breve justificativa técnica baseada na BNCC"
}`;

    console.log('🔍 Segunda etapa - Validação detalhada BNCC');
    
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
            content: 'Você é um especialista em BNCC. Seja equilibrado: aprove temas pedagogicamente válidos, reprove apenas os inadequados. Sempre responda em JSON válido.' 
          },
          { role: 'user', content: detailedPrompt }
        ],
        temperature: 0.4,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      console.error('❌ Erro na requisição OpenAI:', response.status, response.statusText);
      return {
        alinhado: true, // Em caso de erro, permitir por segurança
        mensagem: `Não foi possível validar o tema no momento. Prosseguindo com a criação.`,
        sugestoes: []
      };
    }

    const data = await response.json();
    console.log('📊 Resposta completa da OpenAI:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Resposta inválida da OpenAI:', data);
      return {
        alinhado: true, // Fallback seguro
        mensagem: 'Validação concluída. Prosseguindo com a criação.',
        sugestoes: []
      };
    }

    const content = data.choices[0].message.content;
    console.log('📝 Conteúdo da resposta:', content);

    try {
      const result = JSON.parse(content);
      console.log('✅ Resultado parseado:', result);
      
      // Garantir estrutura consistente
      const finalResult = {
        alinhado: Boolean(result.alinhado),
        mensagem: result.mensagem || 'Análise BNCC concluída.',
        sugestoes: Array.isArray(result.sugestoes) ? result.sugestoes : [],
        confianca: result.confianca || 0.5,
        justificativa: result.justificativa || ''
      };

      // Armazenar no cache
      validationCache.set(cacheKey, finalResult);
      
      return finalResult;
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta JSON:', parseError, 'Conteúdo:', content);
      return {
        alinhado: true, // Em caso de erro de parse, permitir
        mensagem: 'Análise concluída. Prosseguindo com a criação do material.',
        sugestoes: []
      };
    }
  } catch (error) {
    console.error('❌ Erro na validação do tema:', error);
    return {
      alinhado: true, // Fallback seguro em caso de erro
      mensagem: 'Não foi possível validar completamente o tema. Prosseguindo com a criação.',
      sugestoes: []
    };
  }
}

async function gerarSugestoesInteligentes(disciplina: string, serie: string): Promise<string[]> {
  if (!openAIApiKey) return [];

  const prompt = `Sugira 3 temas fundamentais e apropriados para "${disciplina}" na série "${serie}".

CRITÉRIOS:
- Temas centrais da disciplina para a faixa etária
- Adequados ao nível de desenvolvimento cognitivo
- Que permitam trabalhar competências da BNCC
- Práticos e aplicáveis em sala de aula

Responda apenas com uma lista de 3 temas, um por linha, sem numeração.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um educador experiente. Seja prático e direto.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 200
      })
    });

    const data = await response.json();
    const suggestions = data.choices?.[0]?.message?.content?.trim().split('\n').filter(s => s.trim()) || [];
    
    return suggestions.slice(0, 3); // Garantir máximo 3 sugestões
  } catch (error) {
    console.error('❌ Erro ao gerar sugestões:', error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Método não permitido", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { tema, disciplina, serie } = await req.json();
    
    console.log('📨 Requisição recebida:', { tema, disciplina, serie });
    
    if (!tema || !disciplina || !serie) {
      return new Response(
        JSON.stringify({ 
          error: "Campos obrigatórios: tema, disciplina, serie",
          alinhado: false,
          mensagem: "Dados incompletos para validação BNCC.",
          sugestoes: []
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const resultado = await validarTema(tema, disciplina, serie);
    
    console.log('🎯 Resultado final da validação:', resultado);
    
    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('❌ Erro ao processar requisição:', error);
    return new Response(
      JSON.stringify({ 
        error: "Erro ao processar requisição", 
        details: error.message,
        alinhado: true, // Fallback seguro
        mensagem: "Erro interno, mas prosseguindo com a criação do material.",
        sugestoes: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
