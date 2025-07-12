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

    // Call OpenAI API
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
    const structuredContent = parseGeneratedContent(materialType, generatedContent, formData);

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

INSTRUÇÕES CRÍTICAS PARA PROMPTS DE IMAGEM - OTIMIZADOS PARA STABLE DIFFUSION XL:
- Todos os prompts devem ser ULTRA-ESPECÍFICOS, DETALHADOS e CONTEXTUALIZADOS ao tema "${tema}" em ${disciplina}
- Adapte o conteúdo visual à faixa etária de ${serie} - use linguagem visual apropriada para a idade
- Inclua elementos do contexto brasileiro quando relevante (fauna, flora, geografia, cultura brasileira)
- Seja EXTREMAMENTE específico sobre o que deve aparecer na imagem
- Use linguagem visual descritiva rica em detalhes: cores, texturas, composição, estilo artístico
- Especifique elementos concretos: objetos, cenários, pessoas, animais, plantas, elementos geométricos
- NUNCA mencione texto, palavras, letras, números ou símbolos - isso será tratado automaticamente pelo sistema
- Foque em elementos visuais puros: formas, cores, objetos, cenários, composições

ESTRUTURA OBRIGATÓRIA:
- Slide 1: Capa com título e informações básicas
- Slide 2: Objetivos da aula (4 objetivos específicos)
- Slide 3: Introdução ao tema
- Slide 4: Conceito principal
- Slide 5: Desenvolvimento do Conteúdo - Parte 1 (texto explicativo + imagem)
- Slide 6: Desenvolvimento do Conteúdo - Parte 2 (texto explicativo + imagem)
- Slide 7: Desenvolvimento do Conteúdo - Parte 3 (texto explicativo + imagem)
- Slide 8: Desenvolvimento do Conteúdo - Parte 4 (texto explicativo + imagem)
- Slide 9: Exemplo Prático (exemplo concreto do tema + imagem)
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
  "tema_imagem": "Vibrant educational illustration showcasing ${tema} in Brazilian ${disciplina} context for ${serie} students. Rich colorful composition featuring [DESCREVA ESPECIFICAMENTE elementos visuais relacionados ao tema]. Brazilian educational style, high quality artwork, detailed visual elements, bright engaging colors, clean professional design",
  "slide_1_titulo": "${tema}",
  "slide_1_subtitulo": "Aula de ${disciplina} - ${serie}",
  "objetivo_1": "[OBJETIVO 1 específico sobre ${tema}]",
  "objetivo_2": "[OBJETIVO 2 específico sobre ${tema}]",
  "objetivo_3": "[OBJETIVO 3 específico sobre ${tema}]",
  "objetivo_4": "[OBJETIVO 4 específico sobre ${tema}]",
  "introducao_texto": "[INTRODUÇÃO específica sobre ${tema} - explicação clara do que será aprendido]",
  "introducao_imagem": "Colorful introductory illustration about ${tema} in Brazilian ${disciplina} education for ${serie}. Shows [DESCREVA elementos específicos que introduzem o tema visualmente]. Vibrant educational artwork, engaging composition, age-appropriate visual style, Brazilian cultural context",
  "conceitos_texto": "[CONCEITOS fundamentais específicos sobre ${tema} - definição clara e didática]",
  "conceito_principal": "[CONCEITO principal de ${tema} - definição concisa e precisa]",
  "conceitos_imagem": "Educational infographic-style illustration demonstrating key concepts of ${tema} for Brazilian ${disciplina} in ${serie}. Visual representation of [DESCREVA os conceitos específicos visualmente]. Clean infographic design, bright Brazilian educational colors, clear visual hierarchy, engaging layout",
  "desenvolvimento_1_titulo": "[TÍTULO do primeiro aspecto do desenvolvimento de ${tema}]",
  "desenvolvimento_1_texto": "[EXPLICAÇÃO detalhada do primeiro aspecto importante de ${tema} - texto didático e claro]",
  "desenvolvimento_1_imagem": "Detailed educational artwork showing first key aspect of ${tema} in Brazilian ${disciplina} context. Illustrates [DESCREVA especificamente o primeiro aspecto visual com detalhes ricos]. Professional educational illustration, vibrant colors, age-appropriate for ${serie}, Brazilian educational style, high quality composition",
  "desenvolvimento_2_titulo": "[TÍTULO do segundo aspecto do desenvolvimento de ${tema}]",
  "desenvolvimento_2_texto": "[EXPLICAÇÃO detalhada do segundo aspecto importante de ${tema} - texto didático e claro]",
  "desenvolvimento_2_imagem": "Comprehensive visual representation of second aspect of ${tema} in Brazilian ${disciplina} education. Features [DESCREVA especificamente o segundo aspecto com elementos visuais detalhados]. Rich educational artwork, engaging colors, suitable for ${serie} students, Brazilian context, professional quality",
  "desenvolvimento_3_titulo": "[TÍTULO do terceiro aspecto do desenvolvimento de ${tema}]",
  "desenvolvimento_3_texto": "[EXPLICAÇÃO detalhada do terceiro aspecto importante de ${tema} - texto didático e claro]",
  "desenvolvimento_3_imagem": "Educational illustration depicting third important element of ${tema} in Brazilian ${disciplina} curriculum. Showcases [DESCREVA especificamente o terceiro aspecto com detalhes visuais]. Colorful educational design, age-appropriate for ${serie}, Brazilian educational approach, high-quality artwork",
  "desenvolvimento_4_titulo": "[TÍTULO do quarto aspecto do desenvolvimento de ${tema}]",
  "desenvolvimento_4_texto": "[EXPLICAÇÃO detalhada do quarto aspecto importante de ${tema} - texto didático e claro]",
  "desenvolvimento_4_imagem": "Professional educational artwork illustrating fourth key component of ${tema} for Brazilian ${disciplina}. Demonstrates [DESCREVA especificamente o quarto aspecto com elementos visuais ricos]. Vibrant educational illustration, engaging design for ${serie}, Brazilian pedagogical style, detailed composition",
  "exemplo_titulo": "[TÍTULO do exemplo prático de ${tema}]",
  "exemplo_conteudo": "[EXEMPLO PRÁTICO concreto e específico sobre ${tema} - situação real onde o tema se aplica]",
  "exemplo_imagem": "Realistic educational scene showing practical application of ${tema} in Brazilian context for ${disciplina}. Depicts [DESCREVA especificamente o exemplo prático com cenário detalhado]. High-quality realistic illustration, Brazilian setting, educational purpose for ${serie}, engaging visual storytelling, professional artwork",
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

REGRAS FINAIS PARA PROMPTS DE IMAGEM OTIMIZADOS PARA STABLE DIFFUSION XL:
1. Cada prompt deve ser único, específico e ultra-detalhado
2. Use vocabulário visual rico: cores específicas, texturas, composições, estilos artísticos
3. Adapte a complexidade visual à faixa etária de ${serie}
4. Inclua contexto brasileiro quando educacionalmente relevante
5. Seja extremamente específico sobre elementos visuais: objetos, cenários, pessoas, elementos naturais
6. Use descrições que evoquem qualidade artística: "high quality", "professional artwork", "detailed composition"
7. Especifique o estilo educacional brasileiro: "Brazilian educational style", "pedagogical approach"
8. Garanta que cada prompt tenha propósito pedagógico específico e claro

GERE conteúdo REAL e ESPECÍFICO sobre "${tema}". Adapte à faixa etária de ${serie}. Use português brasileiro correto.
`;

    case 'atividade':
      const numQuestoes = formData.numeroQuestoes || formData.quantidadeQuest
