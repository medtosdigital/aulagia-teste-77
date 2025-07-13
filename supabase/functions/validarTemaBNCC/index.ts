
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.30.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function validarTema(tema: string, disciplina: string, serie: string) {
  const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
  if (!REPLICATE_API_TOKEN) {
    console.error('Replicate API key não configurada');
    return {
      alinhado: false,
      mensagem: 'Erro ao validar tema na BNCC: API não configurada.',
      sugestoes: []
    };
  }
  const prompt = `Você é um especialista em educação brasileira e conhece profundamente a BNCC (Base Nacional Comum Curricular).\n\nANÁLISE RIGOROSA E PRECISA: Analise se o tema \"${tema}\" está EXATAMENTE alinhado com a BNCC para a disciplina \"${disciplina}\" na série \"${serie}\".\n\nCONTEXTO ESPECÍFICO:\n- TEMA: ${tema}\n- DISCIPLINA: ${disciplina}\n- SÉRIE/ANO: ${serie}\n\nCRITÉRIOS DE VALIDAÇÃO:\n1. O tema deve corresponder EXATAMENTE às competências e habilidades específicas da BNCC para ${disciplina} na ${serie}\n2. Deve estar adequado ao nível de desenvolvimento cognitivo da faixa etária da ${serie}\n3. Deve seguir a progressão curricular definida pela BNCC para ${disciplina}\n4. O vocabulário, conceitos e complexidade devem ser apropriados para ${serie}\n5. Deve estar presente nas unidades temáticas ou objetos de conhecimento da BNCC para ${disciplina} na ${serie}\n\nREGRAS DE VALIDAÇÃO:\n- Se o tema for muito avançado para ${serie}: NÃO está alinhado\n- Se o tema for muito básico para ${serie}: NÃO está alinhado  \n- Se o tema não aparecer nas competências da BNCC para ${disciplina} na ${serie}: NÃO está alinhado\n- Se houver inadequação de terminologia ou conceitos para ${serie}: NÃO está alinhado\n- Se o tema for muito genérico para ${serie}: NÃO está alinhado\n\nSEJA PRECISO E OBJETIVO. É melhor reprovar um tema inadequado do que aprovar incorretamente.\n\nSe NÃO estiver alinhado, forneça 3 sugestões de temas que sejam PERFEITAMENTE adequados para \"${disciplina}\" na \"${serie}\" segundo a BNCC.\n\nIMPORTANTE: A mensagem explicativa deve ter NO MÁXIMO 3-4 LINHAS, sendo objetiva e direta.\n\nResponda SEMPRE em JSON no formato:\n{\n  \"alinhado\": true/false,\n  \"mensagem\": \"explicação CONCISA e OBJETIVA (máximo 3-4 linhas) sobre por que está ou não alinhado\",\n  \"sugestoes\": [\"sugestão 1 específica\", \"sugestão 2 específica\", \"sugestão 3 específica\"] (apenas se não alinhado)\n}`;
  try {
    console.log('🔍 Validando tema na BNCC:', { tema, disciplina, serie });
    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
    const output = await replicate.run(
      "deepseek-ai/deepseek-v3:8b-instruct",
      {
        input: {
          prompt: prompt,
          temperature: 0.1,
          max_tokens: 600,
          top_p: 0.9,
          top_k: 40,
          repetition_penalty: 1.1,
          stop: ["```", "---", "###"]
        }
      }
    );
    if (!output) {
      console.error('❌ Nenhuma resposta da API Replicate');
      return {
        alinhado: false,
        mensagem: 'Erro ao validar o tema via Replicate. Por segurança, não é possível prosseguir sem validação BNCC.',
        sugestoes: []
      };
    }
    let content = '';
    if (Array.isArray(output)) {
      content = output.join('');
    } else if (typeof output === 'string') {
      content = output;
    } else {
      console.error('❌ Formato de resposta inesperado da Replicate:', output);
      return {
        alinhado: false,
        mensagem: 'Erro ao interpretar resposta da validação BNCC. Por segurança, não é possível prosseguir.',
        sugestoes: []
      };
    }
    console.log('📝 Conteúdo da resposta:', content);
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.substring(7);
    }
    if (content.endsWith('```')) {
      content = content.substring(0, content.length - 3);
    }
    content = content.trim();
    try {
      const result = JSON.parse(content);
      console.log('✅ Resultado parseado:', result);
      return {
        alinhado: Boolean(result.alinhado),
        mensagem: result.mensagem || 'Análise BNCC concluída.',
        sugestoes: Array.isArray(result.sugestoes) ? result.sugestoes : []
      };
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta JSON:', parseError, 'Conteúdo:', content);
      const isAlinhado = content.toLowerCase().includes('alinhado') && 
                        !content.toLowerCase().includes('não alinhado') &&
                        !content.toLowerCase().includes('nao alinhado');
      return {
        alinhado: isAlinhado,
        mensagem: 'Análise BNCC concluída com ressalvas técnicas.',
        sugestoes: []
      };
    }
  } catch (error) {
    console.error('❌ Erro na validação do tema:', error);
    return {
      alinhado: false,
      mensagem: 'Erro interno ao validar o tema na BNCC. Por segurança, não é possível prosseguir sem validação.',
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
