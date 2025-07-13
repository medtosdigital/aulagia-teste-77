
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
  "habilidades": [
    {"codigo": "[CÓDIGO BNCC 1 EXATO, ex: EF03MA19]", "descricao": "[DESCRIÇÃO DA HABILIDADE 1 sobre ${tema} em ${disciplina} na ${serie}]"},
    {"codigo": "[CÓDIGO BNCC 2 EXATO]", "descricao": "[DESCRIÇÃO DA HABILIDADE 2]"},
    {"codigo": "[CÓDIGO BNCC 3 EXATO]", "descricao": "[DESCRIÇÃO DA HABILIDADE 3]"}
  ],
  "bncc": [CÓDIGOS BNCC das habilidades acima, ex: ["EF03MA19", "EF03MA20"]],
  "objetivos": [
    "[OBJETIVO ESPECÍFICO 1 sobre ${tema}]",
    "[OBJETIVO ESPECÍFICO 2 sobre ${tema}]",
    "[OBJETIVO ESPECÍFICO 3 sobre ${tema}]"
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
7. As habilidades devem ser sempre um array de objetos com código e descrição, e os códigos devem ser reais e específicos da BNCC para o tema, disciplina e série.
8. O campo bncc deve ser um array apenas com os códigos das habilidades.
`;

    case 'slides':
      return `
Você é um professor especialista em criação de slides educativos seguindo a BNCC.

Crie slides educativos ESPECÍFICOS sobre "${tema}" para ${disciplina} na ${serie}.

IMPORTANTE: TODO O CONTEÚDO deve ser baseado especificamente no tema "${tema}". NÃO use conteúdo genérico.

INSTRUÇÕES CRÍTICAS PARA PROMPTS DE IMAGEM - OTIMIZADOS PARA OPEN-DALLE v1.1:
- Todos os prompts devem ser ULTRA-ESPECÍFICOS, EXTREMAMENTE DETALHADOS e CONTEXTUALIZADOS ao tema "${tema}" em ${disciplina}
- Adapte o conteúdo visual à faixa etária de ${serie} - use linguagem visual apropriada para a idade
- Inclua elementos do contexto brasileiro quando relevante (fauna, flora, geografia, cultura brasileira)
- Seja EXTREMAMENTE específico sobre o que deve aparecer na imagem - descreva objetos, cenários, cores, composições
- Use linguagem visual descritiva rica em detalhes: cores específicas, texturas detalhadas, composição visual, estilo artístico
- Especifique elementos concretos e tangíveis: objetos físicos, cenários reais, pessoas, animais, plantas, elementos geométricos, equipamentos
- NUNCA mencione texto, palavras, letras, números ou símbolos - isso será tratado automaticamente pelo sistema
- Foque em elementos visuais puros: formas, cores, objetos, cenários, composições, materiais, texturas
- Para cada prompt, imagine que você está descrevendo uma cena para um artista que nunca viu o conceito antes
- Use pelo menos 3-4 características visuais específicas em cada prompt (cor, forma, textura, composição)
- Inclua elementos de profundidade e composição visual (primeiro plano, segundo plano, fundo)

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
  "tema_imagem": "Ultra-detailed vibrant educational illustration showcasing the core concept of ${tema} in Brazilian ${disciplina} context for ${serie} students. Rich colorful composition featuring [DESCREVA ESPECIFICAMENTE 4-5 elementos visuais únicos relacionados ao tema com cores, formas, texturas e posicionamento detalhados]. Professional Brazilian educational artwork with bright engaging colors, clean modern design, high-quality detailed visual elements, perfect lighting and depth",
  "slide_1_titulo": "${tema}",
  "slide_1_subtitulo": "Aula de ${disciplina} - ${serie}",
  "objetivo_1": "[OBJETIVO 1 específico sobre ${tema}]",
  "objetivo_2": "[OBJETIVO 2 específico sobre ${tema}]",
  "objetivo_3": "[OBJETIVO 3 específico sobre ${tema}]",
  "objetivo_4": "[OBJETIVO 4 específico sobre ${tema}]",
  "introducao_texto": "[INTRODUÇÃO específica sobre ${tema} - explicação clara do que será aprendido]",
  "introducao_imagem": "Captivating introductory scene about ${tema} in Brazilian ${disciplina} education for ${serie}. Detailed composition showing [DESCREVA especificamente 3-4 elementos que introduzem o tema visualmente com cores, posições, texturas e materiais]. Warm inviting colors, engaging educational atmosphere, professional artwork with depth and visual interest, modern Brazilian pedagogical style",
  "conceitos_texto": "[CONCEITOS fundamentais específicos sobre ${tema} - definição clara e didática]",
  "conceito_principal": "[CONCEITO principal de ${tema} - definição concisa e precisa]",
  "conceitos_imagem": "Professional educational infographic-style illustration demonstrating key concepts of ${tema} for Brazilian ${disciplina} in ${serie}. Sophisticated visual representation featuring [DESCREVA os conceitos específicos visualmente com objetos concretos, cores vibrantes, formas geométricas, materiais e texturas]. Clean infographic design with bright Brazilian educational colors, clear visual hierarchy, engaging modern layout with excellent contrast and readability",
  "desenvolvimento_1_titulo": "[TÍTULO do primeiro aspecto do desenvolvimento de ${tema}]",
  "desenvolvimento_1_texto": "[EXPLICAÇÃO detalhada do primeiro aspecto importante de ${tema} - texto didático e claro]",
  "desenvolvimento_1_imagem": "Extremely detailed educational artwork showcasing the first critical aspect of ${tema} in Brazilian ${disciplina} context. Rich visual composition illustrating [DESCREVA especificamente o primeiro aspecto com 4-5 elementos visuais únicos: objetos específicos, cenários detalhados, cores precisas, texturas, materiais, posicionamento]. Professional high-quality educational illustration with vibrant colors, perfect for ${serie} students, Brazilian educational excellence, exceptional visual depth and clarity",
  "desenvolvimento_2_titulo": "[TÍTULO do segundo aspecto do desenvolvimento de ${tema}]",
  "desenvolvimento_2_texto": "[EXPLICAÇÃO detalhada do segundo aspecto importante de ${tema} - texto didático e claro]",
  "desenvolvimento_2_imagem": "Comprehensive ultra-detailed visual representation of the second key aspect of ${tema} in Brazilian ${disciplina} education. Sophisticated composition featuring [DESCREVA especificamente o segundo aspecto com elementos visuais únicos: equipamentos, materiais, cenários, pessoas, objetos, cores específicas, texturas, iluminação]. Rich educational artwork with engaging colors, perfectly suited for ${serie} students, Brazilian cultural context, professional quality with outstanding visual appeal",
  "desenvolvimento_3_titulo": "[TÍTULO do terceiro aspecto do desenvolvimento de ${tema}]",
  "desenvolvimento_3_texto": "[EXPLICAÇÃO detalhada do terceiro aspecto importante de ${tema} - texto didático e claro]",
  "desenvolvimento_3_imagem": "Masterful educational illustration depicting the third essential element of ${tema} in Brazilian ${disciplina} curriculum. Detailed visual showcase featuring [DESCREVA especificamente o terceiro aspecto com elementos concretos: objetos físicos, cenários reais, materiais específicos, cores vibrantes, texturas, composição visual]. Colorful educational design perfectly adapted for ${serie}, Brazilian educational methodology, high-quality artistic execution with remarkable detail and visual storytelling",
  "desenvolvimento_4_titulo": "[TÍTULO do quarto aspecto do desenvolvimento de ${tema}]",
  "desenvolvimento_4_texto": "[EXPLICAÇÃO detalhada do quarto aspecto importante de ${tema} - texto didático e claro]",
  "desenvolvimento_4_imagem": "Professional ultra-detailed educational artwork illustrating the fourth key component of ${tema} for Brazilian ${disciplina}. Exceptional visual composition demonstrating [DESCREVA especificamente o quarto aspecto com elementos visuais ricos: materiais didáticos, equipamentos, cenários educacionais, cores específicas, texturas, profundidade visual]. Vibrant educational illustration with outstanding design for ${serie}, Brazilian pedagogical style, detailed artistic composition with perfect educational clarity and visual impact",
  "exemplo_titulo": "[TÍTULO do exemplo prático de ${tema}]",
  "exemplo_conteudo": "[EXEMPLO PRÁTICO concreto e específico sobre ${tema} - situação real onde o tema se aplica]",
  "exemplo_imagem": "Realistic ultra-detailed educational scene showing practical application of ${tema} in authentic Brazilian context for ${disciplina}. Vivid composition depicting [DESCREVA especificamente o exemplo prático com cenário completo: ambiente, pessoas, objetos, ações, materiais, cores, texturas, iluminação natural]. High-quality realistic illustration with Brazilian setting, educational purpose perfectly aligned with ${serie}, engaging visual storytelling, professional artwork with exceptional realism and educational value",
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

REGRAS FINAIS PARA PROMPTS DE IMAGEM OTIMIZADOS PARA OPEN-DALLE v1.1:
1. Cada prompt deve ser único, específico e ULTRA-DETALHADO com pelo menos 4-5 características visuais específicas
2. Use vocabulário visual extremamente rico: cores específicas (azul royal, verde esmeralda), texturas detalhadas (madeira polida, metal brilhante), composições elaboradas, estilos artísticos precisos
3. Adapte a complexidade visual à faixa etária de ${serie} - seja específico sobre elementos apropriados para a idade
4. Inclua contexto brasileiro quando educacionalmente relevante: fauna específica (araras, tucanos), flora (ipês, palmeiras), geografia (cerrado, mata atlântica), elementos culturais
5. Seja extremamente específico sobre elementos visuais: objetos físicos concretos, cenários detalhados, pessoas em ações específicas, elementos naturais precisos
6. Use descrições que evoquem qualidade artística excepcional: "high quality", "professional artwork", "detailed composition", "exceptional visual clarity", "outstanding detail"
7. Especifique o estilo educacional brasileiro: "Brazilian educational excellence", "pedagogical approach", "cultural context"
8. Garanta que cada prompt tenha propósito pedagógico específico e claro, com elementos visuais que apoiem diretamente o aprendizado
9. Inclua elementos de profundidade visual: primeiro plano, segundo plano, fundo, perspectiva, iluminação
10. Descreva materiais e texturas específicas: papel, madeira, metal, tecido, plástico, vidro, pedra, etc.

GERE conteúdo REAL e ESPECÍFICO sobre "${tema}". Adapte à faixa etária de ${serie}. Use português brasileiro correto.
`;

    case 'atividade':
      const numQuestoes = formData.numeroQuestoes || formData.quantidadeQuestoes || 10;
      const tiposQuestoes = formData.tiposQuestoes || (formData.tipoQuestoes ? [formData.tipoQuestoes] : ['multipla-escolha', 'verdadeiro-falso', 'completar-lacunas']);
      
      return `
Você é um professor especialista em criar ATIVIDADES DE APRENDIZAGEM ATIVA seguindo a BNCC.

Crie uma ATIVIDADE EDUCATIVA INTERATIVA sobre "${tema}" para ${disciplina} na ${serie}.

IMPORTANTE: Este é um material de ATIVIDADE PRÁTICA focado em APRENDIZAGEM ATIVA, não uma avaliação formal. 
O objetivo é ENVOLVER os alunos em práticas educativas dinâmicas e participativas sobre "${tema}".

CARACTERÍSTICAS DE UMA ATIVIDADE (não avaliação):
- Foco no PROCESSO DE APRENDIZAGEM, não na verificação
- Exercícios PRÁTICOS e INTERATIVOS
- Ambiente de COLABORAÇÃO e DESCOBERTA
- Feedback FORMATIVO e CONSTRUTIVO
- Estímulo à PARTICIPAÇÃO ATIVA dos estudantes
- Desenvolvimento de HABILIDADES através da prática

TIPOS DE QUESTÕES SOLICITADOS: ${tiposQuestoes.join(', ')}
NÚMERO DE QUESTÕES: ${numQuestoes}

OBRIGATÓRIO - TIPOS DE QUESTÕES DISPONÍVEIS:
1. "multipla_escolha" - 4 alternativas (A, B, C, D) com apenas uma correta
2. "verdadeiro_falso" - Afirmação para marcar V ou F
3. "completar" - Frase com lacuna para completar
4. "ligar" - Conectar itens da coluna A com itens da coluna B
5. "dissertativa" - Pergunta aberta para resposta por extenso
6. "desenho" - Solicita desenho ou esquema como resposta

REGRAS CRÍTICAS PARA GERAÇÃO DAS QUESTÕES:
- Distribua os tipos de questões de forma EQUILIBRADA conforme solicitado
- Para questões "multipla_escolha": sempre 4 alternativas válidas e plausíveis
- Para questões "ligar": forneça exatamente 4 itens na coluna A e 4 na coluna B
- Para questões "completar": deixe uma lacuna clara marcada com ______
- Para questões "verdadeiro_falso": crie afirmações que exijam análise
- Para questões "dissertativa": faça perguntas que promovam reflexão
- Para questões "desenho": solicite representações visuais pedagógicas

Retorne APENAS o JSON estruturado com conteúdo ESPECÍFICO sobre "${tema}":

{
  "titulo": "Atividade Prática - ${tema}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "tipo_material": "atividade",
  "duracao": "[duração adequada para a atividade prática sobre ${tema}]",
  "bncc": "[códigos BNCC específicos para ${tema} em ${disciplina}]",
  "objetivo_geral": "[OBJETIVO EDUCATIVO da atividade prática sobre ${tema} - foco no processo de aprendizagem]",
  "objetivos_especificos": [
    "[OBJETIVO ESPECÍFICO 1 da atividade sobre ${tema}]",
    "[OBJETIVO ESPECÍFICO 2 da atividade sobre ${tema}]",
    "[OBJETIVO ESPECÍFICO 3 da atividade sobre ${tema}]"
  ],
  "introducao": "[INTRODUÇÃO motivadora para a atividade sobre ${tema} - explicar o propósito da prática]",
  "instrucoes": "[INSTRUÇÕES CLARAS de como realizar a atividade sobre ${tema} - passo a passo]",
  "questoes": [
    ${Array.from({length: numQuestoes}, (_, i) => {
      const tipoIndex = i % tiposQuestoes.length;
      const tipo = tiposQuestoes[tipoIndex];
      let tipoFinal = tipo;
      
      // Mapear tipos para os aceitos pelo sistema
      if (tipo === 'multipla-escolha') tipoFinal = 'multipla_escolha';
      if (tipo === 'verdadeiro-falso') tipoFinal = 'verdadeiro_falso';
      if (tipo === 'completar-lacunas') tipoFinal = 'completar';
      
      return `{
      "numero": ${i + 1},
      "tipo": "${tipoFinal}",
      "enunciado": "[ENUNCIADO da questão ${i + 1} sobre ${tema} - adaptado para tipo ${tipoFinal}]",
      ${tipoFinal === 'multipla_escolha' ? `"opcoes": [
        "[ALTERNATIVA A - plausível e relacionada ao tema]",
        "[ALTERNATIVA B - plausível e relacionada ao tema]", 
        "[ALTERNATIVA C - plausível e relacionada ao tema]",
        "[ALTERNATIVA D - plausível e relacionada ao tema]"
      ],` : tipoFinal === 'ligar' ? `"coluna_a": [
        "[ITEM A1 - conceito/termo sobre ${tema}]",
        "[ITEM A2 - conceito/termo sobre ${tema}]",
        "[ITEM A3 - conceito/termo sobre ${tema}]",
        "[ITEM A4 - conceito/termo sobre ${tema}]"
      ],
      "coluna_b": [
        "[ITEM B1 - definição/descrição sobre ${tema}]",
        "[ITEM B2 - definição/descrição sobre ${tema}]",
        "[ITEM B3 - definição/descrição sobre ${tema}]",
        "[ITEM B4 - definição/descrição sobre ${tema}]"
      ],` : `"opcoes": [],`}
      "resposta_correta": "[RESPOSTA CORRETA ou orientação detalhada]",
      "explicacao": "[EXPLICAÇÃO EDUCATIVA sobre ${tema} - feedback formativo]",
      "dica_pedagogica": "[DICA para o professor sobre esta questão]"
    }`;
    }).join(',\n    ')}
  ],
  "recursos_necessarios": [
    "[RECURSO 1 para realizar a atividade sobre ${tema}]",
    "[RECURSO 2 para realizar a atividade sobre ${tema}]",
    "[RECURSO 3 para realizar a atividade sobre ${tema}]"
  ],
  "metodologia": "[METODOLOGIA da atividade - como conduzir a prática sobre ${tema}]",
  "criterios_acompanhamento": [
    "[CRITÉRIO 1 para acompanhar o desenvolvimento dos alunos]",
    "[CRITÉRIO 2 para acompanhar o desenvolvimento dos alunos]",
    "[CRITÉRIO 3 para acompanhar o desenvolvimento dos alunos]"
  ],
  "sugestoes_adaptacao": "[SUGESTÕES para adaptar a atividade a diferentes níveis de aprendizagem]",
  "extensao_atividade": "[SUGESTÕES para estender ou aprofundar a atividade sobre ${tema}]",
  "referencias": [
    "[REFERÊNCIA 1 sobre ${tema} em ${disciplina}]",
    "[REFERÊNCIA 2 sobre ${tema} em ${disciplina}]"
  ]
}

INSTRUÇÕES FINAIS CRÍTICAS:
1. DISTRIBUA os tipos de questões EQUILIBRADAMENTE entre os tipos solicitados
2. Para "multipla_escolha": sempre 4 alternativas válidas e plausíveis
3. Para "ligar": exatamente 4 itens em cada coluna com correspondências claras
4. Para "completar": use lacunas claras marcadas com ______
5. Para "verdadeiro_falso": crie afirmações que exijam análise crítica
6. FOQUE em atividades PRÁTICAS e INTERATIVAS
7. Use linguagem MOTIVADORA e ENVOLVENTE
8. Promova PARTICIPAÇÃO ATIVA dos estudantes
9. Adapte à faixa etária de ${serie}
10. Use português brasileiro correto
`;

    case 'avaliacao':
      const numQuestoesAval = formData.numeroQuestoes || formData.quantidadeQuestoes || 10;
      const tiposQuestoesAval = formData.tiposQuestoes || (formData.tipoQuestoes ? [formData.tipoQuestoes] : ['multipla-escolha', 'verdadeiro-falso', 'dissertativa']);
      
      return `
Você é um professor especialista em criar AVALIAÇÕES FORMAIS seguindo a BNCC.

Crie uma AVALIAÇÃO ESTRUTURADA sobre "${tema}" para ${disciplina} na ${serie}.

IMPORTANTE: Este é um material de AVALIAÇÃO FORMAL focado na VERIFICAÇÃO DE APRENDIZAGEM sobre "${tema}".
O objetivo é MENSURAR o conhecimento adquirido pelos alunos de forma objetiva e criteriosa.

CARACTERÍSTICAS DE UMA AVALIAÇÃO (não atividade):
- Foco na VERIFICAÇÃO DO APRENDIZADO
- Questões OBJETIVAS e MENSURÁVEIS  
- Critérios CLAROS de correção
- Ambiente FORMAL de teste
- Feedback AVALIATIVO e CLASSIFICATÓRIO
- Verificação do DOMÍNIO dos conteúdos
- Instrumentos de MEDIÇÃO do conhecimento

TIPOS DE QUESTÕES SOLICITADOS: ${tiposQuestoesAval.join(', ')}
NÚMERO DE QUESTÕES: ${numQuestoesAval}

OBRIGATÓRIO - TIPOS DE QUESTÕES DISPONÍVEIS:
1. "multipla_escolha" - 4 alternativas (A, B, C, D) com apenas uma correta
2. "verdadeiro_falso" - Afirmação para marcar V ou F
3. "completar" - Frase com lacuna para completar
4. "ligar" - Conectar itens da coluna A com itens da coluna B
5. "dissertativa" - Pergunta aberta para resposta por extenso
6. "desenho" - Solicita desenho ou esquema como resposta

REGRAS CRÍTICAS PARA GERAÇÃO DAS QUESTÕES:
- Distribua os tipos de questões de forma EQUILIBRADA conforme solicitado
- Para questões "multipla_escolha": sempre 4 alternativas válidas e plausíveis
- Para questões "ligar": forneça exatamente 4 itens na coluna A e 4 na coluna B
- Para questões "completar": deixe uma lacuna clara marcada com ______
- Para questões "verdadeiro_falso": crie afirmações que exijam análise
- Para questões "dissertativa": faça perguntas que promovam análise crítica
- Para questões "desenho": solicite representações visuais técnicas

Retorne APENAS o JSON estruturado com conteúdo ESPECÍFICO sobre "${tema}":

{
  "titulo": "Avaliação - ${tema}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "tipo_material": "avaliacao",
  "duracao": "[duração adequada para a avaliação sobre ${tema}]",
  "valor_total": "[PONTUAÇÃO TOTAL da avaliação - ex: 10,0 pontos]",
  "bncc": "[códigos BNCC específicos para ${tema} em ${disciplina}]",
  "objetivo_avaliativo": "[OBJETIVO da avaliação - verificar aprendizagem sobre ${tema}]",
  "competencias_avaliadas": [
    "[COMPETÊNCIA 1 avaliada sobre ${tema}]",
    "[COMPETÊNCIA 2 avaliada sobre ${tema}]",
    "[COMPETÊNCIA 3 avaliada sobre ${tema}]"
  ],
  "instrucoes_gerais": "[INSTRUÇÕES FORMAIS para realização da avaliação sobre ${tema}]",
  "questoes": [
    ${Array.from({length: numQuestoesAval}, (_, i) => {
      const tipoIndex = i % tiposQuestoesAval.length;
      const tipo = tiposQuestoesAval[tipoIndex];
      let tipoFinal = tipo;
      
      // Mapear tipos para os aceitos pelo sistema
      if (tipo === 'multipla-escolha') tipoFinal = 'multipla_escolha';
      if (tipo === 'verdadeiro-falso') tipoFinal = 'verdadeiro_falso';
      if (tipo === 'completar-lacunas') tipoFinal = 'completar';
      
      return `{
      "numero": ${i + 1},
      "tipo": "${tipoFinal}",
      "valor": "[PONTUAÇÃO da questão ${i + 1} - ex: 1,0 ponto]",
      "enunciado": "[ENUNCIADO da questão ${i + 1} sobre ${tema} - claro e objetivo para tipo ${tipoFinal}]",
      ${tipoFinal === 'multipla_escolha' ? `"opcoes": [
        "[ALTERNATIVA A - tecnicamente correta ou incorreta]",
        "[ALTERNATIVA B - tecnicamente correta ou incorreta]", 
        "[ALTERNATIVA C - tecnicamente correta ou incorreta]",
        "[ALTERNATIVA D - tecnicamente correta ou incorreta]"
      ],` : tipoFinal === 'ligar' ? `"coluna_a": [
        "[ITEM A1 - conceito/termo sobre ${tema}]",
        "[ITEM A2 - conceito/termo sobre ${tema}]",
        "[ITEM A3 - conceito/termo sobre ${tema}]",
        "[ITEM A4 - conceito/termo sobre ${tema}]"
      ],
      "coluna_b": [
        "[ITEM B1 - definição/descrição sobre ${tema}]",
        "[ITEM B2 - definição/descrição sobre ${tema}]",
        "[ITEM B3 - definição/descrição sobre ${tema}]",
        "[ITEM B4 - definição/descrição sobre ${tema}]"
      ],` : `"opcoes": [],`}
      "resposta_correta": "[RESPOSTA CORRETA]",
      "criterios_correcao": "[CRITÉRIOS para correção desta questão]",
      "habilidade_avaliada": "[HABILIDADE BNCC avaliada nesta questão]"
    }`;
    }).join(',\n    ')}
  ],
  "criterios_avaliacao": {
    "excelente": "[CRITÉRIO para conceito EXCELENTE (90-100%)]",
    "bom": "[CRITÉRIO para conceito BOM (70-89%)]",
    "satisfatorio": "[CRITÉRIO para conceito SATISFATÓRIO (50-69%)]",
    "insuficiente": "[CRITÉRIO para conceito INSUFICIENTE (0-49%)]"
  },
  "rubrica_avaliacao": [
    {
      "aspecto": "[ASPECTO 1 avaliado sobre ${tema}]",
      "criterio": "[CRITÉRIO de avaliação para este aspecto]",
      "pontuacao": "[PONTUAÇÃO para este aspecto]"
    },
    {
      "aspecto": "[ASPECTO 2 avaliado sobre ${tema}]", 
      "criterio": "[CRITÉRIO de avaliação para este aspecto]",
      "pontuacao": "[PONTUAÇÃO para este aspecto]"
    },
    {
      "aspecto": "[ASPECTO 3 avaliado sobre ${tema}]",
      "criterio": "[CRITÉRIO de avaliação para este aspecto]", 
      "pontuacao": "[PONTUAÇÃO para este aspecto]"
    }
  ],
  "observacoes_correcao": "[ORIENTAÇÕES para correção da avaliação sobre ${tema}]",
  "feedback_pos_avaliacao": "[ORIENTAÇÕES para feedback após correção]",
  "referencias": [
    "[REFERÊNCIA 1 sobre ${tema} em ${disciplina}]",
    "[REFERÊNCIA 2 sobre ${tema} em ${disciplina}]"
  ]
}

INSTRUÇÕES FINAIS CRÍTICAS:
1. DISTRIBUA os tipos de questões EQUILIBRADAMENTE entre os tipos solicitados
2. Para "multipla_escolha": sempre 4 alternativas válidas e plausíveis
3. Para "ligar": exatamente 4 itens em cada coluna com correspondências verificáveis
4. Para "completar": use lacunas claras marcadas com ______
5. Para "verdadeiro_falso": crie afirmações que exijam conhecimento específico
6. FOQUE na VERIFICAÇÃO OBJETIVA do aprendizado
7. Use linguagem FORMAL e CLARA
8. Estabeleça CRITÉRIOS MENSURÁVEIS de avaliação
9. Inclua RUBRICAS E PONTUAÇÕES específicas
10. Adapte à faixa etária de ${serie}
11. Use português brasileiro correto
`;

    default:
      return `Gere um material educativo sobre ${tema} para ${disciplina} na ${serie}.`;
  }
}

function parseGeneratedContent(materialType: string, content: string, formData: MaterialFormData) {
  try {
    // Try to parse as JSON first
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedContent = JSON.parse(jsonMatch[0]);
      // --- AJUSTE HABILIDADES E BNCC PARA PLANO DE AULA ---
      if (materialType === 'plano-de-aula') {
        // Garante que habilidades seja array de objetos {codigo, descricao}
        if (Array.isArray(parsedContent.habilidades)) {
          parsedContent.habilidades = parsedContent.habilidades.map((h: any) => {
            if (typeof h === 'object' && h.codigo && h.descricao) {
              return h;
            } else if (typeof h === 'string') {
              // Tenta separar código e descrição
              const match = h.match(/([A-Z]{2}\d{2}[A-Z]{2}\d{2,})\s*[-:]?\s*(.*)/);
              if (match) {
                return { codigo: match[1], descricao: match[2] };
              }
              return { codigo: '', descricao: h };
            }
            return { codigo: '', descricao: '' };
          });
        } else {
          parsedContent.habilidades = [];
        }
        // Garante que bncc seja array apenas com os códigos das habilidades
        parsedContent.bncc = Array.isArray(parsedContent.habilidades)
          ? parsedContent.habilidades.map((h: any) => h.codigo).filter((c: string) => !!c)
          : [];
      }
      // --- FIM AJUSTE ---
      // Enhanced parsing for activities and assessments with better question handling
      if (materialType === 'atividade' || materialType === 'avaliacao') {
        if (parsedContent.questoes && Array.isArray(parsedContent.questoes)) {
          parsedContent.questoes = parsedContent.questoes.map((questao: any, index: number) => {
            // Ensure proper question structure
            const processedQuestion = {
              numero: questao.numero || (index + 1),
              tipo: questao.tipo || 'multipla_escolha',
              enunciado: questao.enunciado || '',
              opcoes: questao.opcoes || [],
              coluna_a: questao.coluna_a || [],
              coluna_b: questao.coluna_b || [],
              resposta_correta: questao.resposta_correta || '',
              explicacao: questao.explicacao || '',
              dica_pedagogica: questao.dica_pedagogica || '',
              ...(materialType === 'avaliacao' && {
                valor: questao.valor || '1,0 ponto',
                criterios_correcao: questao.criterios_correcao || '',
                habilidade_avaliada: questao.habilidade_avaliada || ''
              })
            };

            // Validate question types and structure
            switch (processedQuestion.tipo) {
              case 'multipla_escolha':
                if (!Array.isArray(processedQuestion.opcoes) || processedQuestion.opcoes.length !== 4) {
                  processedQuestion.opcoes = [
                    'Alternativa A - aguardando conteúdo',
                    'Alternativa B - aguardando conteúdo', 
                    'Alternativa C - aguardando conteúdo',
                    'Alternativa D - aguardando conteúdo'
                  ];
                }
                break;
              case 'ligar':
                if (!Array.isArray(processedQuestion.coluna_a) || processedQuestion.coluna_a.length !== 4) {
                  processedQuestion.coluna_a = ['Item A1', 'Item A2', 'Item A3', 'Item A4'];
                }
                if (!Array.isArray(processedQuestion.coluna_b) || processedQuestion.coluna_b.length !== 4) {
                  processedQuestion.coluna_b = ['Item B1', 'Item B2', 'Item B3', 'Item B4'];
                }
                processedQuestion.opcoes = []; // Clear opcoes for matching questions
                break;
              case 'verdadeiro_falso':
              case 'completar':
              case 'dissertativa':
              case 'desenho':
                processedQuestion.opcoes = []; // Clear opcoes for these types
                break;
            }

            return processedQuestion;
          });
        }
      }
      
      return parsedContent;
    }
    
    // If not JSON, return structured content based on material type
    return {
      titulo: `${materialType.charAt(0).toUpperCase() + materialType.slice(1)} - ${formData.tema || formData.topic || 'Material Educativo'}`,
      conteudo: content,
      tipo_material: materialType,
      disciplina: formData.disciplina || formData.subject,
      serie: formData.serie || formData.grade,
      tema: formData.tema || formData.topic,
      professor: formData.professor || '',
      data: formData.data || new Date().toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error parsing generated content:', error);
    
    // Return basic structure if parsing fails
    return {
      titulo: `${materialType.charAt(0).toUpperCase() + materialType.slice(1)} - ${formData.tema || formData.topic || 'Material Educativo'}`,
      conteudo: content,
      tipo_material: materialType,
      disciplina: formData.disciplina || formData.subject,
      serie: formData.serie || formData.grade,
      tema: formData.tema || formData.topic,
      professor: formData.professor || '',
      data: formData.data || new Date().toISOString().split('T')[0],
      erro: 'Conteúdo gerado mas não foi possível estruturar completamente'
    };
  }
}
