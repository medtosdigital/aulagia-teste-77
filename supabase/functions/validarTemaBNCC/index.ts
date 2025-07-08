import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

async function validarTema(tema: string, disciplina: string, serie: string) {
  if (!openAIApiKey) {
    return {
      alinhado: false,
      mensagem: `OpenAI API não configurada no ambiente.` ,
      sugestoes: []
    };
  }
  const prompt = `Você é um especialista em educação brasileira e conhece profundamente a BNCC. Analise o tema "${tema}" para a disciplina "${disciplina}" na série "${serie}". O tema está alinhado à BNCC? Responda "sim" ou "não" e, se não estiver, sugira 2 a 3 temas alternativos alinhados à BNCC para essa disciplina e série. Responda em JSON no formato: { "alinhado": true|false, "mensagem": "...", "sugestoes": ["tema1", "tema2", ...] }`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Você é um especialista em educação brasileira e BNCC.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 300
    })
  });
  if (!response.ok) {
    return {
      alinhado: false,
      mensagem: `Não foi possível validar o tema via OpenAI: ${response.statusText}`,
      sugestoes: []
    };
  }
  const data = await response.json();
  try {
    const content = data.choices[0].message.content;
    const json = JSON.parse(content);
    return json;
  } catch (e) {
    return {
      alinhado: false,
      mensagem: 'Erro ao interpretar resposta da OpenAI.',
      sugestoes: []
    };
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Método não permitido", { status: 405 });
  }
  try {
    const { tema, disciplina, serie } = await req.json();
    if (!tema || !disciplina || !serie) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: tema, disciplina, serie" }),
        { status: 400 }
      );
    }
    const resultado = await validarTema(tema, disciplina, serie);
    return new Response(JSON.stringify(resultado), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Erro ao processar requisição", details: e.message }),
      { status: 500 }
    );
  }
}); 