// Edge Function: gerarImagemIA
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Prompt inválido.' }), { status: 400 });
    }

    // Chave da OpenAI deve ser configurada como variável de ambiente segura
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'API key não configurada.' }), { status: 500 });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150,
        tools: [{ type: 'image_generation' }]
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return new Response(JSON.stringify({ success: false, error: 'Erro na OpenAI: ' + err }), { status: 500 });
    }

    const data = await openaiRes.json();
    // A resposta do GPT-4o com image_generation deve conter a URL da imagem
    let imageUrl = null;
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.tool_calls) {
      const toolCall = data.choices[0].message.tool_calls.find((t: any) => t.type === 'image_generation');
      if (toolCall && toolCall.function && toolCall.function.arguments) {
        const args = JSON.parse(toolCall.function.arguments);
        imageUrl = args.url || args.image_url || null;
      }
    }
    if (!imageUrl) {
      return new Response(JSON.stringify({ success: false, error: 'Imagem não gerada.' }), { status: 500 });
    }
    return new Response(JSON.stringify({ success: true, imageUrl }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
  }
}); 