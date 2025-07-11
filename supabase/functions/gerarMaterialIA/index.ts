
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaterialFormData {
  tema?: string;
  topic?: string;
  disciplina?: string;
  subject?: string;
  serie?: string;
  grade?: string;
  assuntos?: string[];
  subjects?: string[];
  tipoQuestoes?: string;
  tiposQuestoes?: string[];
  numeroQuestoes?: number;
  quantidadeQuestoes?: number;
  professor?: string;
  data?: string;
  duracao?: string;
  bncc?: string;
}

// Função para gerar imagem usando OpenAI
async function gerarImagemOpenAI(prompt: string): Promise<string | null> {
  if (!prompt || prompt.trim() === '' || !openAIApiKey) {
    return null;
  }
  
  try {
    console.log('🎨 Gerando imagem com OpenAI para prompt:', prompt.substring(0, 100) + '...');
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1', // Usar o modelo mais avançado
        prompt: prompt.trim(),
        n: 1,
        size: '1024x1024',
        quality: 'high',
        style: 'natural'
      }),
    });

    if (!response.ok) {
      console.error('❌ Erro na API OpenAI Images:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (data.data && data.data[0] && data.data[0].url) {
      console.log('✅ Imagem gerada com sucesso');
      return data.data[0].url;
    }
    
    console.error('❌ Resposta inválida da API OpenAI Images:', data);
    return null;
  } catch (error) {
    console.error('❌ Erro ao gerar imagem:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialType, formData } = await req.json() as {
      materialType: 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao';
      formData: MaterialFormData;
    };

    console.log('📋 Generating material:', { materialType, formData });

    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate the appropriate prompt based on material type
    const prompt = generatePrompt(materialType, formData);
    console.log('🎯 Generated prompt for', materialType);

    // Call OpenAI API para gerar o conteúdo
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
            content: 'Você é um assistente especializado em criar materiais educacionais seguindo a BNCC. Retorne sempre conteúdo estruturado e pedagógico com base nas diretrizes brasileiras de educação. Seja específico e detalhado em todas as seções, evitando campos vazios ou incompletos. GERE TODO O CONTEÚDO baseado no tema, disciplina e série informados - não use templates genéricos. Use português brasileiro correto, sem erros de gramática ou ortografia.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('❌ OpenAI API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to generate content' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('✅ Content generated successfully');

    // Parse the generated content and structure it appropriately
    let structuredContent = parseGeneratedContent(materialType, generatedContent, formData);

    // Se for slides, gerar as imagens automaticamente
    if (materialType === 'slides' && structuredContent) {
      console.log('🎨 Iniciando geração de imagens para slides...');
      
      // Prompts das imagens baseados nas variáveis do conteúdo gerado
      const imagePrompts: Record<string, string> = {};
      
      if (structuredContent.tema_imagem) {
        imagePrompts.tema_imagem = structuredContent.tema_imagem;
      }
      if (structuredContent.slide_1_imagem) {
        imagePrompts.slide_1_imagem = structuredContent.slide_1_imagem;
      }
      if (structuredContent.introducao_imagem) {
        imagePrompts.introducao_imagem = structuredContent.introducao_imagem;
      }
      if (structuredContent.conceitos_imagem) {
        imagePrompts.conceitos_imagem = structuredContent.conceitos_imagem;
      }
      if (structuredContent.desenvolvimento_1_imagem) {
        imagePrompts.desenvolvimento_1_imagem = structuredContent.desenvolvimento_1_imagem;
      }
      if (structuredContent.desenvolvimento_2_imagem) {
        imagePrompts.desenvolvimento_2_imagem = structuredContent.desenvolvimento_2_imagem;
      }
      if (structuredContent.exemplo_imagem) {
        imagePrompts.exemplo_imagem = structuredContent.exemplo_imagem;
      }

      // Gerar todas as imagens em paralelo
      const imagePromises = Object.entries(imagePrompts).map(async ([key, prompt]) => {
        const imageUrl = await gerarImagemOpenAI(prompt);
        return { key, imageUrl };
      });

      const imageResults = await Promise.all(imagePromises);
      
      // Adicionar URLs das imagens geradas ao conteúdo estruturado
      const imagensGeradas: Record<string, string> = {};
      imageResults.forEach(({ key, imageUrl }) => {
        if (imageUrl) {
          imagensGeradas[key] = imageUrl;
          console.log(`✅ Imagem gerada para ${key}: ${imageUrl.substring(0, 50)}...`);
        } else {
          console.log(`⚠️ Falha ao gerar imagem para ${key}`);
        }
      });

      // Adicionar as URLs das imagens ao conteúdo estruturado
      structuredContent.imagensGeradas = imagensGeradas;
      
      console.log(`🎨 Geração de imagens concluída. ${Object.keys(imagensGeradas).length} imagens geradas.`);
    }

    return new Response(JSON.stringify({
      success: true,
      content: structuredContent,
      materialType,
      formData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in gerarMaterialIA function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePrompt(materialType: string, formData: MaterialFormData): string {
  const tema = formData.tema || formData.topic || '';
  const disciplina = formData.disciplina || formData.subject || '';
  const serie = formData.serie || formData.grade || '';
  const professor = formData.professor || '';
  const data = formData.data || '';
  const duracao = formData.duracao || '';

  switch (materialType) {
    case 'plano-de-aula':
      return `
Você é um professor especialista em planejamento pedagógico de acordo com a BNCC (Base Nacional Comum Curricular).

Crie um plano de aula COMPLETO e DETALHADO com base nas seguintes informações:
- TEMA DA AULA: ${tema}
- DISCIPLINA: ${disciplina}
- SÉRIE/ANO: ${serie}

IMPORTANTE: GERE TODO O CONTEÚDO baseado especificamente no tema "${tema}" para a disciplina de ${disciplina} na série ${serie}. NÃO use conteúdo genérico.

REGRAS CRÍTICAS PARA RECURSOS POR ETAPA:
1. Cada etapa deve ter APENAS de 1 a 3 recursos específicos e únicos
2. NÃO repita recursos entre diferentes etapas - cada recurso deve ser usado apenas uma vez
3. Cada recurso deve ser específico para a atividade daquela etapa
4. Use vírgulas para separar recursos dentro de cada etapa
5. Cada recurso deve ser gramaticalmente correto e específico

EXEMPLO DE RECURSOS CORRETOS:
- Introdução: "Quadro branco, marcadores coloridos"
- Desenvolvimento: "Material manipulativo, experimentos práticos"
- Prática: "Exercícios impressos, jogos educativos"
- Fechamento: "Fichas de avaliação"

Retorne APENAS o JSON estruturado abaixo, preenchido com conteúdo REAL e ESPECÍFICO sobre "${tema}":

{
  "titulo": "Plano de Aula - ${tema}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "duracao": "[GERE uma duração adequada baseada no tema, por exemplo: 50 minutos, 100 minutos (2 aulas), etc]",
  "bncc": "[BUSQUE e RETORNE códigos BNCC REAIS, ESPECÍFICOS e OBRIGATORIAMENTE EXATOS para o tema '${tema}' em ${disciplina} na ${serie}. O código BNCC deve ser SEMPRE o mais aderente e diretamente relacionado ao tema da aula, nunca genérico. Exemplo: Se o tema for 'Geometria', retorne apenas códigos BNCC que tratam de Geometria, como EF03MA17. NÃO retorne códigos de outros temas. Se não souber códigos específicos, deixe vazio.]",
  "objetivos": [
    "[OBJETIVO ESPECÍFICO 1 sobre ${tema}]",
    "[OBJETIVO ESPECÍFICO 2 sobre ${tema}]",
    "[OBJETIVO ESPECÍFICO 3 sobre ${tema}]"
  ],
  "habilidades": [
    "[HABILIDADE ESPECÍFICA 1 que será desenvolvida com ${tema}]",
    "[HABILIDADE ESPECÍFICA 2 que será desenvolvida com ${tema}]",
    "[HABILIDADE ESPECÍFICA 3 que será desenvolvida com ${tema}]"
  ],
  "desenvolvimento": [
    { 
      "etapa": "Introdução", 
      "tempo": "[tempo específico em minutos, ex: 10 minutos]", 
      "atividade": "[ATIVIDADE ESPECÍFICA de introdução ao tema ${tema} - descreva detalhadamente o que será feito]", 
      "recursos": "[1-3 RECURSOS ÚNICOS específicos APENAS para introdução, separados por vírgula. Ex: Quadro branco, marcadores coloridos]" 
    },
    { 
      "etapa": "Desenvolvimento", 
      "tempo": "[tempo específico em minutos, ex: 25 minutos]", 
      "atividade": "[ATIVIDADE ESPECÍFICA de desenvolvimento do tema ${tema} - descreva detalhadamente o que será feito]", 
      "recursos": "[1-3 RECURSOS ÚNICOS específicos APENAS para desenvolvimento, separados por vírgula. Ex: Material manipulativo, experimentos práticos]" 
    },
    { 
      "etapa": "Prática", 
      "tempo": "[tempo específico em minutos, ex: 10 minutos]", 
      "atividade": "[ATIVIDADE PRÁTICA ESPECÍFICA sobre ${tema} - descreva detalhadamente o que será feito]", 
      "recursos": "[1-3 RECURSOS ÚNICOS específicos APENAS para prática, separados por vírgula. Ex: Exercícios impressos, jogos educativos]" 
    },
    { 
      "etapa": "Fechamento", 
      "tempo": "[tempo específico em minutos, ex: 5 minutos]", 
      "atividade": "[ATIVIDADE ESPECÍFICA de fechamento sobre ${tema} - descreva detalhadamente o que será feito]", 
      "recursos": "[1-2 RECURSOS ÚNICOS específicos APENAS para fechamento, separados por vírgula. Ex: Fichas de avaliação]" 
    }
  ],
  "recursos": [
    "[RECURSO 1 específico para ensinar ${tema}]",
    "[RECURSO 2 específico para ensinar ${tema}]",
    "[RECURSO 3 específico para ensinar ${tema}]"
  ],
  "conteudosProgramaticos": [
    "[CONTEÚDO ESPECÍFICO 1 sobre ${tema}]",
    "[CONTEÚDO ESPECÍFICO 2 sobre ${tema}]",
    "[CONTEÚDO ESPECÍFICO 3 sobre ${tema}]"
  ],
  "metodologia": "[METODOLOGIA ESPECÍFICA e detalhada para ensinar ${tema} em ${disciplina} para ${serie} - descreva como será conduzida a aula]",
  "avaliacao": "[MÉTODO DE AVALIAÇÃO específico para verificar aprendizado sobre ${tema} - descreva como será avaliado]",
  "referencias": [
    "[REFERÊNCIA BIBLIOGRÁFICA 1 sobre ${tema} em ${disciplina}]",
    "[REFERÊNCIA BIBLIOGRÁFICA 2 sobre ${tema} em ${disciplina}]"
  ]
}

INSTRUÇÕES FINAIS CRÍTICAS:
1. Cada etapa no "desenvolvimento" deve ter recursos ÚNICOS que não se repetem em outras etapas
2. Use vírgulas para separar recursos dentro da string de cada etapa
3. Mantenha de 1 a 3 recursos por etapa (máximo 3)
4. Os recursos devem ser específicos e apropriados para a atividade daquela etapa
5. Use português brasileiro correto sem erros gramaticais
6. NÃO REPITA recursos entre etapas diferentes
`;

    case 'slides':
      return `
Você é um professor especialista em criação de slides educativos seguindo a BNCC.

Crie slides educativos ESPECÍFICOS sobre "${tema}" para ${disciplina} na ${serie}.

IMPORTANTE: TODO O CONTEÚDO deve ser baseado especificamente no tema "${tema}". NÃO use conteúdo genérico.

IMPORTANTE: Para as páginas 1, 3, 4, 5, 6 e 9, você deve incluir prompts específicos para geração de imagens usando IA.

ESTRUTURA OBRIGATÓRIA:
- Slide 1: Capa com título e informações básicas (COM IMAGEM)
- Slide 2: Objetivos da aula (4 objetivos específicos)
- Slide 3: Introdução ao tema (COM IMAGEM)
- Slide 4: Conceito principal (COM IMAGEM)
- Slide 5: Desenvolvimento do Conteúdo - Parte 1 (COM IMAGEM)
- Slide 6: Desenvolvimento do Conteúdo - Parte 2 (COM IMAGEM)
- Slide 7: Desenvolvimento do Conteúdo - Parte 3
- Slide 8: Desenvolvimento do Conteúdo - Parte 4
- Slide 9: Exemplo Prático (COM IMAGEM)
- Slide 10: Tabela de dados/informações
- Slide 11: Atividade interativa
- Slide 12: Conclusão e próximos passos

Retorne APENAS o JSON estruturado com todas as variáveis preenchidas especificamente sobre "${tema}":

{
  "titulo": "${tema} - ${disciplina}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "duracao": "[duração adequada para apresentar slides sobre ${tema}]",
  "bncc": "[códigos BNCC relevantes para ${tema} em ${disciplina}]",
  "tema_imagem": "Ilustração educativa colorida representando o tema '${tema}' para ${disciplina} na ${serie}, estilo didático, sem texto, apropriada para apresentação escolar",
  "slide_1_titulo": "${tema}",
  "slide_1_subtitulo": "Aula de ${disciplina} - ${serie}",
  "slide_1_imagem": "Ilustração educativa colorida de capa representando o tema '${tema}' para ${disciplina} na ${serie}, estilo didático profissional, sem texto, apropriada para apresentação escolar",
  "objetivo_1": "[OBJETIVO 1 específico sobre ${tema}]",
  "objetivo_2": "[OBJETIVO 2 específico sobre ${tema}]",
  "objetivo_3": "[OBJETIVO 3 específico sobre ${tema}]",
  "objetivo_4": "[OBJETIVO 4 específico sobre ${tema}]",
  "introducao_texto": "[INTRODUÇÃO específica sobre ${tema} - explicação clara do que será aprendido]",
  "introducao_imagem": "Ilustração educativa colorida introduzindo visualmente o conceito de '${tema}' para ${disciplina} na ${serie}, estilo didático, sem texto, apropriada para alunos da faixa etária",
  "conceitos_texto": "[CONCEITOS fundamentais específicos sobre ${tema} - definição clara e didática]",
  "conceito_principal": "[CONCEITO principal de ${tema} - definição concisa e precisa]",
  "conceitos_imagem": "Ilustração educativa colorida demonstrando visualmente os conceitos principais de '${tema}' para ${disciplina} na ${serie}, estilo didático, sem texto, clara e explicativa",
  "desenvolvimento_1_titulo": "[TÍTULO do primeiro aspecto do desenvolvimento de ${tema}]",
  "desenvolvimento_1_texto": "[EXPLICAÇÃO detalhada do primeiro aspecto importante de ${tema} - texto didático e claro]",
  "desenvolvimento_1_imagem": "Ilustração educativa colorida mostrando o primeiro aspecto importante de '${tema}' para ${disciplina} na ${serie}, estilo didático, sem texto, visualmente explicativa",
  "desenvolvimento_2_titulo": "[TÍTULO do segundo aspecto do desenvolvimento de ${tema}]",
  "desenvolvimento_2_texto": "[EXPLICAÇÃO detalhada do segundo aspecto importante de ${tema} - texto didático e claro]",
  "desenvolvimento_2_imagem": "Ilustração educativa colorida demonstrando o segundo aspecto de '${tema}' para ${disciplina} na ${serie}, estilo didático, sem texto, visualmente clara",
  "desenvolvimento_3_titulo": "[TÍTULO do terceiro aspecto do desenvolvimento de ${tema}]",
  "desenvolvimento_3_texto": "[EXPLICAÇÃO detalhada do terceiro aspecto importante de ${tema} - texto didático e claro]",
  "desenvolvimento_3_imagem": "descrição visual clara, educativa, sem texto, ilustrando o terceiro aspecto de '${tema}'",
  "desenvolvimento_4_titulo": "[TÍTULO do quarto aspecto do desenvolvimento de ${tema}]",
  "desenvolvimento_4_texto": "[EXPLICAÇÃO detalhada do quarto aspecto importante de ${tema} - texto didático e claro]",
  "desenvolvimento_4_imagem": "descrição visual clara, educativa, sem texto, ilustrando o quarto aspecto de '${tema}'",
  "exemplo_titulo": "[TÍTULO do exemplo prático de ${tema}]",
  "exemplo_conteudo": "[EXEMPLO PRÁTICO concreto e específico sobre ${tema} - situação real onde o tema se aplica]",
  "exemplo_imagem": "Ilustração educativa colorida mostrando um exemplo prático e concreto de '${tema}' para ${disciplina} na ${serie}, estilo didático, sem texto, situação real e aplicável",
  "tabela_titulo": "[TÍTULO de tabela específica sobre ${tema}]",
  "coluna_1": "[cabeçalho coluna 1 sobre ${tema}]",
  "coluna_2": "[cabeçalho coluna 2 sobre ${tema}]",
  "coluna_3": "[cabeçalho coluna 3 sobre ${tema}]",
  "linha_1_col_1": "[dado específico de ${tema}]",
  "linha_1_col_2": "[dado específico de ${tema}]",
  "linha_1_col_3": "[dado específico de ${tema}]",
  "linha_2_col_1": "[dado específico de ${tema}]",
  "linha_2_col_2": "[dado específico de ${tema}]",
  "linha_2_col_3": "[dado específico de ${tema}]",
  "linha_3_col_1": "[dado específico de ${tema}]",
  "linha_3_col_2": "[dado específico de ${tema}]",
  "linha_3_col_3": "[dado específico de ${tema}]",
  "atividade_pergunta": "[PERGUNTA específica sobre ${tema}]",
  "opcao_a": "[alternativa A sobre ${tema}]",
  "opcao_b": "[alternativa B sobre ${tema}]",
  "opcao_c": "[alternativa C sobre ${tema}]",
  "opcao_d": "[alternativa D sobre ${tema}]",
  "conclusao_texto": "[SÍNTESE dos pontos principais sobre ${tema}]",
  "ponto_chave_1": "[PONTO-CHAVE 1 para memorizar sobre ${tema}]",
  "ponto_chave_2": "[PONTO-CHAVE 2 para memorizar sobre ${tema}]",
  "proximo_passo_1": "[PASSO 1 para continuar estudando ${tema}]",
  "proximo_passo_2": "[PASSO 2 para continuar estudando ${tema}]",
  "proximo_passo_3": "[PASSO 3 para continuar estudando ${tema}]"
}

GERE conteúdo REAL e ESPECÍFICO sobre "${tema}". Adapte à faixa etária de ${serie}. Use português brasileiro correto.
IMPORTANTE: Os campos de imagem (slide_1_imagem, introducao_imagem, conceitos_imagem, desenvolvimento_1_imagem, desenvolvimento_2_imagem, exemplo_imagem) devem conter prompts específicos e detalhados para geração de imagens educativas sobre o tema.
`;

    case 'atividade':
      const numQuestoes = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
      const tipoQuestoes = formData.tipoQuestoes || 'mistas';
      return `
Crie uma atividade educacional ESPECÍFICA sobre "${tema}" para ${disciplina} na ${serie}".

IMPORTANTE: As questões devem ser ESPECÍFICAS sobre "${tema}". NÃO use questões genéricas.

ATENÇÃO: NUNCA retorne o campo "bncc" como {bncc}, {{bncc}}, vazio ou com texto genérico. Se não souber o código exato, deixe o campo vazio.

REGRAS CRÍTICAS PARA QUESTÕES FECHADAS:
- Para questões de múltipla escolha, SEMPRE gere o campo "opcoes" com 5 alternativas reais e específicas (A, B, C, D, E), relacionadas ao enunciado. NÃO gere questões sem alternativas.
- Para questões de ligar, SEMPRE gere os campos "colunaA" e "colunaB" com pelo menos 3 pares de itens relacionados ao tema. NÃO gere questões de ligar sem pares.
- Para questões de verdadeiro/falso, SEMPRE gere o campo "opcoes": ["Verdadeiro", "Falso"].
- Se não conseguir gerar alternativas reais, NÃO gere a questão.

Sempre que a questão (inclusive aberta/dissertativa) fizer referência ou exigir visualização de uma imagem, gráfico, tabela, figura geométrica ou ícone, GERE o campo correspondente de forma SEMÂNTICA e EXATA ao enunciado. Exemplo: se a questão pede para analisar uma célula, gere uma imagem realista de célula; se pede para analisar um gráfico, gere um gráfico relevante ao contexto da pergunta; se pede para observar uma figura geométrica, gere a figura correta.

Campos visuais possíveis:
- "imagem": URL de uma imagem ilustrativa EXATA para a questão (ex: célula, gráfico, figura geométrica, tabela, etc)
- "icones": array de nomes de ícones relevantes
- "grafico": objeto com tipo, labels e dados para um gráfico real
- "figuraGeometrica": tipo e parâmetros de uma figura geométrica real

Esses campos podem aparecer em qualquer tipo de questão, inclusive abertas/dissertativas, sempre que o enunciado exigir ou mencionar o elemento visual.

Exemplo de questão aberta com imagem:
{
  "numero": 2,
  "tipo": "dissertativa",
  "pergunta": "Observe a imagem da célula abaixo e descreva suas principais organelas.",
  "imagem": "https://link-para-imagem-celula-realista.png"
}

Gere questões dos seguintes tipos, alternando entre eles se o tipo for 'mistas':
- "multipla_escolha": sempre use o campo "opcoes" (ex: ["A", "B", "C", "D", "E"]), e adicione imagens ou ícones quando possível
- "ligar": use os campos "colunaA" e "colunaB" (ex: colunaA: ["item1", "item2"], colunaB: ["resp1", "resp2"]), podendo adicionar imagens ou ícones em cada item
- "verdadeiro_falso": use o campo "opcoes" com ["Verdadeiro", "Falso"]
- "completar": use o campo "textoComLacunas" (ex: "O Sol é ___ e a Lua é ___")
- "dissertativa": gere perguntas abertas com espaço para resposta
- "desenho": gere perguntas abertas que peçam para o aluno desenhar ou criar algo visual (ex: "Desenhe um triângulo e pinte seus lados.")

Retorne APENAS o JSON estruturado:

{
  "titulo": "Atividade - ${tema}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "duracao": "[duração adequada para resolver atividade sobre ${tema}]",
  "bncc": "[BUSQUE e RETORNE códigos BNCC REAIS, ESPECÍFICOS e OBRIGATORIAMENTE EXATOS para o tema '${tema}' em ${disciplina} na ${serie}. O código BNCC deve ser SEMPRE o mais aderente e diretamente relacionado ao tema da atividade, nunca genérico. Exemplo: Se o tema for 'Geometria', retorne apenas códigos BNCC que tratam de Geometria, como EF03MA17. NÃO retorne códigos de outros temas. Se não souber códigos específicos, deixe vazio.]",
  "instrucoes": "Complete as questões abaixo sobre ${tema}. Leia atentamente cada enunciado antes de responder.",
  "questoes": [
    ${Array.from({length: numQuestoes}, (_, i) => `{
      "numero": ${i + 1},
      "tipo": "${tipoQuestoes === 'fechadas' ? 'multipla_escolha' : tipoQuestoes === 'abertas' ? 'dissertativa' : tipoQuestoes === 'ligar' ? 'ligar' : tipoQuestoes === 'verdadeiro_falso' ? 'verdadeiro_falso' : tipoQuestoes === 'completar' ? 'completar' : (i % 5 === 0 ? 'multipla_escolha' : i % 5 === 1 ? 'ligar' : i % 5 === 2 ? 'verdadeiro_falso' : i % 5 === 3 ? 'completar' : 'dissertativa')}",
      "pergunta": "[PERGUNTA ${i + 1} específica sobre ${tema}]",
      ${(tipoQuestoes === 'fechadas' || (tipoQuestoes === 'mistas' && i % 5 === 0)) ? `
      "opcoes": [
        "[alternativa A específica sobre ${tema}]",
        "[alternativa B específica sobre ${tema}]",
        "[alternativa C específica sobre ${tema}]",
        "[alternativa D específica sobre ${tema}]",
        "[alternativa E específica sobre ${tema}]"
      ],
      "resposta_correta": 0` : ''}
      ${(tipoQuestoes === 'ligar' || (tipoQuestoes === 'mistas' && i % 5 === 1)) ? `
      "colunaA": [
        "[item 1 de coluna A sobre ${tema}]",
        "[item 2 de coluna A sobre ${tema}]",
        "[item 3 de coluna A sobre ${tema}]"
      ],
      "colunaB": [
        "[item 1 de coluna B correspondente sobre ${tema}]",
        "[item 2 de coluna B correspondente sobre ${tema}]",
        "[item 3 de coluna B correspondente sobre ${tema}]"
      ]` : ''}
      ${(tipoQuestoes === 'verdadeiro_falso' || (tipoQuestoes === 'mistas' && i % 5 === 2)) ? `
      "opcoes": ["Verdadeiro", "Falso"],
      "resposta_correta": 0` : ''}
      ${(tipoQuestoes === 'completar' || (tipoQuestoes === 'mistas' && i % 5 === 3)) ? `
      "textoComLacunas": "[Frase com lacunas sobre ${tema}]"` : ''}
      // dissertativa não precisa de campo extra
    }`).join(',\n    ')}
  ],
  "criterios_avaliacao": [
    "Compreensão dos conceitos sobre ${tema}",
    "Clareza na expressão das ideias sobre ${tema}",
    "Aplicação correta do conhecimento sobre ${tema}"
  ]
}

GERE questões REAIS e ESPECÍFICAS sobre "${tema}". Adeque à ${serie}. Use português brasileiro correto.
`;

    case 'avaliacao':
      const numQuestoesAval = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
      const tipoQuestoesAval = formData.tipoQuestoes || 'mistas';
      const assuntos = formData.assuntos || formData.subjects || [tema];
      return `
Crie uma avaliação educacional ESPECÍFICA sobre "${tema}" e assuntos relacionados: ${assuntos.join(', ')} para ${disciplina} na ${serie}.

IMPORTANTE: As questões devem ser ESPECÍFICAS sobre "${tema}" e os assuntos informados. NÃO use questões genéricas.

Retorne APENAS o JSON estruturado:

{
  "titulo": "Avaliação - ${tema}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${assuntos.join(', ')}",
  "duracao": "[duração adequada para avaliação sobre ${tema}]",
  "bncc": "[códigos BNCC relevantes para ${tema}]",
  "instrucoes": "Responda às questões abaixo sobre ${assuntos.join(', ')}. Esta é uma avaliação formal.",
  "questoes": [
    ${Array.from({length: numQuestoesAval}, (_, i) => `{
      "numero": ${i + 1},
      "tipo": "${tipoQuestoesAval === 'fechadas' ? 'multipla_escolha' : tipoQuestoesAval === 'abertas' ? 'aberta' : (i % 2 === 0 ? 'multipla_escolha' : 'aberta')}",
      "pergunta": "[PERGUNTA ${i + 1} específica sobre ${assuntos[i % assuntos.length]}]",
      ${tipoQuestoesAval === 'fechadas' || (tipoQuestoesAval === 'mistas' && i % 2 === 0) ? `
      "alternativas": [
        "[alternativa A específica sobre ${assuntos[i % assuntos.length]}]",
        "[alternativa B específica sobre ${assuntos[i % assuntos.length]}]",
        "[alternativa C específica sobre ${assuntos[i % assuntos.length]}]",
        "[alternativa D específica sobre ${assuntos[i % assuntos.length]}]"
      ],
      "resposta_correta": 0` : ''}
    }`).join(',\n    ')}
  ],
  "criterios_avaliacao": [
    "Compreensão dos conceitos sobre ${tema} (25%)",
    "Clareza na expressão das ideias (25%)",
    "Aplicação correta do conhecimento sobre ${tema} (50%)"
  ]
}

GERE questões REAIS e ESPECÍFICAS. Use nível apropriado para avaliação formal na ${serie}. Use português brasileiro correto.
`;

    default:
      return `Crie um material educacional ESPECÍFICO sobre "${tema}" para ${disciplina}, série ${serie}. GERE conteúdo REAL baseado no tema informado. Use português brasileiro correto.`;
  }
}

function cleanResourcesForStage(recursos: string): string[] {
  if (!recursos || typeof recursos !== 'string') return [];
  
  return recursos
    .split(',')
    .map(recurso => recurso.trim())
    .filter(recurso => recurso.length > 0)
    .slice(0, 3); // Limita a 3 recursos por etapa
}

function parseGeneratedContent(materialType: string, content: string, formData: MaterialFormData): any {
  const tema = formData.tema || formData.topic || '';
  const disciplina = formData.disciplina || formData.subject || '';
  const serie = formData.serie || formData.grade || '';
  const professor = formData.professor || '';
  const data = formData.data || '';

  try {
    // Try to parse JSON directly from generated content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsedContent = JSON.parse(jsonMatch[0]);
        // Preserve form fields
        parsedContent.professor = professor;
        parsedContent.data = data;
        parsedContent.disciplina = disciplina;
        parsedContent.serie = serie;
        parsedContent.tema = tema;

        // Validação rigorosa do campo BNCC para atividades e planos de aula
        if (parsedContent.bncc) {
          const bncc = parsedContent.bncc.trim();
          if (
            bncc === '' ||
            bncc === '{bncc}' ||
            bncc === '{{bncc}}' ||
            bncc.toLowerCase().includes('busque e retorne códigos bncc') ||
            bncc.toLowerCase().includes('códigos bncc relevantes') ||
            bncc.toLowerCase().includes('exemplo: se o tema for')
          ) {
            parsedContent.bncc = '';
          }
        }

        // Special handling for lesson plans - ensure resources are properly structured per stage
        if (materialType === 'plano-de-aula' && parsedContent.desenvolvimento) {
          console.log('🔧 Processing lesson plan resources by stage');
          // Process each stage to ensure unique and limited resources
          const processedEtapas = parsedContent.desenvolvimento.map((etapa: any, index: number) => {
            if (etapa.recursos && typeof etapa.recursos === 'string') {
              // Clean and limit resources for this specific stage
              const cleanedResources = cleanResourcesForStage(etapa.recursos);
              etapa.recursos = cleanedResources.join(', ');
              console.log(`✅ Stage ${etapa.etapa}: ${cleanedResources.length} resources - ${etapa.recursos}`);
            }
            return etapa;
          });
          parsedContent.desenvolvimento = processedEtapas;
          // Create comprehensive resources list from all stages without duplicates
          const allResources = new Set<string>();
          parsedContent.desenvolvimento.forEach((etapa: any) => {
            if (etapa.recursos && typeof etapa.recursos === 'string') {
              const recursos = etapa.recursos.split(',').map((r: string) => r.trim()).filter((r: string) => r.length > 0);
              recursos.forEach((recurso: string) => allResources.add(recurso));
            }
          });
          // Update main resources list
          parsedContent.recursos = Array.from(allResources);
          console.log(`📋 Total unique resources: ${parsedContent.recursos.length}`);
        }

        // Compatibilidade retroativa: converter 'alternativas' para 'opcoes' em cada questão e garantir campos corretos para todos os tipos
        if (parsedContent.questoes && Array.isArray(parsedContent.questoes)) {
          let tiposPermitidos = formData.tiposQuestoes || [];
          if (!Array.isArray(tiposPermitidos) || tiposPermitidos.length === 0) {
            tiposPermitidos = ['multipla_escolha', 'ligar', 'verdadeiro_falso', 'completar', 'dissertativa', 'desenho'];
          }
          parsedContent.questoes = parsedContent.questoes
            .map((q: any) => {
              // Compatibilidade: mapear 'aberta' para 'dissertativa'
              if (q.tipo === 'aberta') q.tipo = 'dissertativa';
              // Múltipla escolha e verdadeiro/falso
              if (q.alternativas && !q.opcoes) {
                q.opcoes = q.alternativas;
                delete q.alternativas;
              }
              // Verdadeiro/Falso: garantir opcoes
              if (q.tipo === 'verdadeiro_falso' && (!q.opcoes || q.opcoes.length === 0)) {
                q.opcoes = ['Verdadeiro', 'Falso'];
              }
              // Ligar: garantir colunas
              if (q.tipo === 'ligar') {
                q.colunaA = q.colunaA || [];
                q.colunaB = q.colunaB || [];
              }
              // Completar: garantir textoComLacunas
              if (q.tipo === 'completar' && !q.textoComLacunas) {
                q.textoComLacunas = '';
              }
              // Dissertativa: garantir linhasResposta
              if (q.tipo === 'dissertativa' && !q.linhasResposta) {
                q.linhasResposta = 5;
              }
              // Garantir que campos visuais sejam preservados em qualquer tipo
              q.imagem = q.imagem || undefined;
              q.grafico = q.grafico || undefined;
              q.figuraGeometrica = q.figuraGeometrica || undefined;
              q.icones = q.icones || undefined;
              return q;
            })
            .filter((q: any) => {
              // Filtrar apenas tipos permitidos
              if (!tiposPermitidos.includes(q.tipo)) return false;
              // Multipla escolha: precisa de opcoes
              if (q.tipo === 'multipla_escolha' && (!q.opcoes || q.opcoes.length < 4)) return false;
              // Ligar: precisa de colunas
              if (q.tipo === 'ligar' && (!q.colunaA || q.colunaA.length < 2 || !q.colunaB || q.colunaB.length < 2)) return false;
              // Verdadeiro/falso: precisa de opcoes
              if (q.tipo === 'verdadeiro_falso' && (!q.opcoes || q.opcoes.length < 2)) return false;
              // Desenho: não precisa de campo extra
              return true;
            });
        }

        // Após o parse, garantir que tema_imagem sempre exista
        if (materialType === 'slides') {
          if (!parsedContent.tema_imagem || typeof parsedContent.tema_imagem !== 'string' || parsedContent.tema_imagem.trim() === '') {
            parsedContent.tema_imagem = `ilustração colorida, educativa, sem texto, representando o tema '${tema}' para ${disciplina} na ${serie}`;
          }
        }

        console.log('✅ Content parsed successfully:', materialType);
        return parsedContent;
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError);
      }
    }

    // Fallback: basic structure if parsing fails
    console.log('⚠️ Using fallback for basic structure');
    return {
      titulo: `${materialType} - ${tema}`,
      professor,
      data,
      disciplina,
      serie,
      tema,
      duracao: '',
      bncc: '',
      content: content
    };

  } catch (error) {
    console.error('❌ Error in parseGeneratedContent:', error);
    return {
      titulo: `${materialType} - ${tema}`,
      professor,
      data,
      disciplina,
      serie,
      tema,
      duracao: '',
      bncc: '',
      content: content
    };
  }
}

function cleanResourcesForStage(recursos: string): string[] {
  if (!recursos || typeof recursos !== 'string') return [];
  
  return recursos
    .split(',')
    .map(recurso => recurso.trim())
    .filter(recurso => recurso.length > 0)
    .slice(0, 3); // Limita a 3 recursos por etapa
}
