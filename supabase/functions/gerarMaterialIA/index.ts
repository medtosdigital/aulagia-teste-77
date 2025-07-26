
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

// Função para gerar imagem via edge function gerarImagemIA
async function generateImage(prompt: string, imageType: string): Promise<string> {
  try {
    console.log(`🎨 [IMAGEM-${imageType.toUpperCase()}] Iniciando geração com prompt:`, prompt);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/gerarImagemIA`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    if (!response.ok) {
      console.error(`❌ [IMAGEM-${imageType.toUpperCase()}] Erro HTTP:`, response.status, response.statusText);
      throw new Error(`Falha na geração de imagem ${imageType}: HTTP ${response.status}`);
    }

    const result = await response.json();
    if (result.success && result.imageUrl) {
      console.log(`✅ [IMAGEM-${imageType.toUpperCase()}] Geração concluída com sucesso`);
      return result.imageUrl;
    } else {
      console.error(`❌ [IMAGEM-${imageType.toUpperCase()}] Falha na resposta:`, result.error);
      throw new Error(`Erro na geração de ${imageType}: ${result.error}`);
    }
  } catch (error) {
    console.error(`❌ [IMAGEM-${imageType.toUpperCase()}] Erro durante geração:`, error);
    throw error;
  }
}

serve(async (req) => {
  const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const startTime = new Date().toISOString();
  console.log(`[MATERIAL-LOG] [${startTime}] [${requestId}] INICIO | Tipo: gerarMaterialIA`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialType, formData } = await req.json();
    
    // PONTO CRÍTICO: Capturar o tema EXATO fornecido pelo usuário
    const temaOriginalUsuario = formData.tema || formData.topic || '';
    console.log(`[MATERIAL-LOG] [${requestId}] TEMA_ORIGINAL_USUARIO: "${temaOriginalUsuario}"`);
    
    if (!temaOriginalUsuario.trim()) {
      throw new Error('Tema não fornecido no formData');
    }

    console.log(`[MATERIAL-LOG] [${requestId}] RECEBIDO | Tipo: ${materialType} | Tema: "${temaOriginalUsuario}"`);
    console.log('🟢 [INÍCIO] Requisição recebida para geração de material.');
    console.log(`📥 [DADOS] Tipo de material: ${materialType}`);
    console.log(`📥 [DADOS] Tema EXATO do usuário: "${temaOriginalUsuario}"`);
    console.log(`📥 [DADOS] Disciplina: ${formData.disciplina || formData.subject || ''}`);
    console.log(`📥 [DADOS] Série: ${formData.serie || formData.grade || ''}`);

    if (!openAIApiKey) {
      console.error('❌ [ERRO] OpenAI API key não configurada');
      throw new Error('OpenAI API key not configured');
    }

    const disciplina = formData.disciplina || formData.subject || '';
    const serie = formData.serie || formData.grade || '';

    let prompt = '';
    let systemMessage = '';

    // CONFIGURAR PROMPTS ULTRA-ESPECÍFICOS
    console.log('📝 [ETAPA-1] Configurando prompts ultra-específicos...');

    if (materialType === 'slides') {
      systemMessage = `Você é um especialista em criação de slides educacionais.

REGRA OBRIGATÓRIA CRÍTICA:
- O campo 'tema' do JSON DEVE ser EXATAMENTE: "${temaOriginalUsuario}"
- NUNCA altere, reescreva ou modifique o tema fornecido
- COPIE EXATAMENTE o tema como fornecido: "${temaOriginalUsuario}"

ESTRUTURA JSON OBRIGATÓRIA:
{
  "tema": "${temaOriginalUsuario}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "professor": "${formData.professor || 'Professor(a)'}",
  "objetivos": ["objetivo sobre ${temaOriginalUsuario}"],
  "introducao": "Introdução sobre ${temaOriginalUsuario}",
  "conceitos": "Conceitos de ${temaOriginalUsuario}",
  "desenvolvimento_1": "Primeiro aspecto de ${temaOriginalUsuario}",
  "desenvolvimento_2": "Segundo aspecto de ${temaOriginalUsuario}",
  "desenvolvimento_3": "Terceiro aspecto de ${temaOriginalUsuario}",
  "desenvolvimento_4": "Quarto aspecto de ${temaOriginalUsuario}",
  "exemplo": "Exemplo de ${temaOriginalUsuario}",
  "atividade": "Atividade sobre ${temaOriginalUsuario}",
  "resumo": "Resumo de ${temaOriginalUsuario}",
  "conclusao": "Conclusão sobre ${temaOriginalUsuario}",
  "tema_imagem_prompt": "Ilustração educativa sobre ${temaOriginalUsuario}",
  "introducao_imagem_prompt": "Conceitos básicos de ${temaOriginalUsuario}",
  "conceitos_imagem_prompt": "Diagrama de ${temaOriginalUsuario}",
  "desenvolvimento_1_imagem_prompt": "Primeiro aspecto de ${temaOriginalUsuario}",
  "desenvolvimento_2_imagem_prompt": "Segundo aspecto de ${temaOriginalUsuario}",
  "desenvolvimento_3_imagem_prompt": "Terceiro aspecto de ${temaOriginalUsuario}",
  "desenvolvimento_4_imagem_prompt": "Quarto aspecto de ${temaOriginalUsuario}",
  "exemplo_imagem_prompt": "Exemplo prático de ${temaOriginalUsuario}"
}

Retorne APENAS o JSON válido.`;

      prompt = `Crie slides educacionais sobre "${temaOriginalUsuario}" para ${disciplina}, ${serie}.

IMPORTANTE: O campo 'tema' deve ser exatamente "${temaOriginalUsuario}". Não modifique.`;

    } else if (materialType === 'plano-de-aula') {
      systemMessage = `Você é um especialista em planos de aula educacionais.

REGRA OBRIGATÓRIA CRÍTICA:
- O campo 'titulo' DEVE ser EXATAMENTE: "${temaOriginalUsuario}"
- O campo 'tema' DEVE ser EXATAMENTE: "${temaOriginalUsuario}"
- NUNCA altere, reescreva ou modifique o tema fornecido`;

      prompt = `Crie um plano de aula sobre "${temaOriginalUsuario}" para ${disciplina}, ${serie}.

ESTRUTURA OBRIGATÓRIA:
{
  "titulo": "${temaOriginalUsuario}",
  "professor": "${formData.professor || 'Professor(a)'}",
  "data": "${formData.data || new Date().toLocaleDateString('pt-BR')}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${temaOriginalUsuario}",
  "duracao": "${formData.duracao || '50 minutos'}",
  "bncc": ["Código BNCC relacionado a ${temaOriginalUsuario}"],
  "objetivos": ["Objetivo sobre ${temaOriginalUsuario}"],
  "habilidades": [{"codigo": "EFxxXXxx", "descricao": "Habilidade sobre ${temaOriginalUsuario}"}],
  "conteudosProgramaticos": ["Conteúdo sobre ${temaOriginalUsuario}"],
  "desenvolvimento": [
    {"etapa": "Introdução", "tempo": "10 minutos", "atividade": "Atividade sobre ${temaOriginalUsuario}", "recursos": "Recursos"}
  ],
  "recursos": ["Recurso para ${temaOriginalUsuario}"],
  "metodologia": "Metodologia para ${temaOriginalUsuario}",
  "avaliacao": "Avaliação sobre ${temaOriginalUsuario}",
  "referencias": ["Referência sobre ${temaOriginalUsuario}"]
}

Retorne APENAS o JSON válido.`;

    } else if (materialType === 'atividade') {
      systemMessage = `Você é um especialista em atividades educacionais.

REGRA OBRIGATÓRIA: O campo 'titulo' deve ser "Atividade: ${temaOriginalUsuario}"`;

      prompt = `Crie atividade sobre "${temaOriginalUsuario}" para ${disciplina}, ${serie}.
Questões: ${formData.numeroQuestoes || 5}

ESTRUTURA:
{
  "titulo": "Atividade: ${temaOriginalUsuario}",
  "instrucoes": "Instruções sobre ${temaOriginalUsuario}",
  "questoes": [{"numero": 1, "tipo": "múltipla escolha", "pergunta": "Sobre ${temaOriginalUsuario}", "opcoes": ["opcao"]}]
}`;

    } else if (materialType === 'avaliacao') {
      systemMessage = `Você é um especialista em avaliações educacionais.

REGRA OBRIGATÓRIA: O campo 'titulo' deve ser "Avaliação: ${temaOriginalUsuario}"`;

      prompt = `Crie avaliação sobre "${temaOriginalUsuario}" para ${disciplina}, ${serie}.
Questões: ${formData.numeroQuestoes || 10}

ESTRUTURA:
{
  "titulo": "Avaliação: ${temaOriginalUsuario}",
  "instrucoes": "Instruções sobre ${temaOriginalUsuario}",
  "tempoLimite": "60 minutos",
  "questoes": [{"numero": 1, "tipo": "múltipla escolha", "pergunta": "Sobre ${temaOriginalUsuario}", "opcoes": ["opcao"], "pontuacao": 2}]
}`;

    } else if (materialType === 'apoio') {
      systemMessage = `Você é um especialista em materiais de apoio educacionais.

REGRA OBRIGATÓRIA: O campo 'titulo' deve ser "Material de Apoio: ${temaOriginalUsuario}"`;

      prompt = `Crie material de apoio sobre "${temaOriginalUsuario}" para ${disciplina}, ${serie}.

ESTRUTURA:
{
  "titulo": "Material de Apoio: ${temaOriginalUsuario}",
  "conteudo": "Conteúdo HTML sobre ${temaOriginalUsuario}"
}`;
    }

    // GERAR CONTEÚDO COM OPENAI
    console.log('🤖 [ETAPA-2] Chamando OpenAI...');
    console.log(`📤 [OPENAI] Tema garantido: "${temaOriginalUsuario}"`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ [OPENAI] Erro na API:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log(`✅ [OPENAI] Resposta recebida`);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ [OPENAI] Estrutura de resposta inválida:', data);
      throw new Error('Resposta inválida da OpenAI');
    }

    let generatedContent = data.choices[0].message.content.trim();
    generatedContent = generatedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    console.log('📝 [CONTEÚDO] Preview:', generatedContent.substring(0, 200) + '...');

    // PROCESSAR JSON
    console.log(`🔍 [ETAPA-3] Processando JSON...`);
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
      console.log(`✅ [JSON] Parse realizado com sucesso`);
    } catch (parseError) {
      console.error(`❌ [JSON] Falha no parse:`, parseError);
      throw new Error('Não foi possível processar o conteúdo gerado');
    }

    // PONTO CRÍTICO: FORÇAR O TEMA ORIGINAL EM TODOS OS CASOS
    console.log(`🔒 [CORREÇÃO-CRÍTICA] Forçando tema original: "${temaOriginalUsuario}"`);
    
    if (parsedContent && typeof parsedContent === 'object') {
      // Para todos os tipos de material, garantir que o tema seja o original
      if (parsedContent.tema) {
        parsedContent.tema = temaOriginalUsuario;
      }
      if (parsedContent.titulo) {
        // Se já contém o prefixo, manter. Senão, usar apenas o tema original
        if (parsedContent.titulo.includes('Atividade:') || 
            parsedContent.titulo.includes('Avaliação:') || 
            parsedContent.titulo.includes('Material de Apoio:')) {
          // Manter o prefixo mas substituir o tema
          const prefix = parsedContent.titulo.split(':')[0] + ': ';
          parsedContent.titulo = prefix + temaOriginalUsuario;
        } else {
          parsedContent.titulo = temaOriginalUsuario;
        }
      }
    }

    console.log(`✅ [CORREÇÃO-CRÍTICA] Tema corrigido para: "${parsedContent.tema || parsedContent.titulo}"`);

    // GERAR IMAGENS PARA SLIDES
    if (materialType === 'slides') {
      console.log('🎨 [IMAGENS] Iniciando geração para SLIDES...');
      
      const imageFields = [
        { field: 'tema_imagem', promptField: 'tema_imagem_prompt', type: 'CAPA' },
        { field: 'introducao_imagem', promptField: 'introducao_imagem_prompt', type: 'INTRODUÇÃO' },
        { field: 'conceitos_imagem', promptField: 'conceitos_imagem_prompt', type: 'CONCEITOS' },
        { field: 'desenvolvimento_1_imagem', promptField: 'desenvolvimento_1_imagem_prompt', type: 'DESENVOLVIMENTO-1' },
        { field: 'desenvolvimento_2_imagem', promptField: 'desenvolvimento_2_imagem_prompt', type: 'DESENVOLVIMENTO-2' },
        { field: 'desenvolvimento_3_imagem', promptField: 'desenvolvimento_3_imagem_prompt', type: 'DESENVOLVIMENTO-3' },
        { field: 'desenvolvimento_4_imagem', promptField: 'desenvolvimento_4_imagem_prompt', type: 'DESENVOLVIMENTO-4' },
        { field: 'exemplo_imagem', promptField: 'exemplo_imagem_prompt', type: 'EXEMPLO' }
      ];

      for (let i = 0; i < imageFields.length; i++) {
        const { field, promptField, type } = imageFields[i];
        
        if (parsedContent[promptField]) {
          console.log(`🖼️ [${i + 1}/${imageFields.length}] Processando imagem: ${type}`);
          
          try {
            const imageUrl = await generateImage(parsedContent[promptField], type);
            parsedContent[field] = imageUrl;
            delete parsedContent[promptField];
            console.log(`✅ [${i + 1}/${imageFields.length}] Imagem ${type} gerada`);
            
            if (i < imageFields.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.error(`❌ [${i + 1}/${imageFields.length}] Erro na imagem ${type}:`, error);
            throw new Error(`Falha na geração de imagem para ${type}: ${error.message}`);
          }
        }
      }

      console.log('✅ [IMAGENS] Todas as imagens processadas');
    }

    // LOGS FINAIS
    const temaFinal = parsedContent?.tema || parsedContent?.titulo || '[SEM TEMA]';
    console.log(`[MATERIAL-LOG] [${requestId}] TEMA_FINAL: "${temaFinal}"`);
    console.log(`[MATERIAL-LOG] [${requestId}] PRONTO_PARA_RETORNO | Tema: "${temaFinal}"`);
    console.log('✅ [SUCESSO] Material gerado com tema preservado!');

    const endTime = new Date().toISOString();
    console.log(`[MATERIAL-LOG] [${endTime}] [${requestId}] FIM | Tema: "${temaFinal}"`);

    return new Response(JSON.stringify({ 
      success: true, 
      content: parsedContent,
      validation: {
        originalTopic: temaOriginalUsuario,
        finalTopic: temaFinal,
        preserved: temaOriginalUsuario === temaFinal
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorTime = new Date().toISOString();
    console.error(`[MATERIAL-LOG] [${errorTime}] [${requestId}] ERRO | Mensagem: ${error.message}`);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
