
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialType, formData } = await req.json();
    console.log('🟢 [INÍCIO] Requisição recebida para geração de material.');
    console.log(`📥 [DADOS] Tipo de material: ${materialType}`);
    console.log(`📥 [DADOS] Tema: ${formData.tema || formData.topic || ''}`);
    console.log(`📥 [DADOS] Disciplina: ${formData.disciplina || formData.subject || ''}`);
    console.log(`📥 [DADOS] Série: ${formData.serie || formData.grade || ''}`);
    if (formData.duracao) console.log(`📥 [DADOS] Duração: ${formData.duracao}`);
    if (formData.professor) console.log(`📥 [DADOS] Professor: ${formData.professor}`);
    if (formData.numeroQuestoes || formData.quantidadeQuestoes) console.log(`📥 [DADOS] Número de questões: ${formData.numeroQuestoes || formData.quantidadeQuestoes}`);

    if (!openAIApiKey) {
      console.error('❌ [ERRO] OpenAI API key não configurada');
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

    // ETAPA 1: DEFINIR PROMPTS PARA GERAÇÃO DE TEXTO
    console.log('📝 [PROMPT] Preparando prompt e systemMessage para o tipo de material:', materialType);

    if (materialType === 'slides') {
      systemMessage = `Você é um especialista em criação de materiais educacionais ESPECÍFICOS para apresentações de slides.

REGRAS OBRIGATÓRIAS:
1. TODO o conteúdo DEVE ser especificamente sobre "${temaEspecifico}"
2. NUNCA mencione temas diferentes de "${temaEspecifico}"
3. Todas as variáveis devem conter informações EXCLUSIVAMENTE sobre "${temaEspecifico}"
4. Os prompts de imagem devem ilustrar APENAS conceitos de "${temaEspecifico}"

ESTRUTURA JSON OBRIGATÓRIA:
{
  "tema": "string - DEVE conter '${temaEspecifico}' no título",
  "disciplina": "${disciplina}",
  "serie": "${serie}",
  "professor": "${formData.professor || 'Professor(a)'}",
  "objetivos": ["objetivo 1 sobre ${temaEspecifico}", "objetivo 2 sobre ${temaEspecifico}", "objetivo 3 sobre ${temaEspecifico}"],
  "introducao": "string - introdução específica sobre ${temaEspecifico}",
  "conceitos": "string - conceitos principais de ${temaEspecifico}",
  "desenvolvimento_1": "string - primeiro aspecto de ${temaEspecifico}",
  "desenvolvimento_2": "string - segundo aspecto de ${temaEspecifico}",
  "desenvolvimento_3": "string - terceiro aspecto de ${temaEspecifico}",
  "desenvolvimento_4": "string - quarto aspecto de ${temaEspecifico}",
  "exemplo": "string - exemplo prático de ${temaEspecifico}",
  "atividade": "string - atividade sobre ${temaEspecifico}",
  "resumo": "string - resumo de ${temaEspecifico}",
  "conclusao": "string - conclusão sobre ${temaEspecifico}",
  "tema_imagem_prompt": "Ilustração educativa brasileira sobre ${temaEspecifico} para ${disciplina}, série ${serie}, capa atraente",
  "introducao_imagem_prompt": "Introdução visual educativa sobre ${temaEspecifico}, conceitos básicos para ${disciplina} ${serie}",
  "conceitos_imagem_prompt": "Diagrama educativo dos conceitos principais de ${temaEspecifico} para ${disciplina} ${serie}",
  "desenvolvimento_1_imagem_prompt": "Ilustração específica do primeiro aspecto de ${temaEspecifico} em ${disciplina} para ${serie}",
  "desenvolvimento_2_imagem_prompt": "Ilustração específica do segundo aspecto de ${temaEspecifico} em ${disciplina} para ${serie}",
  "desenvolvimento_3_imagem_prompt": "Ilustração específica do terceiro aspecto de ${temaEspecifico} em ${disciplina} para ${serie}",
  "desenvolvimento_4_imagem_prompt": "Ilustração específica do quarto aspecto de ${temaEspecifico} em ${disciplina} para ${serie}",
  "exemplo_imagem_prompt": "Exemplo visual prático de ${temaEspecifico} aplicado em ${disciplina} para ${serie}"
}

Retorne APENAS o JSON válido, sem markdown ou explicações.`;

      prompt = `Crie uma apresentação educacional COMPLETA e ESPECÍFICA sobre "${temaEspecifico}".

DADOS DO MATERIAL:
- Tema: ${temaEspecifico}
- Disciplina: ${disciplina}
- Série: ${serie}
- Professor: ${formData.professor || 'Professor(a)'}

INSTRUÇÕES CRÍTICAS:
1. TODOS os textos devem ser sobre "${temaEspecifico}" EXCLUSIVAMENTE
2. NÃO mencione outros temas além de "${temaEspecifico}"
3. Use linguagem adequada para ${serie}
4. Foque em conceitos, exemplos e aplicações específicas de "${temaEspecifico}"
5. Cada campo do JSON deve conter conteúdo educativo específico sobre "${temaEspecifico}"
6. Os prompts de imagem devem ser MUITO específicos sobre "${temaEspecifico}"

VALIDAÇÃO: Se o JSON gerado mencionar qualquer tema diferente de "${temaEspecifico}", refaça completamente.

Retorne APENAS o JSON com conteúdo específico sobre "${temaEspecifico}".`;
      console.log('📝 [PROMPT] Prompt e systemMessage para SLIDES prontos.');

    } else if (materialType === 'plano-de-aula') {
      systemMessage = `Você é um especialista em educação brasileira, pedagogo experiente e profundo conhecedor da BNCC. Crie um plano de aula DETALHADO e ESPECÍFICO sobre o tema "${formData.tema}" para a disciplina "${formData.disciplina}", voltado para a série/ano "${formData.serie}".`;

      prompt = `INSTRUÇÕES IMPORTANTES:
- O tema "${formData.tema}" deve ser o FOCO CENTRAL de todas as seções do plano.
- O tempo total da aula deve ser respeitado: ${formData.duracao || '50 minutos'} minutos.  
  > Exemplo: 50 min (1 aula), 100 min (2 aulas). Distribua esse tempo nas etapas: Introdução, Desenvolvimento, Prática e Fechamento.
- Os **objetivos devem ser exatamente 3**, claros e diretamente relacionados ao tema.
- As **habilidades da BNCC devem variar de 1 a 5**, com códigos e descrições reais e compatíveis com o tema e disciplina.
- Utilize **metodologias ativas e participativas**, apropriadas à faixa etária e ao conteúdo.
- As **referências** devem estar no formato **ABNT**, podendo ser:
  - **Livros impressos** (autor, título, edição, local, editora, ano)
  - **Sites** (autor, título, nome do site, ano, link, data de acesso)
- Responda apenas com um JSON válido. Nenhum texto fora do JSON.

### ✅ Estrutura obrigatória do JSON:

{
  "titulo": "Título específico e claro sobre ${formData.tema}",
  "professor": "${formData.professor || 'Professor(a)'}",
  "data": "${formData.data || new Date().toLocaleDateString('pt-BR')}",
  "disciplina": "${formData.disciplina}",
  "serie": "${formData.serie}",
  "tema": "${formData.tema}",
  "duracao": "${formData.duracao || '50 minutos'}",
  "bncc": [
    "Código e descrição da habilidade da BNCC relacionada ao tema"
  ],
  "objetivos": [
    "Objetivo 1 específico sobre o tema",
    "Objetivo 2 específico sobre o tema",
    "Objetivo 3 específico sobre o tema"
  ],
  "habilidades": [
    {
      "codigo específico sobre o tema": "EFxxLPxx",
      "descricao": "Descrição do código da habilidade relacionada ao tema"
    }
    // até 5 itens neste array
  ],
  "conteudosProgramaticos": [
    "Conteúdo programático 1 sobre ${formData.tema}",
    "Conteúdo programático 2 sobre ${formData.tema}"
  ],
  "desenvolvimento": [
    {
      "etapa": "Introdução",
      "tempo": "xx minutos",
      "atividade": "Atividade inicial sobre o tema",
      "recursos": "Recursos para introdução"
    },
    {
      "etapa": "Desenvolvimento",
      "tempo": "xx minutos",
      "atividade": "Atividade principal sobre o tema",
      "recursos": "Recursos principais"
    },
    {
      "etapa": "Prática",
      "tempo": "xx minutos",
      "atividade": "Atividade prática",
      "recursos": "Materiais práticos"
    },
    {
      "etapa": "Fechamento",
      "tempo": "xx minutos",
      "atividade": "Revisão e encerramento",
      "recursos": "Recursos de fechamento"
    }
  ],
  "recursos": [
    "Recurso 1 relacionado ao tema",
    "Recurso 2 relacionado ao tema"
  ],
  "metodologia": "Descrever metodologia ativa aplicada ao tema",
  "avaliacao": "Critérios de avaliação da aprendizagem sobre o tema",
  "referencias": [
    "SOBRENOME, Nome. Título da obra. Edição. Local: Editora, ano.",
    "SOBRENOME, Nome. Título da página. Nome do site, ano. Disponível em: <URL>. Acesso em: 18 jul. 2025."
  ]
}`;
      prompt = `INSTRUÇÕES IMPORTANTES:
- O tema "${formData.tema}" deve ser o FOCO CENTRAL de todas as seções do plano.
- O tempo total da aula deve ser respeitado: ${formData.duracao || '50 minutos'} minutos.  
  > Exemplo: 50 min (1 aula), 100 min (2 aulas). Distribua esse tempo nas etapas: Introdução, Desenvolvimento, Prática e Fechamento.
- Os **objetivos devem ser exatamente 3**, claros e diretamente relacionados ao tema.
- As **habilidades da BNCC devem variar de 1 a 5**, com códigos e descrições reais e compatíveis com o tema e disciplina.
- Utilize **metodologias ativas e participativas**, apropriadas à faixa etária e ao conteúdo.
- As **referências** devem estar no formato **ABNT**, podendo ser:
  - **Livros impressos** (autor, título, edição, local, editora, ano)
  - **Sites** (autor, título, nome do site, ano, link, data de acesso)
- Responda apenas com um JSON válido. Nenhum texto fora do JSON.

### ✅ Estrutura obrigatória do JSON:

{
  "titulo": "Título específico e claro sobre ${formData.tema}",
  "professor": "${formData.professor || 'Professor(a)'}",
  "data": "${formData.data || new Date().toLocaleDateString('pt-BR')}",
  "disciplina": "${formData.disciplina}",
  "serie": "${formData.serie}",
  "tema": "${formData.tema}",
  "duracao": "${formData.duracao || '50 minutos'}",
  "bncc": [
    "Código e descrição da habilidade da BNCC relacionada ao tema"
  ],
  "objetivos": [
    "Objetivo 1 específico sobre o tema",
    "Objetivo 2 específico sobre o tema",
    "Objetivo 3 específico sobre o tema"
  ],
  "habilidades": [
    {
      "codigo específico sobre o tema": "EFxxLPxx",
      "descricao": "Descrição do código da habilidade relacionada ao tema"
    }
    // até 5 itens neste array
  ],
  "conteudosProgramaticos": [
    "Conteúdo programático 1 sobre ${formData.tema}",
    "Conteúdo programático 2 sobre ${formData.tema}"
  ],
  "desenvolvimento": [
    {
      "etapa": "Introdução",
      "tempo": "xx minutos",
      "atividade": "Atividade inicial sobre o tema",
      "recursos": "Recursos para introdução"
    },
    {
      "etapa": "Desenvolvimento",
      "tempo": "xx minutos",
      "atividade": "Atividade principal sobre o tema",
      "recursos": "Recursos principais"
    },
    {
      "etapa": "Prática",
      "tempo": "xx minutos",
      "atividade": "Atividade prática",
      "recursos": "Materiais práticos"
    },
    {
      "etapa": "Fechamento",
      "tempo": "xx minutos",
      "atividade": "Revisão e encerramento",
      "recursos": "Recursos de fechamento"
    }
  ],
  "recursos": [
    "Recurso 1 relacionado ao tema",
    "Recurso 2 relacionado ao tema"
  ],
  "metodologia": "Descrever metodologia ativa aplicada ao tema",
  "avaliacao": "Critérios de avaliação da aprendizagem sobre o tema",
  "referencias": [
    "SOBRENOME, Nome. Título da obra. Edição. Local: Editora, ano.",
    "SOBRENOME, Nome. Título da página. Nome do site, ano. Disponível em: <URL>. Acesso em: 18 jul. 2025."
  ]
}`;
      console.log('📝 [PROMPT] Prompt e systemMessage para PLANO DE AULA prontos.');

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
      console.log('📝 [PROMPT] Prompt e systemMessage para ATIVIDADE prontos.');

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
      console.log('📝 [PROMPT] Prompt e systemMessage para AVALIAÇÃO prontos.');

    } else if (materialType === 'apoio') {
      systemMessage = `Você é um especialista em materiais de apoio sobre "${temaEspecifico}".
Retorne APENAS um JSON válido com a estrutura especificada.`;

      prompt = `Crie um material de apoio ESPECÍFICO sobre "${temaEspecifico}" para ${disciplina}, ${serie}.

ESTRUTURA OBRIGATÓRIA:
{
  "titulo": "Material de Apoio: ${temaEspecifico}",
  "conteudo": "Conteúdo HTML detalhado específico sobre ${temaEspecifico}"
}`;
      console.log('📝 [PROMPT] Prompt e systemMessage para MATERIAL DE APOIO prontos.');
    }

    // ETAPA 2: GERAR TEXTO COM OPENAI
    console.log('🤖 [OPENAI] Chamando OpenAI para geração do conteúdo...');
    console.log('🤖 [OPENAI] Enviando prompt para o tema:', temaEspecifico);

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
    console.log('✅ [OPENAI] Resposta recebida da OpenAI com sucesso.');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ [OPENAI] Estrutura de resposta inválida:', data);
      throw new Error('Invalid response structure from OpenAI');
    }

    let generatedContent = data.choices[0].message.content.trim();
    console.log('📝 [CONTEÚDO] Preview do conteúdo gerado:', generatedContent.substring(0, 200) + '...');

    // ETAPA 3: PROCESSAR E VALIDAR JSON
    console.log('🔍 [PARSE] Realizando parse do JSON gerado...');

    generatedContent = generatedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
      console.log('✅ [PARSE] Parse do JSON realizado com sucesso.');
      
      // Removido: Validação do tema para slides
      // if (materialType === 'slides') {
      //   const temaPresente = parsedContent.tema && (
      //     parsedContent.tema.toLowerCase().includes(temaEspecifico.toLowerCase()) ||
      //     parsedContent.conceitos.toLowerCase().includes(temaEspecifico.toLowerCase()) ||
      //     parsedContent.introducao.toLowerCase().includes(temaEspecifico.toLowerCase())
      //   );
      //   if (!temaPresente) {
      //     console.error('❌ [VALIDAÇÃO] Conteúdo não contém o tema solicitado:', temaEspecifico);
      //     console.error('❌ [VALIDAÇÃO] Título:', parsedContent.tema);
      //     console.error('❌ [VALIDAÇÃO] Conceitos:', parsedContent.conceitos);
      //     throw new Error(`Conteúdo gerado não é específico para o tema: ${temaEspecifico}`);
      //   }
      //   console.log('✅ [VALIDAÇÃO] Conteúdo validado para o tema:', temaEspecifico);
      // }
      
    } catch (parseError) {
      console.error('❌ [PARSE] Falha ao fazer parse do JSON:', parseError);
      console.error('❌ [PARSE] Conteúdo raw:', generatedContent);
      throw new Error('Generated content is not valid JSON');
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
            throw new Error(`Falha na geração de imagem para ${type}: ${error.message}`);
          }
        } else {
          console.warn(`⚠️ [${i + 1}/${imageFields.length}] Prompt não encontrado para ${type}`);
        }
      }

      console.log('✅ [IMAGENS] Todas as imagens para SLIDES foram processadas com sucesso.');

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
    console.log('🏁 [FINALIZAÇÃO] Material gerado e processado com sucesso!');
    console.log('🏁 [FINALIZAÇÃO] Tipo:', materialType, '| Tema:', temaEspecifico, '| Disciplina:', disciplina, '| Série:', serie);

    return new Response(JSON.stringify({ 
      success: true, 
      content: parsedContent 
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
