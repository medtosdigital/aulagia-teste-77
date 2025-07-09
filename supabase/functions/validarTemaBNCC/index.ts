
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function validarTema(tema: string, disciplina: string, serie: string) {
  if (!openAIApiKey) {
    console.error('OpenAI API key não configurada');
    return {
      alinhado: false,
      mensagem: 'Erro ao validar tema na BNCC: API não configurada.',
      sugestoes: []
    };
  }

  const prompt = `Você é um especialista em educação brasileira e conhece profundamente a BNCC (Base Nacional Comum Curricular). 

IMPORTANTE: Seja MUITO RIGOROSO na análise. Analise se o tema "${tema}" está EXATAMENTE alinhado com a BNCC para a disciplina "${disciplina}" na série "${serie}".

CRITÉRIOS RIGOROSOS:
1. O tema deve corresponder EXATAMENTE às competências e habilidades específicas da BNCC para essa série e disciplina
2. Deve estar adequado ao nível de desenvolvimento cognitivo da faixa etária
3. Deve seguir a progressão curricular definida pela BNCC
4. O vocabulário e conceitos devem ser apropriados para a série

INSTRUÇÕES ESPECÍFICAS:
- Se o tema for muito avançado para a série: NÃO está alinhado
- Se o tema for muito básico para a série: NÃO está alinhado  
- Se o tema não aparecer nas competências da BNCC para essa série: NÃO está alinhado
- Se houver inadequação de terminologia ou conceitos: NÃO está alinhado

EXEMPLO DE ANÁLISE RIGOROSA:
- "Equação do 1º grau" para 3º Ano do Ensino Fundamental I: NÃO ALINHADO (muito avançado, esse conteúdo é do 7º ano)
- "Multiplicação e Divisão" para 3º Ano do Ensino Fundamental I: ALINHADO (adequado para a série)

Se NÃO estiver alinhado, forneça 3 sugestões de temas que sejam PERFEITAMENTE adequados para "${disciplina}" no "${serie}" segundo a BNCC.

Responda SEMPRE em JSON no formato:
{
  "alinhado": true/false,
  "mensagem": "explicação detalhada e específica sobre por que está ou não alinhado, citando a BNCC",
  "sugestoes": ["sugestão 1 específica", "sugestão 2 específica", "sugestão 3 específica"] (apenas se não alinhado)
}`;

  try {
    console.log('🔍 Validando tema na BNCC:', { tema, disciplina, serie });
    
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
            content: 'Você é um especialista em educação brasileira e BNCC. Seja MUITO RIGOROSO na análise. Sempre responda em português do Brasil e seja preciso na análise da adequação dos temas à BNCC.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      console.error('❌ Erro na requisição OpenAI:', response.status, response.statusText);
      return {
        alinhado: true, // Em caso de erro, permitir prosseguir
        mensagem: `Não foi possível validar o tema via OpenAI: ${response.statusText}`,
        sugestoes: []
      };
    }

    const data = await response.json();
    console.log('📊 Resposta da OpenAI:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Resposta inválida da OpenAI:', data);
      return {
        alinhado: true,
        mensagem: 'Erro ao interpretar resposta da OpenAI.',
        sugestoes: []
      };
    }

    const content = data.choices[0].message.content;
    console.log('📝 Conteúdo da resposta:', content);

    try {
      const result = JSON.parse(content);
      console.log('✅ Resultado parseado:', result);
      
      // Garantir que a resposta tenha a estrutura esperada
      return {
        alinhado: Boolean(result.alinhado),
        mensagem: result.mensagem || 'Análise BNCC concluída.',
        sugestoes: Array.isArray(result.sugestoes) ? result.sugestoes : []
      };
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta JSON:', parseError, 'Conteúdo:', content);
      return {
        alinhado: true, // Em caso de erro, permitir prosseguir
        mensagem: 'Erro ao interpretar resposta da validação BNCC.',
        sugestoes: []
      };
    }
  } catch (error) {
    console.error('❌ Erro na validação do tema:', error);
    return {
      alinhado: true, // Em caso de erro, permitir prosseguir
      mensagem: 'Erro interno ao validar o tema na BNCC.',
      sugestoes: []
    };
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
          alinhado: true,
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
        alinhado: true,
        mensagem: "Erro interno do servidor.",
        sugestoes: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
