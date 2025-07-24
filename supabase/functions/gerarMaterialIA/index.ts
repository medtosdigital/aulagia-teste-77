
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Templates otimizados para cada tipo de material
const PROMPTS = {
  'plano-de-aula': (dados: any) => `
Você é um especialista em educação brasileira e criação de planos de aula seguindo a BNCC.

Crie um plano de aula COMPLETO e DETALHADO com os seguintes dados:
- Tema: ${dados.tema}
- Disciplina: ${dados.disciplina}
- Série/Ano: ${dados.serie}
- Professor: ${dados.professor}
- Escola: ${dados.escola}
- Duração: ${dados.duracao || '50 minutos'}

RETORNE APENAS UM JSON VÁLIDO com esta estrutura:
{
  "titulo": "Título específico da aula sobre o tema",
  "professor": "${dados.professor}",
  "escola": "${dados.escola}",
  "data": "${new Date().toLocaleDateString('pt-BR')}",
  "disciplina": "${dados.disciplina}",
  "serie": "${dados.serie}",
  "tema": "${dados.tema}",
  "duracao": "${dados.duracao || '50 minutos'}",
  "objetivos": [
    "Objetivo específico 1",
    "Objetivo específico 2", 
    "Objetivo específico 3"
  ],
  "habilidades": [
    "EF01MA01 - Descrição da habilidade BNCC",
    "EF01MA02 - Descrição da habilidade BNCC"
  ],
  "conteudosProgramaticos": [
    "Conteúdo programático 1",
    "Conteúdo programático 2"
  ],
  "desenvolvimento": [
    {
      "etapa": "Introdução",
      "tempo": "10 minutos",
      "atividade": "Atividade de introdução detalhada",
      "recursos": "Quadro, giz, livro didático"
    },
    {
      "etapa": "Desenvolvimento",
      "tempo": "25 minutos", 
      "atividade": "Atividade principal detalhada",
      "recursos": "Material concreto, exercícios"
    },
    {
      "etapa": "Prática",
      "tempo": "10 minutos",
      "atividade": "Atividade prática detalhada",
      "recursos": "Caderno, lápis"
    },
    {
      "etapa": "Fechamento",
      "tempo": "5 minutos",
      "atividade": "Síntese e avaliação",
      "recursos": "Participação oral"
    }
  ],
  "recursos": ["Recurso 1", "Recurso 2", "Recurso 3"],
  "metodologia": "Metodologia ativa detalhada",
  "avaliacao": "Critérios de avaliação específicos",
  "referencias": [
    "SOBRENOME, Nome. Título do livro. Editora, ano.",
    "BRASIL. Base Nacional Comum Curricular. MEC, 2018."
  ]
}`,

  'slides': (dados: any) => `
Você é um especialista em criação de apresentações educacionais.

Crie uma apresentação de slides COMPLETA sobre:
- Tema: ${dados.tema}
- Disciplina: ${dados.disciplina}  
- Série/Ano: ${dados.serie}
- Professor: ${dados.professor}
- Escola: ${dados.escola}

RETORNE APENAS UM JSON VÁLIDO com esta estrutura:
{
  "tema": "${dados.tema}",
  "disciplina": "${dados.disciplina}",
  "serie": "${dados.serie}",
  "professor": "${dados.professor}",
  "escola": "${dados.escola}",
  "objetivos": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
  "introducao": "Introdução clara e envolvente sobre o tema",
  "conceitos": "Explicação dos conceitos fundamentais",
  "desenvolvimento_1": "Primeiro tópico de desenvolvimento",
  "desenvolvimento_2": "Segundo tópico de desenvolvimento", 
  "desenvolvimento_3": "Terceiro tópico de desenvolvimento",
  "desenvolvimento_4": "Quarto tópico de desenvolvimento",
  "exemplo": "Exemplo prático e relevante",
  "atividade": "Atividade interativa para os alunos",
  "resumo": "Resumo dos pontos principais",
  "conclusao": "Conclusão motivadora"
}`,

  'atividade': (dados: any) => `
Você é um especialista em criação de atividades educacionais.

Crie uma atividade educacional sobre:
- Tema: ${dados.tema}
- Disciplina: ${dados.disciplina}
- Série/Ano: ${dados.serie}
- Número de questões: ${dados.numeroQuestoes || 5}
- Tipos de questões: ${dados.tipoQuestoes || 'múltipla escolha, dissertativa'}

RETORNE APENAS UM JSON VÁLIDO com esta estrutura:
{
  "titulo": "Atividade: ${dados.tema}",
  "instrucoes": "Instruções claras para a atividade",
  "questoes": [
    {
      "numero": 1,
      "tipo": "múltipla escolha",
      "pergunta": "Pergunta clara e objetiva",
      "opcoes": ["a) Opção 1", "b) Opção 2", "c) Opção 3", "d) Opção 4"],
      "resposta": "a"
    },
    {
      "numero": 2,
      "tipo": "dissertativa",
      "pergunta": "Pergunta que exige desenvolvimento",
      "linhasResposta": 5
    }
  ]
}`,

  'avaliacao': (dados: any) => `
Você é um especialista em criação de avaliações educacionais.

Crie uma avaliação sobre:
- Tema: ${dados.tema}
- Disciplina: ${dados.disciplina}
- Série/Ano: ${dados.serie}  
- Número de questões: ${dados.numeroQuestoes || 10}
- Tipos de questões: ${dados.tipoQuestoes || 'múltipla escolha, dissertativa'}

RETORNE APENAS UM JSON VÁLIDO com esta estrutura:
{
  "titulo": "Avaliação: ${dados.tema}",
  "instrucoes": "Instruções para a avaliação",
  "tempoLimite": "60 minutos",
  "questoes": [
    {
      "numero": 1,
      "tipo": "múltipla escolha",
      "pergunta": "Pergunta de avaliação",
      "opcoes": ["a) Opção 1", "b) Opção 2", "c) Opção 3", "d) Opção 4"],
      "pontuacao": 2
    },
    {
      "numero": 2,
      "tipo": "dissertativa", 
      "pergunta": "Pergunta dissertativa",
      "pontuacao": 3,
      "linhasResposta": 10
    }
  ]
}`,

  'apoio': (dados: any) => `
Você é um especialista em criação de materiais de apoio educacional.

Crie um material de apoio sobre:
- Tema: ${dados.tema}
- Disciplina: ${dados.disciplina}
- Série/Ano: ${dados.serie}

RETORNE APENAS UM JSON VÁLIDO com esta estrutura:
{
  "titulo": "Material de Apoio: ${dados.tema}",
  "conteudo": "Conteúdo detalhado em HTML com explicações, exemplos e exercícios"
}`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando geração de material...');
    
    const { materialType, formData } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    // Buscar usuário autenticado
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização necessário');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar dados do perfil do usuário
    const { data: perfil } = await supabase
      .from('perfis')
      .select('full_name, escola')
      .eq('user_id', user.id)
      .single();

    // Preparar dados para o prompt
    const dadosCompletos = {
      ...formData,
      professor: perfil?.full_name || formData.professor || 'Professor(a)',
      escola: perfil?.escola || formData.escola || 'Escola'
    };

    console.log('📝 Dados para geração:', dadosCompletos);

    // Gerar prompt específico para o tipo de material
    const prompt = PROMPTS[materialType as keyof typeof PROMPTS]?.(dadosCompletos);
    
    if (!prompt) {
      throw new Error(`Tipo de material não suportado: ${materialType}`);
    }

    console.log('🤖 Chamando OpenAI com modelo gpt-4o...');

    // Chamar OpenAI com parâmetros otimizados para conteúdo pedagógico
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
            content: 'Você é um especialista em educação brasileira. Sempre retorne JSON válido seguindo exatamente a estrutura solicitada.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        temperature: 0.3, // Baixa para respostas mais consistentes
        max_tokens: 4000,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro na API OpenAI: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    let generatedContent = data.choices[0].message.content.trim();
    
    console.log('✅ Conteúdo gerado com sucesso');

    // Limpar e fazer parse do JSON
    generatedContent = generatedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      throw new Error('Conteúdo gerado não é um JSON válido');
    }

    console.log('💾 Salvando material no banco de dados...');

    // Salvar no banco de dados
    const materialData = {
      titulo: parsedContent.titulo || parsedContent.tema || `${materialType} - ${dadosCompletos.tema}`,
      tipo_material: materialType,
      disciplina: dadosCompletos.disciplina || dadosCompletos.subject,
      serie: dadosCompletos.serie || dadosCompletos.grade,
      tema: dadosCompletos.tema || dadosCompletos.topic,
      turma: dadosCompletos.turma,
      conteudo: JSON.stringify(parsedContent),
      user_id: user.id,
      status: 'ativo'
    };

    const { data: savedMaterial, error: saveError } = await supabase
      .from('materiais')
      .insert(materialData)
      .select()
      .single();

    if (saveError) {
      console.error('❌ Erro ao salvar material:', saveError);
      throw new Error('Falha ao salvar material no banco de dados');
    }

    console.log('✅ Material salvo com sucesso:', savedMaterial.id);

    // Incrementar contador de materiais do usuário
    await supabase.rpc('increment_material_usage', { p_user_id: user.id });

    return new Response(JSON.stringify({ 
      success: true, 
      content: parsedContent,
      materialId: savedMaterial.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na geração do material:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
