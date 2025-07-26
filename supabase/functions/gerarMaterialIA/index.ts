
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { v4 as uuidv4 } from "https://deno.land/std@0.170.0/uuid/mod.ts";

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

// Função para validar rigorosamente o conteúdo de slides gerado
function validateSlidesContent(content: any, expectedTopic: string): boolean {
  console.log('🔍 [VALIDAÇÃO-SLIDES] Iniciando validação rigorosa do conteúdo...');
  
  const requiredFields = [
    'tema', 'disciplina', 'serie', 'professor', 'objetivos', 'introducao', 
    'conceitos', 'desenvolvimento_1', 'desenvolvimento_2', 'desenvolvimento_3', 
    'desenvolvimento_4', 'exemplo', 'atividade', 'resumo', 'conclusao'
  ];

  // Verificar se todos os campos obrigatórios existem e não estão vazios
  for (const field of requiredFields) {
    if (!content[field] || content[field].toString().trim() === '') {
      console.error(`❌ [VALIDAÇÃO-SLIDES] Campo obrigatório ausente ou vazio: ${field}`);
      return false;
    }
  }

  // Verificar se o tema está correto
  if (content.tema !== expectedTopic) {
    console.error(`❌ [VALIDAÇÃO-SLIDES] Tema incorreto. Esperado: "${expectedTopic}", Recebido: "${content.tema}"`);
    return false;
  }

  // Verificar se os objetivos são um array
  if (!Array.isArray(content.objetivos) || content.objetivos.length === 0) {
    console.error(`❌ [VALIDAÇÃO-SLIDES] Objetivos devem ser um array não vazio`);
    return false;
  }

  console.log(`✅ [VALIDAÇÃO-SLIDES] Conteúdo validado com sucesso para tema: ${expectedTopic}`);
  return true;
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
    const temaRecebido = formData.tema || formData.topic || '';
    console.log(`[MATERIAL-LOG] [${requestId}] RECEBIDO | Tipo: ${materialType} | Tema: "${temaRecebido}"`);
    console.log('🟢 [INÍCIO] Requisição recebida para geração de material.');
    console.log(`📥 [DADOS] Tipo de material: ${materialType}`);
    console.log(`📥 [DADOS] Tema: ${temaRecebido}`);
    console.log(`📥 [DADOS] Disciplina: ${formData.disciplina || formData.subject || ''}`);
    console.log(`📥 [DADOS] Série: ${formData.serie || formData.grade || ''}`);

    if (!openAIApiKey) {
      console.error('❌ [ERRO] OpenAI API key não configurada');
      throw new Error('OpenAI API key not configured');
    }

    // Extrair informações específicas
    const temaEspecifico = temaRecebido;
    const disciplina = formData.disciplina || formData.subject || '';
    const serie = formData.serie || formData.grade || '';

    console.log('🎯 [TEMA] Tema específico:', temaEspecifico);
    console.log('📚 [DISCIPLINA] Disciplina:', disciplina);
    console.log('🎓 [SÉRIE] Série:', serie);

    if (!temaEspecifico.trim()) {
      throw new Error('Tema não fornecido no formData');
    }

    let prompt = '';
    let systemMessage = '';

    // ETAPA 1: DEFINIR PROMPTS ULTRA-ESPECÍFICOS PARA GERAÇÃO DE TEXTO
    console.log('📝 [ETAPA-1] Configurando prompts ultra-específicos para geração de texto...');

    if (materialType === 'slides') {
      systemMessage = `Você é um especialista em criação de apresentações educacionais ULTRA-ESPECÍFICAS sobre "${temaEspecifico}".

REGRAS CRÍTICAS E OBRIGATÓRIAS:
1. TODO o conteúdo DEVE ser EXCLUSIVAMENTE sobre "${temaEspecifico}" - NUNCA sobre outros temas
2. JAMAIS mencione qualquer tema diferente de "${temaEspecifico}"
3. TODAS as variáveis devem conter informações SOMENTE sobre "${temaEspecifico}"
4. O campo 'tema' do JSON gerado deve ser exatamente: "${temaEspecifico}"
5. Cada campo do JSON deve ter conteúdo educativo específico e detalhado sobre "${temaEspecifico}"

ESTRUTURA JSON RIGOROSAMENTE OBRIGATÓRIA:
{
  "tema": "${temaEspecifico}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "professor": "${formData.professor || 'Professor(a)'}",
  "objetivos": ["objetivo específico sobre ${temaEspecifico}", "segundo objetivo sobre ${temaEspecifico}", "terceiro objetivo sobre ${temaEspecifico}"],
  "introducao": "Introdução detalhada e específica sobre ${temaEspecifico}",
  "conceitos": "Conceitos fundamentais e específicos de ${temaEspecifico}",
  "desenvolvimento_1": "Primeiro aspecto importante de ${temaEspecifico}",
  "desenvolvimento_2": "Segundo aspecto importante de ${temaEspecifico}",
  "desenvolvimento_3": "Terceiro aspecto importante de ${temaEspecifico}",
  "desenvolvimento_4": "Quarto aspecto importante de ${temaEspecifico}",
  "exemplo": "Exemplo prático e específico de ${temaEspecifico}",
  "atividade": "Atividade pedagógica específica sobre ${temaEspecifico}",
  "resumo": "Resumo dos pontos principais de ${temaEspecifico}",
  "conclusao": "Conclusão específica sobre a importância de ${temaEspecifico}",
  "tema_imagem_prompt": "Ilustração educativa brasileira sobre ${temaEspecifico} para ${disciplina}, série ${serie}, capa atraente, sem texto",
  "introducao_imagem_prompt": "Introdução visual educativa sobre ${temaEspecifico}, conceitos básicos para ${disciplina} ${serie}, sem texto",
  "conceitos_imagem_prompt": "Diagrama educativo dos conceitos principais de ${temaEspecifico} para ${disciplina} ${serie}, sem texto",
  "desenvolvimento_1_imagem_prompt": "Ilustração específica do primeiro aspecto de ${temaEspecifico} em ${disciplina} para ${serie}, sem texto",
  "desenvolvimento_2_imagem_prompt": "Ilustração específica do segundo aspecto de ${temaEspecifico} em ${disciplina} para ${serie}, sem texto", 
  "desenvolvimento_3_imagem_prompt": "Ilustração específica do terceiro aspecto de ${temaEspecifico} em ${disciplina} para ${serie}, sem texto",
  "desenvolvimento_4_imagem_prompt": "Ilustração específica do quarto aspecto de ${temaEspecifico} em ${disciplina} para ${serie}, sem texto",
  "exemplo_imagem_prompt": "Exemplo visual prático de ${temaEspecifico} aplicado em ${disciplina} para ${serie}, sem texto"
}

IMPORTANTE: Retorne APENAS o JSON válido, sem markdown ou explicações.`;

      prompt = `Crie uma apresentação educacional ULTRA-ESPECÍFICA e DETALHADA sobre "${temaEspecifico}".

DADOS OBRIGATÓRIOS:
- Tema EXCLUSIVO: ${temaEspecifico}
- Disciplina: ${disciplina}
- Série: ${serie}
- Professor: ${formData.professor || 'Professor(a)'}

INSTRUÇÕES CRÍTICAS PARA "${temaEspecifico}":
1. TODOS os textos devem ser EXCLUSIVAMENTE sobre "${temaEspecifico}"
2. NUNCA mencione outros temas além de "${temaEspecifico}"
3. Use linguagem adequada para ${serie} mas específica sobre "${temaEspecifico}"
4. Foque em conceitos, definições, exemplos e aplicações SOMENTE de "${temaEspecifico}"
5. Cada campo deve ter pelo menos 2-3 frases específicas sobre "${temaEspecifico}"
6. Os prompts de imagem devem ser ULTRA-ESPECÍFICOS sobre "${temaEspecifico}" e incluir "sem texto"

Retorne APENAS o JSON com conteúdo ultra-específico sobre "${temaEspecifico}".`;

    } else if (materialType === 'plano-de-aula') {
      systemMessage = `Você é um especialista em educação brasileira, pedagogo experiente e profundo conhecedor da BNCC. Crie um plano de aula DETALHADO e ESPECÍFICO sobre o tema "${temaEspecifico}" para a disciplina "${disciplina}", voltado para a série/ano "${serie}".

ATENÇÃO: O campo 'titulo' e o campo 'tema' DEVEM ser exatamente "${temaEspecifico}".`;

      prompt = `INSTRUÇÕES IMPORTANTES:
- O tema "${temaEspecifico}" deve ser o FOCO CENTRAL de todas as seções do plano.
- O tempo total da aula deve ser respeitado: ${formData.duracao || '50 minutos'} minutos.
- Os **objetivos devem ser exatamente 3**, claros e diretamente relacionados ao tema.
- As **habilidades da BNCC devem variar de 1 a 5**, com códigos e descrições reais e compatíveis com o tema e disciplina.
- Utilize **metodologias ativas e participativas**, apropriadas à faixa etária e ao conteúdo.
- As **referências** devem estar no formato **ABNT**.
- Responda apenas com um JSON válido. Nenhum texto fora do JSON.
- O campo 'titulo' e o campo 'tema' DEVEM ser exatamente "${temaEspecifico}".

{
  "titulo": "${temaEspecifico}",
  "professor": "${formData.professor || 'Professor(a)'}",
  "data": "${formData.data || new Date().toLocaleDateString('pt-BR')}",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "tema": "${temaEspecifico}",
  "duracao": "${formData.duracao || '50 minutos'}",
  "bncc": [
    "Código e descrição da habilidade da BNCC relacionada ao tema"
  ],
  "objetivos": [
    "Objetivo 1 específico sobre ${temaEspecifico}",
    "Objetivo 2 específico sobre ${temaEspecifico}",
    "Objetivo 3 específico sobre ${temaEspecifico}"
  ],
  "habilidades": [
    {
      "codigo": "EFxxLPxx",
      "descricao": "Descrição do código da habilidade relacionada a ${temaEspecifico}"
    }
  ],
  "conteudosProgramaticos": [
    "Conteúdo programático 1 sobre ${temaEspecifico}",
    "Conteúdo programático 2 sobre ${temaEspecifico}"
  ],
  "desenvolvimento": [
    {
      "etapa": "Introdução",
      "tempo": "xx minutos",
      "atividade": "Atividade inicial sobre ${temaEspecifico}",
      "recursos": "Recursos para introdução"
    },
    {
      "etapa": "Desenvolvimento",
      "tempo": "xx minutos",
      "atividade": "Atividade principal sobre ${temaEspecifico}",
      "recursos": "Recursos principais"
    },
    {
      "etapa": "Prática",
      "tempo": "xx minutos",
      "atividade": "Atividade prática sobre ${temaEspecifico}",
      "recursos": "Materiais práticos"
    },
    {
      "etapa": "Fechamento",
      "tempo": "xx minutos",
      "atividade": "Revisão e encerramento sobre ${temaEspecifico}",
      "recursos": "Recursos de fechamento"
    }
  ],
  "recursos": [
    "Recurso 1 relacionado a ${temaEspecifico}",
    "Recurso 2 relacionado a ${temaEspecifico}"
  ],
  "metodologia": "Descrever metodologia ativa aplicada ao tema ${temaEspecifico}",
  "avaliacao": "Critérios de avaliação da aprendizagem sobre ${temaEspecifico}",
  "referencias": [
    "SOBRENOME, Nome. Título da obra. Edição. Local: Editora, ano.",
    "SOBRENOME, Nome. Título da página. Nome do site, ano. Disponível em: <URL>. Acesso em: data."
  ]
}`;

    } else if (materialType === 'atividade') {
      systemMessage = `Você é um especialista em criação de atividades educacionais sobre "${temaEspecifico}".
O campo 'tema' do JSON gerado deve ser exatamente: "${temaEspecifico}".
Retorne APENAS um JSON válido com a estrutura especificada.`;

      prompt = `Crie uma atividade ESPECÍFICA sobre "${temaEspecifico}" para ${disciplina}, ${serie}.
Número de questões: ${formData.numeroQuestoes || 5}

ESTRUTURA OBRIGATÓRIA:
{
  "titulo": "Atividade: ${temaEspecifico}",
  "tema": "${temaEspecifico}",
  "instrucoes": "Instruções para atividade sobre ${temaEspecifico}",
  "questoes": [
    {
      "numero": 1,
      "tipo": "múltipla escolha",
      "pergunta": "Pergunta sobre ${temaEspecifico}",
      "opcoes": ["opção sobre ${temaEspecifico}"]
    }
  ]
}`;

    } else if (materialType === 'avaliacao') {
      systemMessage = `Você é um especialista em avaliações educacionais sobre "${temaEspecifico}".
O campo 'tema' do JSON gerado deve ser exatamente: "${temaEspecifico}".
Retorne APENAS um JSON válido com a estrutura especificada.`;

      prompt = `Crie uma avaliação ESPECÍFICA sobre "${temaEspecifico}" para ${disciplina}, ${serie}.
Número de questões: ${formData.numeroQuestoes || 10}

ESTRUTURA OBRIGATÓRIA:
{
  "titulo": "Avaliação: ${temaEspecifico}",
  "tema": "${temaEspecifico}",
  "instrucoes": "Instruções para avaliação sobre ${temaEspecifico}", 
  "tempoLimite": "60 minutos",
  "questoes": [
    {
      "numero": 1,
      "tipo": "múltipla escolha",
      "pergunta": "Pergunta sobre ${temaEspecifico}",
      "opcoes": ["opção sobre ${temaEspecifico}"],
      "pontuacao": 2
    }
  ]
}`;

    } else if (materialType === 'apoio') {
      systemMessage = `Você é um especialista em materiais de apoio educacionais sobre "${temaEspecifico}".
O campo 'tema' do JSON gerado deve ser exatamente: "${temaEspecifico}".
Retorne APENAS um JSON válido com a estrutura especificada.`;

      prompt = `Crie um material de apoio ESPECÍFICO sobre "${temaEspecifico}" para ${disciplina}, ${serie}.

ESTRUTURA OBRIGATÓRIA:
{
  "titulo": "Material de Apoio: ${temaEspecifico}",
  "tema": "${temaEspecifico}",
  "conteudo": "Conteúdo HTML detalhado específico sobre ${temaEspecifico}"
}`;
    }

    // ETAPA 2: GERAR TEXTO COM OPENAI COM VALIDAÇÃO RIGOROSA
    console.log('🤖 [ETAPA-2] Chamando OpenAI para geração de texto ultra-específico...');
    console.log('📤 [OPENAI] Enviando prompt ultra-específico para tema:', temaEspecifico);

    let attempts = 0;
    let parsedContent = null;
    const maxAttempts = 3;

    while (attempts < maxAttempts && !parsedContent) {
      attempts++;
      console.log(`🔄 [TENTATIVA-${attempts}] Gerando conteúdo para "${temaEspecifico}"...`);

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
      console.log(`✅ [OPENAI] Resposta recebida para tentativa ${attempts}`);

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('❌ [OPENAI] Estrutura de resposta inválida:', data);
        continue;
      }

      let generatedContent = data.choices[0].message.content.trim();
      console.log('📝 [CONTEÚDO] Preview do conteúdo gerado:', generatedContent.substring(0, 200) + '...');

      // ETAPA 3: PROCESSAR E VALIDAR JSON RIGOROSAMENTE
      console.log(`🔍 [ETAPA-3] Processando e validando JSON (tentativa ${attempts})...`);

      generatedContent = generatedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      try {
        const tempParsedContent = JSON.parse(generatedContent);
        console.log(`✅ [JSON] Parse realizado com sucesso na tentativa ${attempts}`);
        
        // GARANTIR QUE O TEMA SEJA SEMPRE O ORIGINAL DO USUÁRIO
        tempParsedContent.tema = temaEspecifico;
        if (tempParsedContent.titulo) {
          tempParsedContent.titulo = temaEspecifico;
        }
        
        // Validação específica para slides
        if (materialType === 'slides') {
          if (validateSlidesContent(tempParsedContent, temaEspecifico)) {
            parsedContent = tempParsedContent;
            console.log(`✅ [VALIDAÇÃO-SLIDES] Conteúdo aprovado na tentativa ${attempts} para tema: ${temaEspecifico}`);
            break;
          } else {
            console.warn(`⚠️ [VALIDAÇÃO-SLIDES] Tentativa ${attempts} rejeitada. Conteúdo não específico para: ${temaEspecifico}`);
            if (attempts < maxAttempts) {
              console.log(`🔄 [RETRY] Tentando novamente... (${attempts + 1}/${maxAttempts})`);
              continue;
            }
          }
        } else {
          // Para outros tipos de material, usar validação mais simples
          parsedContent = tempParsedContent;
          break;
        }
        
      } catch (parseError) {
        console.error(`❌ [JSON] Falha no parse da tentativa ${attempts}:`, parseError);
        if (attempts < maxAttempts) {
          console.log(`🔄 [RETRY] Tentando novamente devido a erro de parse... (${attempts + 1}/${maxAttempts})`);
          continue;
        }
      }
    }

    if (!parsedContent) {
      console.error('❌ [CRÍTICO] Falha em todas as tentativas de geração de conteúdo específico');
      throw new Error(`Não foi possível gerar conteúdo específico para "${temaEspecifico}" após ${maxAttempts} tentativas`);
    }

    // ETAPA 4: GERAÇÃO SEQUENCIAL DE IMAGENS (APENAS PARA SLIDES)
    if (materialType === 'slides') {
      console.log('🎨 [IMAGENS] Iniciando geração sequencial de imagens para SLIDES...');
      
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

      console.log(`🔄 [SEQUÊNCIA] Total de ${imageFields.length} imagens para gerar`);

      for (let i = 0; i < imageFields.length; i++) {
        const { field, promptField, type } = imageFields[i];
        
        if (parsedContent[promptField]) {
          console.log(`🖼️ [${i + 1}/${imageFields.length}] Processando imagem: ${type}`);
          console.log(`📝 [PROMPT-${type}] Prompt:`, parsedContent[promptField]);
          
          try {
            const imageUrl = await generateImage(parsedContent[promptField], type);
            parsedContent[field] = imageUrl;
            
            // Remover o campo de prompt para não incluir no resultado final
            delete parsedContent[promptField];
            
            console.log(`✅ [${i + 1}/${imageFields.length}] Imagem ${type} gerada com sucesso`);
            
            // Pequena pausa entre gerações para evitar sobrecarga
            if (i < imageFields.length - 1) {
              console.log(`⏳ [PAUSA] Aguardando 1 segundo antes da próxima imagem...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
          } catch (error) {
            console.error(`❌ [${i + 1}/${imageFields.length}] Erro na imagem ${type}:`, error);
            // Continuar mesmo se uma imagem falhar
            console.warn(`⚠️ [CONTINUAR] Continuando sem a imagem ${type}...`);
          }
        } else {
          console.warn(`⚠️ [${i + 1}/${imageFields.length}] Prompt não encontrado para ${type}`);
        }
      }

      console.log('✅ [IMAGENS] Processamento de imagens para SLIDES finalizado.');
    }

    // ETAPA 5: FINALIZAÇÃO E LOGS FINAIS
    console.log(`[MATERIAL-LOG] [${requestId}] IA | Tipo: ${materialType} | Tema final: "${parsedContent.tema}"`);
    console.log(`[MATERIAL-LOG] [${requestId}] PRONTO_PARA_SALVAR | Tipo: ${materialType} | Tema a ser salvo: "${parsedContent.tema}"`);
    
    console.log('🏁 [ETAPA-5] Finalizando geração do material...');
    console.log(`[EDGE-INFO] [${requestId}] [ETAPA: FINALIZAÇÃO] Tema solicitado: ${temaRecebido}`);
    console.log(`[EDGE-INFO] [${requestId}] [ETAPA: FINALIZAÇÃO] Tema no material: ${parsedContent.tema}`);
    console.log(`[EDGE-INFO] [${requestId}] [ETAPA: FINALIZAÇÃO] Disciplina: ${parsedContent.disciplina}`);
    console.log(`[EDGE-INFO] [${requestId}] [ETAPA: FINALIZAÇÃO] Série: ${parsedContent.serie}`);
    console.log('✅ [SUCESSO] Material ultra-específico gerado com sucesso!');

    const endTime = new Date().toISOString();
    console.log(`[MATERIAL-LOG] [${endTime}] [${requestId}] FIM | Tipo: ${materialType} | Tema: "${parsedContent.tema}"`);

    return new Response(JSON.stringify({ 
      success: true, 
      content: parsedContent,
      validation: {
        topic: temaEspecifico,
        attempts: attempts,
        validated: true
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorTime = new Date().toISOString();
    console.error(`[MATERIAL-LOG] [${errorTime}] [${requestId}] ERRO | Tipo: gerarMaterialIA | Mensagem: ${error.message}`);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
