
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CodigoBNCCRequest {
  tema: string;
  disciplina: string;
  serie: string;
  codigosGerados: string[];
}

interface CodigoBNCCResponse {
  codigosValidados: Array<{
    codigo: string;
    isValid: boolean;
    codigoCorreto?: string;
    justificativa: string;
  }>;
  sugestoesMelhoria: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tema, disciplina, serie, codigosGerados }: CodigoBNCCRequest = await req.json();

    console.log('🔍 Validando códigos BNCC:', { tema, disciplina, serie, codigosGerados });

    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `
Você é um especialista em BNCC (Base Nacional Comum Curricular) brasileiro. Sua função é validar códigos BNCC específicos para um tema de aula.

DADOS DA AULA:
- Tema: "${tema}"
- Disciplina: ${disciplina}
- Série: ${serie}

CÓDIGOS GERADOS PARA VALIDAÇÃO:
${codigosGerados.map((codigo, index) => `${index + 1}. ${codigo}`).join('\n')}

INSTRUÇÕES CRÍTICAS:
1. Para CADA código informado, verifique se ele está DIRETAMENTE relacionado ao tema "${tema}"
2. Se o código NÃO for adequado para o tema, forneça o código CORRETO da BNCC
3. Use apenas códigos REAIS da BNCC oficial brasileira
4. Foque especificamente no tema "${tema}", não apenas na disciplina/série
5. Seja RIGOROSO - códigos devem abordar especificamente o conteúdo do tema

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "codigosValidados": [
    {
      "codigo": "CÓDIGO_ORIGINAL",
      "isValid": true/false,
      "codigoCorreto": "CÓDIGO_CORRETO_SE_NECESSÁRIO",
      "justificativa": "Explicação detalhada sobre por que o código está correto/incorreto e qual seria o adequado"
    }
  ],
  "sugestoesMelhoria": [
    "Sugestão 1 para melhorar a escolha de códigos BNCC",
    "Sugestão 2 específica para o tema ${tema}"
  ]
}

EXEMPLO de validação incorreta:
- Se o tema é "Formas geométricas planas" e o código é "EF03MA19" (que trata de medidas de comprimento), o código está INCORRETO
- O código correto seria algo como "EF03MA15" (que trata especificamente de figuras geométricas planas)

Retorne APENAS o JSON estruturado conforme solicitado.
`;

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
            content: 'Você é um especialista em BNCC brasileiro que valida códigos de habilidades com precisão absoluta. Sempre retorne respostas em JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('❌ OpenAI API error:', response.status, response.statusText);
      throw new Error(`Erro na API OpenAI: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('📊 Resposta da validação BNCC:', generatedContent);

    // Parse the JSON response
    let validationResult: CodigoBNCCResponse;
    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Resposta não contém JSON válido');
      }
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta JSON:', parseError);
      throw new Error('Erro ao processar resposta da validação');
    }

    console.log('✅ Validação processada com sucesso:', validationResult);

    return new Response(JSON.stringify({
      success: true,
      ...validationResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na validação de códigos BNCC:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno na validação',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
