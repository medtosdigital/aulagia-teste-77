
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BNCCHabilidade {
  codigo: string;
  descricao: string;
  ano: string;
  componente: string;
}

// Cache simples para armazenar dados da BNCC por sessão
const bnccCache = new Map<string, BNCCHabilidade[]>();

async function buscarHabilidadesBNCC(disciplina: string, serie: string): Promise<BNCCHabilidade[]> {
  const cacheKey = `${disciplina}-${serie}`;
  
  // Verificar cache primeiro
  if (bnccCache.has(cacheKey)) {
    console.log('📦 Usando dados do cache para:', cacheKey);
    return bnccCache.get(cacheKey) || [];
  }

  console.log('🔍 Buscando dados da BNCC para:', { disciplina, serie });

  try {
    // Mapear disciplinas para os componentes da BNCC
    const componenteMap: Record<string, string> = {
      'português': 'lingua-portuguesa',
      'portugues': 'lingua-portuguesa',
      'matemática': 'matematica',
      'matematica': 'matematica',
      'história': 'historia',
      'historia': 'historia',
      'geografia': 'geografia',
      'ciências': 'ciencias',
      'ciencias': 'ciencias',
      'educação física': 'educacao-fisica',
      'educacao fisica': 'educacao-fisica',
      'arte': 'arte',
      'inglês': 'lingua-inglesa',
      'ingles': 'lingua-inglesa'
    };

    const componente = componenteMap[disciplina.toLowerCase()] || disciplina.toLowerCase();
    
    // Mapear séries para anos da BNCC
    const anoMap: Record<string, string> = {
      '1º ano': '1-ano',
      '2º ano': '2-ano',
      '3º ano': '3-ano',
      '4º ano': '4-ano',
      '5º ano': '5-ano',
      '6º ano': '6-ano',
      '7º ano': '7-ano',
      '8º ano': '8-ano',
      '9º ano': '9-ano'
    };

    const ano = anoMap[serie] || serie.toLowerCase().replace(/[^0-9]/g, '') + '-ano';

    // Tentar buscar dados da BNCC
    const urls = [
      `https://basenacionalcomum.mec.gov.br/abase/#/fundamental/${componente}/${ano}`,
      `https://basenacionalcomum.mec.gov.br/abase/#/fundamental/${componente}`,
      `https://basenacionalcomum.mec.gov.br/abase/`
    ];

    let habilidades: BNCCHabilidade[] = [];

    for (const url of urls) {
      try {
        console.log('🌐 Tentando buscar:', url);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(10000) // 10 segundos timeout
        });

        if (!response.ok) {
          console.log(`❌ Erro na resposta: ${response.status}`);
          continue;
        }

        const html = await response.text();
        console.log('📄 HTML recebido, tamanho:', html.length);

        // Usar DOMParser para extrair dados
        const doc = new DOMParser().parseFromString(html, 'text/html');
        
        if (!doc) {
          console.log('❌ Erro ao parsear HTML');
          continue;
        }

        // Procurar por códigos de habilidades nos padrões da BNCC
        const codigosEncontrados = html.match(/E[FI]\d{2}[A-Z]{2}\d{2}/g) || [];
        const descricoes = html.match(/(?:E[FI]\d{2}[A-Z]{2}\d{2})[^.]*\.(?:[^.]*\.)*?[^E]*(?=E[FI]|\n|$)/g) || [];

        console.log('🎯 Códigos encontrados:', codigosEncontrados.length);

        if (codigosEncontrados.length > 0) {
          for (let i = 0; i < codigosEncontrados.length; i++) {
            const codigo = codigosEncontrados[i];
            const descricao = descricoes[i] || `Habilidade relacionada ao componente ${disciplina}`;
            
            habilidades.push({
              codigo,
              descricao: descricao.replace(codigo, '').trim(),
              ano: serie,
              componente: disciplina
            });
          }
          break; // Se encontrou dados, não precisa tentar outras URLs
        }

      } catch (error) {
        console.log('❌ Erro ao buscar URL:', url, error.message);
        continue;
      }
    }

    // Se não encontrou dados no site, usar dados de fallback baseados na série/disciplina
    if (habilidades.length === 0) {
      console.log('📋 Usando dados de fallback para:', { disciplina, serie });
      habilidades = gerarHabilidadesFallback(disciplina, serie);
    }

    // Armazenar no cache
    bnccCache.set(cacheKey, habilidades);
    console.log('✅ Dados armazenados no cache:', habilidades.length, 'habilidades');

    return habilidades;

  } catch (error) {
    console.error('❌ Erro geral ao buscar BNCC:', error);
    return gerarHabilidadesFallback(disciplina, serie);
  }
}

