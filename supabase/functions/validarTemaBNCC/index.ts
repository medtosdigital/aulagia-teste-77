
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

Analise se o tema "${tema}" está alinhado com a BNCC para a disciplina "${disciplina}" na série "${serie}".

IMPORTANTE: Seja rigoroso na análise. O tema deve estar claramente relacionado aos objetivos de aprendizagem e habilidades específicas da BNCC para essa disciplina e série.

Se o tema NÃO estiver alinhado:
- Explique brevemente por que não está alinhado
- Sugira de 2 a 3 temas alternativos que estejam perfeitamente alinhados com a BNCC para essa disciplina e série

Responda SEMPRE em JSON no formato:
{
  "alinhado": true/false,
  "mensagem": "explicação detalhada do resultado da análise",
  "sugestoes": ["sugestão 1", "sugestão 2", "sugestão 3"] (apenas se não alinhado)
}`;

  try {
    console.log('Chamando OpenAI para validar tema:', { tema, disciplina, serie });
    
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
            content: 'Você é um especialista em educação brasileira e BNCC. Sempre responda em português do Brasil e seja preciso na análise da adequação dos temas à BNCC.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      console.error('Erro na requisição OpenAI:', response.status, response.statusText);
      return {
        alinhado: false,
        mensagem: `Não foi possível validar o tema via OpenAI: ${response.statusText}`,
        sugestoes: []
      };
    }

    const data = await response.json();
    console.log('Resposta da OpenAI:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Resposta inválida da OpenAI:', data);
      return {
        alinhado: false,
        mensagem: 'Erro ao interpretar resposta da OpenAI.',
        sugestoes: []
      };
    }

    const content = data.choices[0].message.content;
    console.log('Conteúdo da resposta:', content);

    try {
      const result = JSON.parse(content);
      console.log('Resultado parseado:', result);
      
      // Garantir que a resposta tenha a estrutura esperada
      return {
        alinhado: Boolean(result.alinhado),
        mensagem: result.mensagem || 'Análise concluída.',
        sugestoes: Array.isArray(result.sugestoes) ? result.sugestoes : []
      };
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta JSON:', parseError, 'Conteúdo:', content);
      return {
        alinhado: false,
        mensagem: 'Erro ao interpretar resposta da OpenAI.',
        sugestoes: []
      };
    }
  } catch (error) {
    console.error('Erro na validação do tema:', error);
    return {
      alinhado: false,
      mensagem: 'Erro interno ao validar o tema.',
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
    
    console.log('Requisição recebida:', { tema, disciplina, serie });
    
    if (!tema || !disciplina || !serie) {
      return new Response(
        JSON.stringify({ 
          error: "Campos obrigatórios: tema, disciplina, serie",
          alinhado: false,
          mensagem: "Dados incompletos para validação.",
          sugestoes: []
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const resultado = await validarTema(tema, disciplina, serie);
    
    console.log('Resultado final:', resultado);
    
    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return new Response(
      JSON.stringify({ 
        error: "Erro ao processar requisição", 
        details: error.message,
        alinhado: false,
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
