import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HabilidadeBNCC {
  codigo: string;
  descricao: string;
}

interface CorrigirHabilidadesRequest {
  tema: string;
  disciplina: string;
  serie: string;
  habilidadesGeradas: HabilidadeBNCC[];
}

interface CorrigirHabilidadesResponse {
  habilidadesCorrigidas: HabilidadeBNCC[];
  sugestoesMelhoria: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tema, disciplina, serie, habilidadesGeradas }: CorrigirHabilidadesRequest = await req.json();

    console.log('🔧 Corrigindo habilidades BNCC:', { tema, disciplina, serie, habilidadesGeradas });

    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `
Você é um especialista em BNCC (Base Nacional Comum Curricular) brasileiro. Sua função é corrigir e validar códigos BNCC específicos para um tema de aula.

DADOS DA AULA:
- Tema: "${tema}"
- Disciplina: ${disciplina}
- Série: ${serie}

HABILIDADES GERADAS PARA CORREÇÃO:
${habilidadesGeradas.map((h, index) => `${index + 1}. Código: ${h.codigo} - Descrição: ${h.descricao}`).join('\n')}

INSTRUÇÕES CRÍTICAS:
1. Para CADA habilidade informada, verifique se o código BNCC está CORRETO e DIRETAMENTE relacionado ao tema "${tema}"
2. Se o código NÃO for adequado para o tema, forneça o código CORRETO da BNCC
3. Use APENAS códigos REAIS da BNCC oficial brasileira
4. Foque especificamente no tema "${tema}", não apenas na disciplina/série
5. Seja RIGOROSO - códigos devem abordar especificamente o conteúdo do tema
6. Mantenha a descrição original se o código estiver correto, ou ajuste se necessário
7. Certifique-se de que os códigos são válidos para a série especificada

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "habilidadesCorrigidas": [
    {
      "codigo": "CÓDIGO_BNCC_CORRETO",
      "descricao": "Descrição da habilidade (mantida ou ajustada)"
    }
  ],
  "sugestoesMelhoria": [
    "Sugestão 1 para melhorar a escolha de códigos BNCC",
    "Sugestão 2 específica para o tema ${tema}"
  ]
}

EXEMPLO de correção:
- Se o tema é "Multiplicação" e o código é "EF03MA19" (que trata de medidas), o código está INCORRETO
- O código correto seria "EF03MA07" (que trata especificamente de multiplicação)

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
            content: 'Você é um especialista em BNCC brasileiro que corrige códigos de habilidades com precisão absoluta. Sempre retorne respostas em JSON válido.'
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

    console.log('📊 Resposta da correção de habilidades:', generatedContent);

    // Parse the JSON response
    let correctionResult: CorrigirHabilidadesResponse;
    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        correctionResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Resposta não contém JSON válido');
      }
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta JSON:', parseError);
      throw new Error('Erro ao processar resposta da correção');
    }

    console.log('✅ Habilidades corrigidas com sucesso:', correctionResult);

    return new Response(JSON.stringify({
      success: true,
      ...correctionResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na correção de habilidades BNCC:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno na correção',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 