function gerarHabilidadesFallback(disciplina: string, serie: string): BNCCHabilidade[] {
  // Dados de fallback baseados na estrutura real da BNCC
  const fallbackData: Record<string, Record<string, BNCCHabilidade[]>> = {
    'português': {
      '1º ano': [
        { codigo: 'EF01LP01', descricao: 'Reconhecer que textos são lidos e escritos da esquerda para a direita e de cima para baixo da página.', ano: '1º ano', componente: 'Língua Portuguesa' },
        { codigo: 'EF01LP02', descricao: 'Escrever, espontaneamente ou por ditado, palavras e frases de forma alfabética.', ano: '1º ano', componente: 'Língua Portuguesa' }
      ],
      '2º ano': [
        { codigo: 'EF02LP01', descricao: 'Utilizar, ao produzir o texto, grafia correta de palavras conhecidas ou com estruturas silábicas já dominadas.', ano: '2º ano', componente: 'Língua Portuguesa' },
        { codigo: 'EF02LP02', descricao: 'Segmentar palavras em sílabas e remover e substituir sílabas iniciais, mediais ou finais para criar novas palavras.', ano: '2º ano', componente: 'Língua Portuguesa' }
      ]
    },
    'matemática': {
      '1º ano': [
        { codigo: 'EF01MA01', descricao: 'Utilizar números naturais como indicador de quantidade ou de ordem em diferentes situações cotidianas.', ano: '1º ano', componente: 'Matemática' },
        { codigo: 'EF01MA02', descricao: 'Contar de maneira exata ou aproximada, utilizando diferentes estratégias.', ano: '1º ano', componente: 'Matemática' }
      ],
      '2º ano': [
        { codigo: 'EF02MA01', descricao: 'Comparar e ordenar números naturais (até a ordem de centenas) pela compreensão de características do sistema de numeração decimal.', ano: '2º ano', componente: 'Matemática' },
        { codigo: 'EF02MA02', descricao: 'Fazer estimativas por meio de estratégias diversas a respeito da quantidade de objetos de coleções.', ano: '2º ano', componente: 'Matemática' }
      ]
    }
  };

  const disciplinaKey = disciplina.toLowerCase();
  return fallbackData[disciplinaKey]?.[serie] || [
    { codigo: 'EF??XX??', descricao: `Habilidade relacionada ao tema proposto para ${disciplina}, ${serie}`, ano: serie, componente: disciplina }
  ];
}

