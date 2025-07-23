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

// Função para validar rigorosamente o conteúdo gerado
function validateSlidesContent(content: any, expectedTopic: string): boolean {
  console.log('🔍 [VALIDAÇÃO] Iniciando validação rigorosa do conteúdo...');
  
  const requiredFields = [
    'tema', 'disciplina', 'serie', 'professor', 'objetivos', 'introducao', 
    'conceitos', 'desenvolvimento_1', 'desenvolvimento_2', 'desenvolvimento_3', 
    'desenvolvimento_4', 'exemplo', 'atividade', 'resumo', 'conclusao'
  ];

  // Verificar se todos os campos obrigatórios existem
  for (const field of requiredFields) {
    if (!content[field] || content[field].toString().trim() === '') {
      console.error(`❌ [VALIDAÇÃO] Campo obrigatório ausente ou vazio: ${field}`);
      return false;
    }
  }

  // Verificar se o tema está presente em múltiplos campos (validação rigorosa)
  const topicLower = expectedTopic.toLowerCase();
  const fieldsToCheck = ['tema', 'introducao', 'conceitos', 'desenvolvimento_1'];
  
  let topicMatchCount = 0;
  for (const field of fieldsToCheck) {
    if (content[field] && content[field].toString().toLowerCase().includes(topicLower)) {
      topicMatchCount++;
    }
  }

  if (topicMatchCount < 2) {
    console.error(`❌ [VALIDAÇÃO] Tema "${expectedTopic}" não encontrado suficientemente no conteúdo. Matches: ${topicMatchCount}`);
    console.error(`❌ [VALIDAÇÃO] Conteúdo tema:`, content.tema);
    console.error(`❌ [VALIDAÇÃO] Conteúdo introdução:`, content.introducao?.substring(0, 100));
    return false;
  }

  console.log(`✅ [VALIDAÇÃO] Conteúdo validado com sucesso. Tema encontrado ${topicMatchCount} vezes`);
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialType, formData } = await req.json();
    console.log('🚀 [INÍCIO] Iniciando geração de material:', materialType);
    console.log('📋 [DADOS] FormData recebido:', formData);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Extrair informações específicas
    const temaEspecifico = formData.tema || formData.topic || '';
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
      systemMessage = `Você é um especialista em criação de materiais educacionais ULTRA-ESPECÍFICOS para apresentações de slides sobre "${temaEspecifico}".

REGRAS CRÍTICAS E OBRIGATÓRIAS:
1. TODO o conteúdo DEVE ser EXCLUSIVAMENTE sobre "${temaEspecifico}" - NUNCA sobre outros temas
2. JAMAIS mencione qualquer tema diferente de "${temaEspecifico}"
3. TODAS as variáveis devem conter informações SOMENTE sobre "${temaEspecifico}"
4. Se o tema for "Geometria", NÃO fale sobre multiplicação, divisão ou operações matemáticas
5. Se o tema for "Multiplicação", NÃO fale sobre geometria, formas ou figuras
6. Cada campo do JSON deve ter conteúdo educativo específico e detalhado sobre "${temaEspecifico}"

VALIDAÇÃO OBRIGATÓRIA:
- O título deve conter "${temaEspecifico}"
- A introdução deve explicar especificamente "${temaEspecifico}"
- Os conceitos devem ser APENAS de "${temaEspecifico}"
- Todos os desenvolvimentos devem abordar aspectos diferentes de "${temaEspecifico}"
- O exemplo deve ser um caso prático de "${temaEspecifico}"

ESTRUTURA JSON RIGOROSAMENTE OBRIGATÓRIA:
{
  "tema": "DEVE conter '${temaEspecifico}' no título principal",
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
  "tema_imagem_prompt": "Ilustração educativa brasileira sobre ${temaEspecifico} para ${disciplina}, série ${serie}, capa atraente",
  "introducao_imagem_prompt": "Introdução visual educativa sobre ${temaEspecifico}, conceitos básicos para ${disciplina} ${serie}",
  "conceitos_imagem_prompt": "Diagrama educativo dos conceitos principais de ${temaEspecifico} para ${disciplina} ${serie}",
  "desenvolvimento_1_imagem_prompt": "Ilustração específica do primeiro aspecto de ${temaEspecifico} em ${disciplina} para ${serie}",
  "desenvolvimento_2_imagem_prompt": "Ilustração específica do segundo aspecto de ${temaEspecifico} em ${disciplina} para ${serie}",
  "desenvolvimento_3_imagem_prompt": "Ilustração específica do terceiro aspecto de ${temaEspecifico} em ${disciplina} para ${serie}",
  "desenvolvimento_4_imagem_prompt": "Ilustração específica do quarto aspecto de ${temaEspecifico} em ${disciplina} para ${serie}",
  "exemplo_imagem_prompt": "Exemplo visual prático de ${temaEspecifico} aplicado em ${disciplina} para ${serie}"
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
2. NUNCA mencione outros temas matemáticos além de "${temaEspecifico}"
3. Use linguagem adequada para ${serie} mas específica sobre "${temaEspecifico}"
4. Foque em conceitos, definições, exemplos e aplicações SOMENTE de "${temaEspecifico}"
5. Cada campo deve ter pelo menos 2-3 frases específicas sobre "${temaEspecifico}"
6. Os prompts de imagem devem ser ULTRA-ESPECÍFICOS sobre "${temaEspecifico}"

VALIDAÇÃO CRÍTICA: 
- Se você mencionar qualquer tema diferente de "${temaEspecifico}", o JSON será rejeitado
- Cada campo deve conter a palavra "${temaEspecifico}" ou seus conceitos relacionados
- O conteúdo deve ser educativo, detalhado e específico

EXEMPLO DE ESPECIFICIDADE EXIGIDA:
Se o tema for "Geometria": fale sobre formas, figuras, ângulos, perímetros, áreas
Se o tema for "Multiplicação": fale sobre tabuada, operações, fatores, produtos

Retorne APENAS o JSON com conteúdo ultra-específico sobre "${temaEspecifico}".`;

    } else if (materialType === 'plano-de-aula') {
      systemMessage = `Você é um especialista em educação brasileira. Crie um plano de aula ESPECÍFICO sobre "${temaEspecifico}".
Retorne APENAS um JSON válido com a estrutura especificada.`;

      prompt = `Crie um plano de aula ESPECÍFICO sobre "${temaEspecifico}" para ${disciplina}, ${serie}.

ESTRUTURA OBRIGATÓRIA:
{
  "titulo": "Plano de aula: ${temaEspecifico}",
  "professor": "${formData.professor || 'Professor(a)'}",
  "disciplina": "${disciplina}", 
  "serie": "${serie}",
  "tema": "${temaEspecifico}",
  "data": "${new Date().toLocaleDateString('pt-BR')}",
  "duracao": "50 minutos",
  "bncc": "string - código BNCC relacionado a ${temaEspecifico}",
  "objetivos": ["objetivo 1 sobre ${temaEspecifico}", "objetivo 2 sobre ${temaEspecifico}"],
  "habilidades": ["habilidade 1 de ${temaEspecifico}", "habilidade 2 de ${temaEspecifico}"],
  "desenvolvimento": [
    {"etapa": "Abertura", "atividade": "Introdução ao ${temaEspecifico}", "tempo": "10 min", "recursos": "Quadro"}
  ],
  "recursos": ["recursos para ${temaEspecifico}"],
  "conteudosProgramaticos": ["conteúdo 1 de ${temaEspecifico}", "conteúdo 2 de ${temaEspecifico}"],
  "metodologia": "Metodologia específica para ensinar ${temaEspecifico}",
  "avaliacao": "Avaliação focada em ${temaEspecifico}",
  "referencias": ["referência sobre ${temaEspecifico}"]
}`;

    } else if (materialType === 'atividade') {
      systemMessage = `Você é um especialista em criação de atividades educacionais sobre "${temaEspecifico}".
Retorne APENAS um JSON válido com a estrutura especificada.`;

      prompt = `Crie uma atividade ESPECÍFICA sobre "${temaEspecifico}" para ${disciplina}, ${serie}.
Número de questões: ${formData.numeroQuestoes || formData.quantidadeQuestoes || 5}

ESTRUTURA OBRIGATÓRIA:
{
  "titulo": "Atividade: ${temaEspecifico}",
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
Retorne APENAS um JSON válido com a estrutura especificada.`;

      prompt = `Crie uma avaliação ESPECÍFICA sobre "${temaEspecifico}" para ${disciplina}, ${serie}.
Número de questões: ${formData.numeroQuestoes || formData.quantidadeQuestoes || 10}

ESTRUTURA OBRIGATÓRIA:
{
  "titulo": "Avaliação: ${temaEspecifico}",
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
      systemMessage = `Você é um especialista em materiais de apoio sobre "${temaEspecifico}".
Retorne APENAS um JSON válido com a estrutura especificada.`;

      prompt = `Crie um material de apoio ESPECÍFICO sobre "${temaEspecifico}" para ${disciplina}, ${serie}.

ESTRUTURA OBRIGATÓRIA:
{
  "titulo": "Material de Apoio: ${temaEspecifico}",
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
        
        // Validação ultra-rigorosa para slides
        if (materialType === 'slides') {
          if (validateSlidesContent(tempParsedContent, temaEspecifico)) {
            parsedContent = tempParsedContent;
            console.log(`✅ [VALIDAÇÃO] Conteúdo aprovado na tentativa ${attempts} para tema: ${temaEspecifico}`);
            break;
          } else {
            console.warn(`⚠️ [VALIDAÇÃO] Tentativa ${attempts} rejeitada. Conteúdo não específico para: ${temaEspecifico}`);
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
      console.log('🎨 [ETAPA-4] Iniciando geração sequencial de imagens para slides...');
      
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
            throw new Error(`Falha na geração de imagem para ${type}: ${error.message}`);
          }
        } else {
          console.warn(`⚠️ [${i + 1}/${imageFields.length}] Prompt não encontrado para ${type}`);
        }
      }

      console.log('✅ [SEQUÊNCIA] Todas as imagens foram processadas com sucesso');

      // Validar campos obrigatórios para slides
      const requiredFields = [
        'tema', 'disciplina', 'serie', 'professor', 'objetivos', 'introducao', 
        'conceitos', 'desenvolvimento_1', 'desenvolvimento_2', 'desenvolvimento_3', 
        'desenvolvimento_4', 'exemplo', 'atividade', 'resumo', 'conclusao',
        'tema_imagem', 'introducao_imagem', 'conceitos_imagem', 
        'desenvolvimento_1_imagem', 'desenvolvimento_2_imagem', 
        'desenvolvimento_3_imagem', 'desenvolvimento_4_imagem', 'exemplo_imagem'
      ];

      for (const field of requiredFields) {
        if (!parsedContent[field]) {
          console.error(`❌ [VALIDAÇÃO-FINAL] Campo obrigatório ausente: ${field}`);
          throw new Error(`Missing required field: ${field}`);
        }
      }
      console.log('✅ [VALIDAÇÃO-FINAL] Todos os campos obrigatórios presentes');
    }

    // ETAPA 5: FINALIZAÇÃO E LOGS FINAIS
    console.log('🏁 [ETAPA-5] Finalizando geração do material...');
    console.log('📋 [VERIFICAÇÃO-FINAL] Tema solicitado:', temaEspecifico);
    console.log('📋 [VERIFICAÇÃO-FINAL] Tema no material:', parsedContent.tema);
    console.log('📋 [VERIFICAÇÃO-FINAL] Disciplina:', parsedContent.disciplina);
    console.log('📋 [VERIFICAÇÃO-FINAL] Série:', parsedContent.serie);
    console.log('✅ [SUCESSO] Material ultra-específico gerado com sucesso!');

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
    console.error('❌ [ERRO-GERAL] Falha na geração do material:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
