
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const replicateApiKey = Deno.env.get('REPLICATE_API_TOKEN');

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

    if (!replicateApiKey) {
      console.error('❌ Replicate API key not configured');
      return new Response(JSON.stringify({ error: 'Replicate API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Replicate
    const replicate = new Replicate({
      auth: replicateApiKey,
    });

    // Generate the appropriate prompt based on material type
    const prompt = generatePrompt(materialType, formData);
    console.log('🎯 Generated prompt for', materialType);

    // Call Replicate API with DeepSeek-V3 - OPTIMIZED PARAMETERS
    const output = await replicate.run(
      "deepseek-ai/deepseek-v3",
      {
        input: {
          prompt: prompt,
          max_tokens: 3000, // Reduced from 4000 for more concise content
          temperature: 0.1, // Reduced from 0.3 for more precise and assertive content
          top_p: 0.75, // Reduced from 0.85 for more focused responses
          frequency_penalty: 0.2, // Increased from 0.1 to reduce repetition
          presence_penalty: 0.15, // Increased from 0.1 for more diverse vocabulary
        }
      }
    );

    if (!output || (Array.isArray(output) && output.length === 0)) {
      console.error('❌ DeepSeek-V3 returned empty response');
      return new Response(JSON.stringify({ error: 'Failed to generate content' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract the generated content
    const generatedContent = Array.isArray(output) ? output.join('') : output;
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

  // Enhanced system context for Brazilian education with stricter content requirements
  const systemContext = `Você é um especialista em educação brasileira com profundo conhecimento da BNCC (Base Nacional Comum Curricular). Você cria materiais educativos de alta qualidade, pedagogicamente fundamentados e culturalmente relevantes para o contexto brasileiro. Seus materiais são sempre específicos, detalhados, objetivos e adequados à faixa etária. Use português brasileiro correto e linguagem pedagógica apropriada. SEJA CONCISO E ASSERTIVO em todas as seções.`;

  switch (materialType) {
    case 'plano-de-aula':
      return `${systemContext}

TAREFA: Criar um plano de aula COMPLETO, OBJETIVO e ESPECÍFICO sobre "${tema}" para ${disciplina} na ${serie}.

CONTEXTO EDUCACIONAL BRASILEIRO:
- Foco na BNCC e competências específicas da série
- Consideração da realidade sociocultural brasileira
- Metodologias ativas e participativas
- Adaptação ao perfil etário de ${serie}

INSTRUÇÕES CRÍTICAS PARA CONTEÚDO ASSERTIVO:

1. HABILIDADES BNCC - EXTREMAMENTE ESPECÍFICAS:
   - Forneça EXATAMENTE 3 habilidades da BNCC
   - Códigos REAIS e ESPECÍFICOS para ${disciplina} em ${serie}
   - Formato: [{"codigo": "EF[ANO][DISCIPLINA][NUMERO]", "descricao": "descrição detalhada"}]
   - Descrições devem relacionar-se DIRETAMENTE com "${tema}"
   - Use habilidades que realmente existem na BNCC oficial

2. DESENVOLVIMENTO PEDAGÓGICO - CONCISO E OBJETIVO:
   - 4 etapas: Introdução (10-15 min), Desenvolvimento (20-25 min), Prática (15-20 min), Fechamento (5-10 min)
   - Cada etapa com tempo específico, atividade CONCRETA e recursos únicos
   - Máximo 2-3 frases por atividade - seja direto e claro
   - Atividades devem ser específicas para "${tema}", não genéricas

3. CONTEÚDOS PROGRAMÁTICOS - ESPECÍFICOS E DETALHADOS:
   - Mínimo 5 conteúdos programáticos específicos do tema
   - Organize por complexidade crescente
   - Use terminologia técnica adequada à série

4. METODOLOGIA - DETALHADA E ESPECÍFICA:
   - Descreva a metodologia pedagógica específica para o tema
   - Inclua estratégias de ensino, recursos didáticos e formas de interação
   - Justifique as escolhas metodológicas para o tema específico

5. AVALIAÇÃO - CRITÉRIOS CLAROS E OBJETIVOS:
   - Descreva instrumentos específicos de avaliação
   - Inclua critérios claros de avaliação
   - Especifique como será verificada a aprendizagem do tema

6. REFERÊNCIAS - FORMATO ABNT COMPLETO:
   - Mínimo 4 referências em formato ABNT
   - Inclua livros didáticos, artigos acadêmicos e sites oficiais
   - Para sites: incluir data de acesso (formato: "Acesso em: dd mmm. AAAA")
   - Priorize fontes brasileiras e oficiais (MEC, BNCC, etc.)

ESTRUTURA JSON OBRIGATÓRIA:
{
  "titulo": "Plano de Aula - ${tema}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "duracao": "[soma dos tempos das etapas + formato: X minutos (Y aula(s))]",
  "habilidades": [
    {"codigo": "[CÓDIGO BNCC REAL ESPECÍFICO]", "descricao": "[DESCRIÇÃO ESPECÍFICA DO TEMA - máximo 2 linhas]"},
    {"codigo": "[CÓDIGO BNCC REAL ESPECÍFICO]", "descricao": "[DESCRIÇÃO ESPECÍFICA DO TEMA - máximo 2 linhas]"},
    {"codigo": "[CÓDIGO BNCC REAL ESPECÍFICO]", "descricao": "[DESCRIÇÃO ESPECÍFICA DO TEMA - máximo 2 linhas]"}
  ],
  "bncc": ["[CÓDIGO1]", "[CÓDIGO2]", "[CÓDIGO3]"],
  "objetivos": [
    "[OBJETIVO ESPECÍFICO 1 - verbo de ação + conteúdo específico]",
    "[OBJETIVO ESPECÍFICO 2 - verbo de ação + conteúdo específico]",
    "[OBJETIVO ESPECÍFICO 3 - verbo de ação + conteúdo específico]"
  ],
  "desenvolvimento": [
    {"etapa": "Introdução", "tempo": "[10-15 minutos]", "atividade": "[ATIVIDADE ESPECÍFICA CONCISA - máximo 2 frases]", "recursos": "[recursos únicos, separados por vírgula]"},
    {"etapa": "Desenvolvimento", "tempo": "[20-25 minutos]", "atividade": "[ATIVIDADE ESPECÍFICA CONCISA - máximo 2 frases]", "recursos": "[recursos únicos, separados por vírgula]"},
    {"etapa": "Prática", "tempo": "[15-20 minutos]", "atividade": "[ATIVIDADE PRÁTICA ESPECÍFICA CONCISA - máximo 2 frases]", "recursos": "[recursos únicos, separados por vírgula]"},
    {"etapa": "Fechamento", "tempo": "[5-10 minutos]", "atividade": "[ATIVIDADE DE FECHAMENTO ESPECÍFICA CONCISA - máximo 2 frases]", "recursos": "[recursos únicos, separados por vírgula]"}
  ],
  "recursos": "[TODOS os recursos consolidados das etapas]",
  "conteudosProgramaticos": [
    "[CONTEÚDO ESPECÍFICO 1 - terminologia técnica adequada]",
    "[CONTEÚDO ESPECÍFICO 2 - terminologia técnica adequada]",
    "[CONTEÚDO ESPECÍFICO 3 - terminologia técnica adequada]",
    "[CONTEÚDO ESPECÍFICO 4 - terminologia técnica adequada]",
    "[CONTEÚDO ESPECÍFICO 5 - terminologia técnica adequada]"
  ],
  "metodologia": "[METODOLOGIA ESPECÍFICA DETALHADA - estratégias de ensino, recursos didáticos, formas de interação - mínimo 3 frases explicativas]",
  "avaliacao": "[AVALIAÇÃO ESPECÍFICA DETALHADA - instrumentos, critérios, verificação da aprendizagem - mínimo 3 frases explicativas]",
  "referencias": [
    "[REFERÊNCIA 1 - FORMATO ABNT COMPLETO]",
    "[REFERÊNCIA 2 - FORMATO ABNT COMPLETO]",
    "[REFERÊNCIA 3 - FORMATO ABNT COMPLETO]",
    "[REFERÊNCIA 4 - FORMATO ABNT COMPLETO]"
  ]
}

RESPONDA APENAS COM O JSON. Todo conteúdo específico para "${tema}" em contexto brasileiro. SEJA CONCISO E ASSERTIVO.`;

    case 'slides':
      return `${systemContext}

TAREFA: Criar slides educativos ULTRA-ESPECÍFICOS e CONCISOS sobre "${tema}" para ${disciplina} na ${serie}.

CONTEXTO EDUCACIONAL:
- Material visual pedagógico brasileiro
- Adequado à faixa etária de ${serie}
- Prompts de imagem otimizados para DALL-E/Stable Diffusion
- Conteúdo culturalmente relevante
- TEXTOS CONCISOS E OBJETIVOS

INSTRUÇÕES PARA PROMPTS DE IMAGEM:
- ULTRA-ESPECÍFICOS e DETALHADOS sobre "${tema}"
- Incluir contexto brasileiro (fauna, flora, geografia, cultura)
- Linguagem visual apropriada para ${serie}
- Descrever objetos, cenários, cores, texturas, composições
- NUNCA mencionar texto, palavras, números - apenas elementos visuais
- Mínimo 4-5 características visuais específicas por prompt

INSTRUÇÕES PARA CONTEÚDO TEXTUAL:
- Máximo 2-3 frases por seção de conteúdo
- Use bullet points quando apropriado
- Linguagem clara e direta
- Evite redundâncias

ESTRUTURA OBRIGATÓRIA (12 slides):
{
  "titulo": "${tema} - ${disciplina}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "duracao": "[duração adequada]",
  "bncc": "[3 códigos BNCC específicos separados por vírgula]",
  "tema_imagem": "Ultra-detailed Brazilian educational illustration about ${tema} for ${serie} students. [4-5 elementos visuais específicos com cores, texturas, posicionamento detalhados]. Professional Brazilian educational style with vibrant colors and cultural context",
  "slide_1_titulo": "${tema}",
  "slide_1_subtitulo": "${disciplina} - ${serie}",
  "objetivo_1": "[OBJETIVO ESPECÍFICO 1 - máximo 1 linha]",
  "objetivo_2": "[OBJETIVO ESPECÍFICO 2 - máximo 1 linha]",
  "objetivo_3": "[OBJETIVO ESPECÍFICO 3 - máximo 1 linha]",
  "objetivo_4": "[OBJETIVO ESPECÍFICO 4 - máximo 1 linha]",
  "introducao_texto": "[INTRODUÇÃO ESPECÍFICA AO ${tema} - máximo 2 frases]",
  "introducao_imagem": "Captivating Brazilian educational scene introducing ${tema} for ${serie}. [elementos visuais específicos]. Warm Brazilian educational colors, engaging cultural context",
  "conceitos_texto": "[CONCEITOS ESPECÍFICOS DO ${tema} - máximo 2 frases]",
  "conceito_principal": "[CONCEITO CENTRAL DO ${tema} - máximo 1 frase]",
  "conceitos_imagem": "Professional Brazilian infographic showing ${tema} concepts for ${serie}. [elementos específicos]. Clean educational design with Brazilian cultural elements",
  "desenvolvimento_1_titulo": "[ASPECTO 1 DO ${tema}]",
  "desenvolvimento_1_texto": "[EXPLICAÇÃO CONCISA DO ASPECTO 1 - máximo 2 frases]",
  "desenvolvimento_1_imagem": "Detailed Brazilian educational artwork about [aspecto 1] of ${tema}. [4-5 elementos visuais únicos]. High-quality Brazilian educational illustration",
  "desenvolvimento_2_titulo": "[ASPECTO 2 DO ${tema}]",
  "desenvolvimento_2_texto": "[EXPLICAÇÃO CONCISA DO ASPECTO 2 - máximo 2 frases]",
  "desenvolvimento_2_imagem": "Comprehensive Brazilian visual showing [aspecto 2] of ${tema}. [elementos específicos]. Professional Brazilian educational style",
  "desenvolvimento_3_titulo": "[ASPECTO 3 DO ${tema}]",
  "desenvolvimento_3_texto": "[EXPLICAÇÃO CONCISA DO ASPECTO 3 - máximo 2 frases]",
  "desenvolvimento_3_imagem": "Masterful Brazilian educational scene depicting [aspecto 3] of ${tema}. [elementos detalhados]. Vibrant Brazilian cultural context",
  "desenvolvimento_4_titulo": "[ASPECTO 4 DO ${tema}]",
  "desenvolvimento_4_texto": "[EXPLICAÇÃO CONCISA DO ASPECTO 4 - máximo 2 frases]",
  "desenvolvimento_4_imagem": "Ultra-detailed Brazilian educational artwork illustrating [aspecto 4] of ${tema}. [elementos específicos]. Outstanding Brazilian pedagogical design",
  "exemplo_titulo": "[EXEMPLO PRÁTICO DO ${tema}]",
  "exemplo_conteudo": "[EXEMPLO CONCRETO E BRASILEIRO - máximo 2 frases]",
  "exemplo_imagem": "Realistic Brazilian scene showing practical application of ${tema}. [cenário completo brasileiro]. Authentic Brazilian educational context",
  "tabela_titulo": "[TÍTULO DA TABELA SOBRE ${tema}]",
  "coluna_1": "[cabeçalho 1]", "coluna_2": "[cabeçalho 2]", "coluna_3": "[cabeçalho 3]",
  "linha_1_col_1": "[dado 1]", "linha_1_col_2": "[dado 2]", "linha_1_col_3": "[dado 3]",
  "linha_2_col_1": "[dado 1]", "linha_2_col_2": "[dado 2]", "linha_2_col_3": "[dado 3]",
  "linha_3_col_1": "[dado 1]", "linha_3_col_2": "[dado 2]", "linha_3_col_3": "[dado 3]",
  "atividade_pergunta": "[PERGUNTA ESPECÍFICA SOBRE ${tema}]",
  "opcao_a": "[alternativa A]", "opcao_b": "[alternativa B]", "opcao_c": "[alternativa C]", "opcao_d": "[alternativa D]",
  "conclusao_texto": "[SÍNTESE DOS PONTOS PRINCIPAIS - máximo 2 frases]",
  "ponto_chave_1": "[PONTO-CHAVE 1 - máximo 1 linha]", "ponto_chave_2": "[PONTO-CHAVE 2 - máximo 1 linha]",
  "proximo_passo_1": "[PRÓXIMO PASSO 1]", "proximo_passo_2": "[PRÓXIMO PASSO 2]", "proximo_passo_3": "[PRÓXIMO PASSO 3]"
}

RESPONDA APENAS COM O JSON. Todo conteúdo específico para "${tema}" em contexto brasileiro. SEJA CONCISO E DIRETO.`;

    case 'atividade':
      const numQuestoes = formData.numeroQuestoes || formData.quantidadeQuestoes || 10;
      let tiposQuestoes: string[] = [];
      if (formData.tipoQuestoes === 'aberta') {
        tiposQuestoes = ['dissertativa', 'completar', 'desenho'];
      } else if (formData.tipoQuestoes === 'fechada') {
        tiposQuestoes = ['multipla_escolha', 'verdadeiro_falso', 'ligar'];
      } else if (formData.tipoQuestoes === 'mista') {
        tiposQuestoes = ['multipla_escolha', 'verdadeiro_falso', 'ligar', 'completar', 'dissertativa', 'desenho'];
      } else if (formData.tiposQuestoes && Array.isArray(formData.tiposQuestoes)) {
        tiposQuestoes = formData.tiposQuestoes;
      } else {
        tiposQuestoes = ['multipla_escolha', 'verdadeiro_falso', 'completar'];
      }

      return `${systemContext}

TAREFA: Criar ATIVIDADE PRÁTICA CONCISA e OBJETIVA sobre "${tema}" para ${disciplina} na ${serie}.

FOCO: APRENDIZAGEM ATIVA e PARTICIPATIVA (não avaliação formal)
- Processo de descoberta e construção do conhecimento
- Ambiente colaborativo e interativo
- Feedback formativo e construtivo
- Estímulo à participação ativa

CONFIGURAÇÃO:
- Tipos de questões: ${tiposQuestoes.join(', ')}
- Número de questões: ${numQuestoes}
- Contextualização brasileira e cultural

INSTRUÇÕES PARA CONTEÚDO CONCISO:
- Enunciados claros e diretos (máximo 2 frases)
- Instruções simples e objetivas
- Feedback educativo conciso

TIPOS DE QUESTÕES DISPONÍVEIS:
1. "multipla_escolha": 4 alternativas (A,B,C,D) com uma correta
2. "verdadeiro_falso": Afirmação para V ou F
3. "completar": Lacuna com ______
4. "ligar": 4 itens coluna A + 4 itens coluna B
5. "dissertativa": Resposta aberta
6. "desenho": Solicitação de representação visual

ESTRUTURA JSON:
{
  "titulo": "Atividade Prática - ${tema}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "tipo_material": "atividade",
  "duracao": "[duração adequada]",
  "bncc": "[3 códigos BNCC específicos separados por vírgula]",
  "objetivo_geral": "[OBJETIVO DA ATIVIDADE PRÁTICA - máximo 1 frase]",
  "objetivos_especificos": [
    "[OBJETIVO ESPECÍFICO 1 - máximo 1 linha]",
    "[OBJETIVO ESPECÍFICO 2 - máximo 1 linha]",
    "[OBJETIVO ESPECÍFICO 3 - máximo 1 linha]"
  ],
  "introducao": "[INTRODUÇÃO MOTIVADORA - máximo 2 frases]",
  "instrucoes": "[INSTRUÇÕES PASSO A PASSO - máximo 3 frases objetivas]",
  "questoes": [
    ${Array.from({length: numQuestoes}, (_, i) => {
      const tipoIndex = i % tiposQuestoes.length;
      const tipo = tiposQuestoes[tipoIndex];
      return `{
      "numero": ${i + 1},
      "tipo": "${tipo}",
      "enunciado": "[ENUNCIADO ESPECÍFICO SOBRE ${tema} - máximo 2 frases]",
      ${tipo === 'multipla_escolha' ? `"opcoes": ["[ALT A - concisa]", "[ALT B - concisa]", "[ALT C - concisa]", "[ALT D - concisa]"],` : 
        tipo === 'ligar' ? `"coluna_a": ["[ITEM A1]", "[ITEM A2]", "[ITEM A3]", "[ITEM A4]"], "coluna_b": ["[ITEM B1]", "[ITEM B2]", "[ITEM B3]", "[ITEM B4]"],` : 
        `"opcoes": [],`}
      "resposta_correta": "[RESPOSTA OU ORIENTAÇÃO CONCISA]",
      "explicacao": "[FEEDBACK EDUCATIVO CONCISO - máximo 1 frase]",
      "dica_pedagogica": "[DICA PARA PROFESSOR - máximo 1 frase]"
    }`;
    }).join(',\n    ')}
  ],
  "recursos_necessarios": ["[RECURSO 1]", "[RECURSO 2]", "[RECURSO 3]"],
  "metodologia": "[METODOLOGIA DA ATIVIDADE - máximo 2 frases explicativas]",
  "criterios_acompanhamento": [
    "[CRITÉRIO 1 - objetivo e claro]",
    "[CRITÉRIO 2 - objetivo e claro]",
    "[CRITÉRIO 3 - objetivo e claro]"
  ],
  "sugestoes_adaptacao": "[ADAPTAÇÕES PARA DIFERENTES NÍVEIS - máximo 2 frases]",
  "extensao_atividade": "[SUGESTÕES DE EXTENSÃO - máximo 2 frases]",
  "referencias": [
    "[REFERÊNCIA 1 - FORMATO ABNT COMPLETO]",
    "[REFERÊNCIA 2 - FORMATO ABNT COMPLETO]",
    "[REFERÊNCIA 3 - FORMATO ABNT COMPLETO]"
  ]
}

DISTRIBUA os tipos de questões EQUILIBRADAMENTE. RESPONDA APENAS COM JSON. SEJA CONCISO E OBJETIVO.`;

    case 'avaliacao':
      const numQuestoesAval = formData.numeroQuestoes || formData.quantidadeQuestoes || 10;
      let tiposQuestoesAval: string[] = [];
      if (formData.tipoQuestoes === 'aberta') {
        tiposQuestoesAval = ['dissertativa', 'completar', 'desenho'];
      } else if (formData.tipoQuestoes === 'fechada') {
        tiposQuestoesAval = ['multipla_escolha', 'verdadeiro_falso', 'ligar'];
      } else if (formData.tipoQuestoes === 'mista') {
        tiposQuestoesAval = ['multipla_escolha', 'verdadeiro_falso', 'ligar', 'completar', 'dissertativa', 'desenho'];
      } else if (formData.tiposQuestoes && Array.isArray(formData.tiposQuestoes)) {
        tiposQuestoesAval = formData.tiposQuestoes;
      } else {
        tiposQuestoesAval = ['multipla_escolha', 'verdadeiro_falso', 'dissertativa'];
      }

      return `${systemContext}

TAREFA: Criar AVALIAÇÃO FORMAL CONCISA e OBJETIVA sobre "${tema}" para ${disciplina} na ${serie}.

FOCO: VERIFICAÇÃO DE APRENDIZAGEM
- Mensuração objetiva do conhecimento
- Critérios claros de correção
- Instrumentos de medição precisos
- Alinhamento com BNCC

CONFIGURAÇÃO:
- Tipos de questões: ${tiposQuestoesAval.join(', ')}
- Número de questões: ${numQuestoesAval}
- Contexto educacional brasileiro

INSTRUÇÕES PARA CONTEÚDO CONCISO:
- Enunciados claros e diretos
- Critérios de correção objetivos
- Feedback construtivo e específico

ESTRUTURA JSON:
{
  "titulo": "Avaliação - ${tema}",
  "professor": "${professor}",
  "data": "${data}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${tema}",
  "tipo_material": "avaliacao",
  "duracao": "[duração para avaliação]",
  "valor_total": "[PONTUAÇÃO TOTAL]",
  "bncc": "[3 códigos BNCC específicos separados por vírgula]",
  "objetivo_avaliativo": "[OBJETIVO DA AVALIAÇÃO - máximo 1 frase]",
  "competencias_avaliadas": [
    "[COMPETÊNCIA 1 - específica e clara]",
    "[COMPETÊNCIA 2 - específica e clara]",
    "[COMPETÊNCIA 3 - específica e clara]"
  ],
  "instrucoes_gerais": "[INSTRUÇÕES FORMAIS - máximo 3 frases objetivas]",
  "questoes": [
    ${Array.from({length: numQuestoesAval}, (_, i) => {
      const tipoIndex = i % tiposQuestoesAval.length;
      const tipo = tiposQuestoesAval[tipoIndex];
      return `{
      "numero": ${i + 1},
      "tipo": "${tipo}",
      "valor": "[PONTUAÇÃO]",
      "enunciado": "[ENUNCIADO ESPECÍFICO SOBRE ${tema} - máximo 2 frases]",
      ${tipo === 'multipla_escolha' ? `"opcoes": ["[ALT A - concisa]", "[ALT B - concisa]", "[ALT C - concisa]", "[ALT D - concisa]"],` : 
        tipo === 'ligar' ? `"coluna_a": ["[ITEM A1]", "[ITEM A2]", "[ITEM A3]", "[ITEM A4]"], "coluna_b": ["[ITEM B1]", "[ITEM B2]", "[ITEM B3]", "[ITEM B4]"],` : 
        `"opcoes": [],`}
      "resposta_correta": "[RESPOSTA CORRETA ESPECÍFICA]",
      "criterios_correcao": "[CRITÉRIOS DE CORREÇÃO OBJETIVOS - máximo 2 frases]",
      "habilidade_avaliada": "[HABILIDADE BNCC ESPECÍFICA]"
    }`;
    }).join(',\n    ')}
  ],
  "criterios_avaliacao": {
    "excelente": "[CRITÉRIO 90-100% - específico e claro]",
    "bom": "[CRITÉRIO 70-89% - específico e claro]",
    "satisfatorio": "[CRITÉRIO 50-69% - específico e claro]",
    "insuficiente": "[CRITÉRIO 0-49% - específico e claro]"
  },
  "rubrica_avaliacao": [
    {"aspecto": "[ASPECTO 1 ESPECÍFICO]", "criterio": "[CRITÉRIO OBJETIVO]", "pontuacao": "[PONTOS]"},
    {"aspecto": "[ASPECTO 2 ESPECÍFICO]", "criterio": "[CRITÉRIO OBJETIVO]", "pontuacao": "[PONTOS]"},
    {"aspecto": "[ASPECTO 3 ESPECÍFICO]", "criterio": "[CRITÉRIO OBJETIVO]", "pontuacao": "[PONTOS]"}
  ],
  "observacoes_correcao": "[ORIENTAÇÕES DE CORREÇÃO - máximo 2 frases]",
  "feedback_pos_avaliacao": "[ORIENTAÇÕES DE FEEDBACK - máximo 2 frases]",
  "referencias": [
    "[REFERÊNCIA 1 - FORMATO ABNT COMPLETO]",
    "[REFERÊNCIA 2 - FORMATO ABNT COMPLETO]",
    "[REFERÊNCIA 3 - FORMATO ABNT COMPLETO]"
  ]
}

DISTRIBUA os tipos EQUILIBRADAMENTE. RESPONDA APENAS COM JSON. SEJA CONCISO E OBJETIVO.`;

    default:
      return `${systemContext}\n\nCrie um material educativo específico sobre "${tema}" para ${disciplina} na ${serie}, seguindo padrões brasileiros de educação e BNCC. SEJA CONCISO E OBJETIVO.`;
  }
}

function parseGeneratedContent(materialType: string, content: string, formData: MaterialFormData) {
  try {
    // Try to parse as JSON first
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedContent = JSON.parse(jsonMatch[0]);
      
      // --- CORREÇÃO ESPECIAL PARA PLANO DE AULA ---
      if (materialType === 'plano-de-aula') {
        // 1. Garantir que habilidades seja array de objetos com codigo e descricao
        if (Array.isArray(parsedContent.habilidades)) {
          parsedContent.habilidades = parsedContent.habilidades.map((h: any) => {
            if (typeof h === 'object' && h.codigo && h.descricao) {
              return h;
            } else if (typeof h === 'string') {
              // Tentar separar código e descrição se estiver em string
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

        // 2. Garantir que bncc seja array apenas com códigos das habilidades
        parsedContent.bncc = Array.isArray(parsedContent.habilidades)
          ? parsedContent.habilidades.map((h: any) => h.codigo).filter((c: string) => !!c)
          : [];

        // 3. Extrair recursos das etapas e consolidar na seção recursos
        if (parsedContent.desenvolvimento && Array.isArray(parsedContent.desenvolvimento)) {
          const recursosEtapas = new Set<string>();
          
          parsedContent.desenvolvimento.forEach((etapa: any) => {
            if (etapa.recursos && typeof etapa.recursos === 'string') {
              // Dividir recursos por vírgula e limpar espaços
              const recursos = etapa.recursos.split(',').map((r: string) => r.trim()).filter((r: string) => r.length > 0);
              recursos.forEach((recurso: string) => recursosEtapas.add(recurso));
            }
          });

          // Atualizar a seção recursos com todos os recursos das etapas
          parsedContent.recursos = Array.from(recursosEtapas);
        }

        // 4. Calcular duração total baseada nas etapas
        if (parsedContent.desenvolvimento && Array.isArray(parsedContent.desenvolvimento)) {
          let tempoTotal = 0;
          parsedContent.desenvolvimento.forEach((etapa: any) => {
            if (etapa.tempo && typeof etapa.tempo === 'string') {
              const match = etapa.tempo.match(/(\d+)/);
              if (match) {
                tempoTotal += parseInt(match[1]);
              }
            }
          });
          
          if (tempoTotal > 0) {
            parsedContent.duracao = tempoTotal >= 100 
              ? `${Math.ceil(tempoTotal / 50)} aulas (${tempoTotal} minutos)`
              : `${tempoTotal} minutos`;
          }
        }

        // 5. Garantir que referências estejam no formato ABNT
        if (parsedContent.referencias && Array.isArray(parsedContent.referencias)) {
          parsedContent.referencias = parsedContent.referencias.map((ref: string) => {
            // Se não contém data de acesso, adicionar
            if (ref.includes('http') && !ref.includes('Acesso em:')) {
              const hoje = new Date();
              const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
              const dataAcesso = `${hoje.getDate().toString().padStart(2, '0')} ${meses[hoje.getMonth()]}. ${hoje.getFullYear()}`;
              return `${ref}. Acesso em: ${dataAcesso}.`;
            }
            return ref;
          });
        }
      }
      // --- FIM CORREÇÃO PLANO DE AULA ---
      
      // Enhanced parsing for activities and assessments with better question handling
      if (materialType === 'atividade' || materialType === 'avaliacao') {
        if (parsedContent.questoes && Array.isArray(parsedContent.questoes)) {
          parsedContent.questoes = parsedContent.questoes.map((questao: any, index: number) => {
            // Ensure proper question structure
            const pergunta = questao.pergunta || questao.enunciado || `Questão ${index + 1}`;
            const enunciado = questao.enunciado || questao.pergunta || pergunta;
            let processedQuestion: any = {
              numero: questao.numero || (index + 1),
              tipo: questao.tipo || 'multipla_escolha',
              pergunta, // sempre preenchido
              enunciado, // sempre preenchido
              resposta_correta: questao.resposta_correta || '',
              explicacao: questao.explicacao || '',
              dica_pedagogica: questao.dica_pedagogica || '',
              ...(materialType === 'avaliacao' && {
                valor: questao.valor || '1,0 ponto',
                criterios_correcao: questao.criterios_correcao || '',
                habilidade_avaliada: questao.habilidade_avaliada || ''
              })
            };

            switch (processedQuestion.tipo) {
              case 'multipla_escolha':
                processedQuestion.opcoes = Array.isArray(questao.opcoes) && questao.opcoes.length === 4 ? questao.opcoes : [
                  'Alternativa A - aguardando conteúdo',
                  'Alternativa B - aguardando conteúdo',
                  'Alternativa C - aguardando conteúdo',
                  'Alternativa D - aguardando conteúdo'
                ];
                processedQuestion.coluna_a = [];
                processedQuestion.coluna_b = [];
                processedQuestion.colunaA = [];
                processedQuestion.colunaB = [];
                processedQuestion.textoComLacunas = '';
                processedQuestion.linhasResposta = undefined;
                break;
              case 'ligar':
                processedQuestion.coluna_a = Array.isArray(questao.coluna_a) && questao.coluna_a.length === 4 ? questao.coluna_a : ['Item A1', 'Item A2', 'Item A3', 'Item A4'];
                processedQuestion.coluna_b = Array.isArray(questao.coluna_b) && questao.coluna_b.length === 4 ? questao.coluna_b : ['Item B1', 'Item B2', 'Item B3', 'Item B4'];
                processedQuestion.colunaA = processedQuestion.coluna_a;
                processedQuestion.colunaB = processedQuestion.coluna_b;
                processedQuestion.opcoes = [];
                processedQuestion.textoComLacunas = '';
                processedQuestion.linhasResposta = undefined;
                break;
              case 'completar':
                processedQuestion.textoComLacunas = questao.textoComLacunas || '';
                processedQuestion.opcoes = [];
                processedQuestion.coluna_a = [];
                processedQuestion.coluna_b = [];
                processedQuestion.colunaA = [];
                processedQuestion.colunaB = [];
                processedQuestion.linhasResposta = undefined;
                break;
              case 'dissertativa':
              case 'desenho':
                processedQuestion.linhasResposta = questao.linhasResposta || 5;
                processedQuestion.opcoes = [];
                processedQuestion.coluna_a = [];
                processedQuestion.coluna_b = [];
                processedQuestion.colunaA = [];
                processedQuestion.colunaB = [];
                processedQuestion.textoComLacunas = '';
                break;
              case 'verdadeiro_falso':
                processedQuestion.opcoes = ['Verdadeiro', 'Falso'];
                processedQuestion.coluna_a = [];
                processedQuestion.coluna_b = [];
                processedQuestion.colunaA = [];
                processedQuestion.colunaB = [];
                processedQuestion.textoComLacunas = '';
                processedQuestion.linhasResposta = undefined;
                break;
              default:
                // fallback para múltipla escolha
                processedQuestion.opcoes = [
                  'Alternativa A - aguardando conteúdo',
                  'Alternativa B - aguardando conteúdo',
                  'Alternativa C - aguardando conteúdo',
                  'Alternativa D - aguardando conteúdo'
                ];
                processedQuestion.coluna_a = [];
                processedQuestion.coluna_b = [];
                processedQuestion.colunaA = [];
                processedQuestion.colunaB = [];
                processedQuestion.textoComLacunas = '';
                processedQuestion.linhasResposta = undefined;
                break;
            }

            return processedQuestion;
          });
        }

        // Ensure references are in ABNT format for activities and assessments too
        if (parsedContent.referencias && Array.isArray(parsedContent.referencias)) {
          parsedContent.referencias = parsedContent.referencias.map((ref: string) => {
            if (ref.includes('http') && !ref.includes('Acesso em:')) {
              const hoje = new Date();
              const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
              const dataAcesso = `${hoje.getDate().toString().padStart(2, '0')} ${meses[hoje.getMonth()]}. ${hoje.getFullYear()}`;
              return `${ref}. Acesso em: ${dataAcesso}.`;
            }
            return ref;
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