async function validarTemaComIA(tema: string, disciplina: string, serie: string, habilidadesBNCC: BNCCHabilidade[]): Promise<any> {
  if (!openAIApiKey) {
    console.error('OpenAI API key não configurada');
    return {
      alinhado: false,
      mensagem: 'Erro ao validar tema na BNCC: API não configurada.',
      sugestoes: [],
      habilidades: []
    };
  }

  const habilidadesTexto = habilidadesBNCC.map(h => `${h.codigo}: ${h.descricao}`).join('\n');

  const prompt = `Você é um especialista em educação brasileira e conhece profundamente a BNCC (Base Nacional Comum Curricular).

CONTEXTO REAL DA BNCC:
Disciplina: ${disciplina}
Série: ${serie}
Habilidades disponíveis na BNCC para esta série/disciplina:
${habilidadesTexto}

ANÁLISE EXTREMAMENTE RIGOROSA: Analise se o tema "${tema}" está EXATAMENTE alinhado com as habilidades da BNCC listadas acima para "${disciplina}" na série "${serie}".

CRITÉRIOS ULTRA-RIGOROSOS:
1. O tema deve corresponder EXATAMENTE às habilidades específicas listadas acima
2. Deve estar adequado ao nível de desenvolvimento cognitivo da faixa etária
3. Deve seguir a progressão curricular definida pela BNCC
4. O vocabulário, conceitos e complexidade devem ser apropriados para a série

INSTRUÇÕES ESPECÍFICAS:
- Se o tema for muito avançado para a série: NÃO está alinhado
- Se o tema for muito básico para a série: NÃO está alinhado  
- Se o tema não aparecer nas habilidades listadas: NÃO está alinhado
- Se houver inadequação de terminologia ou conceitos: NÃO está alinhado
- Se o tema for muito genérico para a série específica: NÃO está alinhado

SEJA EXTREMAMENTE CRÍTICO. É melhor reprovar um tema limítrofe do que aprovar incorretamente.

Se NÃO estiver alinhado, forneça 3 sugestões de temas que sejam PERFEITAMENTE adequados com base nas habilidades listadas acima.

Se ESTIVER alinhado, indique quais habilidades específicas da lista acima se relacionam com o tema.

IMPORTANTE: A mensagem explicativa deve ter NO MÁXIMO 3-4 LINHAS, sendo objetiva e direta.

Responda SEMPRE em JSON no formato:
{
  "alinhado": true/false,
  "mensagem": "explicação CONCISA e OBJETIVA (máximo 3-4 linhas) sobre por que está ou não alinhado",
  "sugestoes": ["sugestão 1 específica", "sugestão 2 específica", "sugestão 3 específica"] (apenas se não alinhado),
  "habilidades": ["EF??XX??", "EF??XX??"] (códigos das habilidades relacionadas, apenas se alinhado)
}`;

  try {
    console.log('🤖 Validando tema com IA baseado em dados reais da BNCC');
    
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
            content: 'Você é um especialista em educação brasileira e BNCC. Seja EXTREMAMENTE RIGOROSO na análise baseada apenas nas habilidades fornecidas. Sempre responda em português do Brasil e seja preciso e CONCISO na análise da adequação dos temas à BNCC. A mensagem explicativa deve ter NO MÁXIMO 3-4 linhas. É melhor reprovar um tema limítrofe do que aprovar incorretamente.' 
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
        alinhado: false,
        mensagem: `Não foi possível validar o tema via OpenAI. Por segurança, não é possível prosseguir sem validação BNCC.`,
        sugestoes: [],
        habilidades: []
      };
    }

    const data = await response.json();
    console.log('📊 Resposta da OpenAI:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Resposta inválida da OpenAI:', data);
      return {
        alinhado: false,
        mensagem: 'Erro ao interpretar resposta da validação BNCC. Por segurança, não é possível prosseguir.',
        sugestoes: [],
        habilidades: []
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
        sugestoes: Array.isArray(result.sugestoes) ? result.sugestoes : [],
        habilidades: Array.isArray(result.habilidades) ? result.habilidades : []
      };
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta JSON:', parseError, 'Conteúdo:', content);
      return {
        alinhado: false,
        mensagem: 'Erro ao interpretar resposta da validação BNCC. Por segurança, não é possível prosseguir.',
        sugestoes: [],
        habilidades: []
      };
    }
  } catch (error) {
    console.error('❌ Erro na validação do tema:', error);
    return {
      alinhado: false,
      mensagem: 'Erro interno ao validar o tema na BNCC. Por segurança, não é possível prosseguir sem validação.',
      sugestoes: [],
      habilidades: []
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
          sugestoes: [],
          habilidades: []
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Buscar habilidades reais da BNCC
    console.log('🔍 Buscando habilidades da BNCC...');
    const habilidadesBNCC = await buscarHabilidadesBNCC(disciplina, serie);
    console.log('📚 Habilidades encontradas:', habilidadesBNCC.length);

    // Validar tema com base nas habilidades reais
    const resultado = await validarTemaComIA(tema, disciplina, serie, habilidadesBNCC);
    
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
        sugestoes: [],
        habilidades: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
