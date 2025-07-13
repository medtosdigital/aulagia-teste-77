
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const replicateApiKey = Deno.env.get('REPLICATE_API_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function validarTema(tema: string, disciplina: string, serie: string) {
  if (!replicateApiKey) {
    console.error('Replicate API key não configurada');
    return {
      alinhado: false,
      mensagem: 'Erro ao validar tema na BNCC: API não configurada.',
      sugestoes: []
    };
  }

  const prompt = `Você é um especialista em educação brasileira com conhecimento PROFUNDO da BNCC (Base Nacional Comum Curricular). Sua função é realizar análises ULTRA-RIGOROSAS do alinhamento de temas educacionais com a BNCC.

ANÁLISE CRÍTICA E RIGOROSA: Avalie se o tema "${tema}" está EXATAMENTE alinhado com a BNCC para a disciplina "${disciplina}" na série "${serie}".

CONTEXTO EDUCACIONAL BRASILEIRO:
- BNCC estruturada por competências e habilidades específicas
- Progressão curricular por ano/série definida
- Adequação ao desenvolvimento cognitivo da faixa etária
- Terminologia e conceitos apropriados para cada série
- Contextualização cultural e social brasileira

CRITÉRIOS ULTRA-RIGOROSOS DE VALIDAÇÃO:

1. CORRESPONDÊNCIA DIRETA COM BNCC:
   ✓ O tema deve aparecer EXPLICITAMENTE nas competências/habilidades da BNCC
   ✓ Deve ser específico para "${disciplina}" na "${serie}"
   ✓ Códigos de habilidades devem existir e ser aplicáveis

2. ADEQUAÇÃO COGNITIVA E ETÁRIA:
   ✓ Complexidade conceitual apropriada para "${serie}"
   ✓ Vocabulário e linguagem adequados à faixa etária
   ✓ Pré-requisitos cognitivos atendidos

3. PROGRESSÃO CURRICULAR:
   ✓ Respeita a sequência lógica da BNCC
   ✓ Não antecipa conteúdos de séries posteriores
   ✓ Não repete conteúdos já superados em séries anteriores

4. ESPECIFICIDADE E PRECISÃO:
   ✓ Tema não pode ser muito genérico ou amplo demais
   ✓ Deve ter delimitação clara e objetiva
   ✓ Terminologia técnica precisa e apropriada

INSTRUÇÕES CRÍTICAS:
- Se o tema for MUITO AVANÇADO para a série: NÃO ALINHADO
- Se o tema for MUITO BÁSICO para a série: NÃO ALINHADO
- Se o tema NÃO APARECER nas competências BNCC da série: NÃO ALINHADO
- Se houver INADEQUAÇÃO de terminologia: NÃO ALINHADO
- Se o tema for GENÉRICO DEMAIS: NÃO ALINHADO
- Se não houver CÓDIGOS BNCC aplicáveis: NÃO ALINHADO

POSTURA ULTRA-CRÍTICA: É MELHOR REPROVAR um tema limítrofe do que aprovar incorretamente. A qualidade educacional é prioridade absoluta.

SUGESTÕES (se NÃO alinhado):
Forneça 3 temas PERFEITAMENTE adequados para "${disciplina}" na "${serie}" que:
- Estejam EXPLICITAMENTE na BNCC
- Sejam específicos e bem delimitados
- Tenham códigos de habilidades claros
- Sejam culturalmente relevantes para o Brasil

FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
{
  "alinhado": true/false,
  "mensagem": "Análise CONCISA e OBJETIVA (máximo 3-4 linhas) explicando o alinhamento ou desalinhamento com base nos critérios BNCC",
  "sugestoes": ["Tema específico 1 com contexto BNCC", "Tema específico 2 com contexto BNCC", "Tema específico 3 com contexto BNCC"] (apenas se não alinhado)
}

IMPORTANTE: Mensagem deve ser EXTREMAMENTE CONCISA (máximo 3-4 linhas) e TÉCNICA, focando nos aspectos específicos da BNCC.

ANÁLISE DO TEMA: "${tema}" - ${disciplina} - ${serie}`;

  try {
    console.log('🔍 Validando tema na BNCC com DeepSeek-V3:', { tema, disciplina, serie });
    
    // Initialize Replicate
    const replicate = new Replicate({
      auth: replicateApiKey,
    });

    // Call DeepSeek-V3 for BNCC validation
    const output = await replicate.run(
      "deepseek-ai/deepseek-v3",
      {
        input: {
          prompt: prompt,
          max_tokens: 800,
          temperature: 0.1, // Very low temperature for consistent, precise analysis
          top_p: 0.8, // Focused responses
          frequency_penalty: 0.0, // No penalty - we want precise technical language
          presence_penalty: 0.0, // No penalty for repetition of important terms
        }
      }
    );

    if (!output || (Array.isArray(output) && output.length === 0)) {
      console.error('❌ DeepSeek-V3 returned empty response');
      return {
        alinhado: false,
        mensagem: `Não foi possível validar o tema via DeepSeek-V3. Por segurança, não é possível prosseguir sem validação BNCC.`,
        sugestoes: []
      };
    }

    // Extract the content
    const content = Array.isArray(output) ? output.join('') : output;
    console.log('📝 Conteúdo da resposta DeepSeek-V3:', content);

    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ Resultado parseado:', result);
        
        // Garantir que a resposta tenha a estrutura esperada
        return {
          alinhado: Boolean(result.alinhado),
          mensagem: result.mensagem || 'Análise BNCC concluída com DeepSeek-V3.',
          sugestoes: Array.isArray(result.sugestoes) ? result.sugestoes : []
        };
      } else {
        // If no JSON found, try to interpret the response
        console.log('⚠️ Resposta não está em JSON, interpretando...');
        
        // Simple interpretation based on keywords
        const isAligned = content.toLowerCase().includes('alinhado') && 
                         !content.toLowerCase().includes('não alinhado') && 
                         !content.toLowerCase().includes('não está alinhado');
        
        return {
          alinhado: isAligned,
          mensagem: content.substring(0, 200) + '...', // Truncate if too long
          sugestoes: []
        };
      }
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta JSON:', parseError, 'Conteúdo:', content);
      return {
        alinhado: false,
        mensagem: 'Erro ao interpretar resposta da validação BNCC com DeepSeek-V3. Por segurança, não é possível prosseguir.',
        sugestoes: []
      };
    }
  } catch (error) {
    console.error('❌ Erro na validação do tema com DeepSeek-V3:', error);
    return {
      alinhado: false,
      mensagem: 'Erro interno ao validar o tema na BNCC com DeepSeek-V3. Por segurança, não é possível prosseguir sem validação.',
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
    
    console.log('📨 Requisição recebida para validação BNCC:', { tema, disciplina, serie });
    
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
    
    console.log('🎯 Resultado final da validação BNCC:', resultado);
    
    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('❌ Erro ao processar requisição de validação:', error);
    return new Response(
      JSON.stringify({ 
        error: "Erro ao processar requisição", 
        details: error.message,
        alinhado: false,
        mensagem: "Erro interno do servidor. Por segurança, não é possível prosseguir sem validação BNCC.",
        sugestoes: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
