
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

// Função para gerar imagem via edge function
async function generateImage(prompt: string): Promise<string> {
  try {
    console.log('🎨 Gerando imagem para prompt:', prompt);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/gerarImagemIA`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    if (!response.ok) {
      console.error('❌ Erro na geração de imagem:', response.status, response.statusText);
      throw new Error(`Falha na geração de imagem: ${response.status}`);
    }

    const result = await response.json();
    if (result.success && result.imageUrl) {
      console.log('✅ Imagem gerada com sucesso');
      return result.imageUrl;
    } else {
      console.error('❌ Falha na geração de imagem:', result.error);
      throw new Error(`Erro na geração: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Erro ao chamar gerarImagemIA:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialType, formData } = await req.json();
    console.log('🚀 Generating material:', materialType, formData);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Extrair o tema específico dos dados do formulário
    const temaEspecifico = formData.tema || formData.topic || '';
    const disciplina = formData.disciplina || formData.subject || '';
    const serie = formData.serie || formData.grade || '';

    console.log('📋 Tema específico extraído:', temaEspecifico);
    console.log('📋 Disciplina:', disciplina);
    console.log('📋 Série:', serie);

    if (!temaEspecifico.trim()) {
      throw new Error('Tema não fornecido no formData');
    }

    let prompt = '';
    let systemMessage = '';

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
  "tema_imagem": "Ilustração educativa sobre ${temaEspecifico} para ${disciplina}",
  "introducao_imagem": "Ilustração introdutória de ${temaEspecifico}",
  "conceitos_imagem": "Diagrama dos conceitos de ${temaEspecifico}",
  "desenvolvimento_1_imagem": "Ilustração do primeiro aspecto de ${temaEspecifico}",
  "desenvolvimento_2_imagem": "Ilustração do segundo aspecto de ${temaEspecifico}",
  "desenvolvimento_3_imagem": "Ilustração do terceiro aspecto de ${temaEspecifico}",
  "desenvolvimento_4_imagem": "Ilustração do quarto aspecto de ${temaEspecifico}",
  "exemplo_imagem": "Exemplo visual de ${temaEspecifico}"
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
2. NÃO mencione outros temas matemáticos além de "${temaEspecifico}"
3. Use linguagem adequada para ${serie}
4. Foque em conceitos, exemplos e aplicações específicas de "${temaEspecifico}"
5. Cada campo do JSON deve conter conteúdo educativo específico sobre "${temaEspecifico}"

VALIDAÇÃO: Se o JSON gerado mencionar qualquer tema diferente de "${temaEspecifico}", refaça completamente.

Retorne APENAS o JSON com conteúdo específico sobre "${temaEspecifico}".`;

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

    console.log('📤 Enviando solicitação para OpenAI com tema específico:', temaEspecifico);
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
        temperature: 0.1, // Muito baixo para máxima consistência
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI');
    }

    let generatedContent = data.choices[0].message.content.trim();
    console.log('📝 Generated content preview:', generatedContent.substring(0, 500));

    // Limpar conteúdo para garantir JSON válido
    generatedContent = generatedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Tentar fazer parse do JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
      console.log('✅ JSON parsed successfully');
      
      // VALIDAÇÃO ADICIONAL: Verificar se o conteúdo é realmente sobre o tema
      if (materialType === 'slides') {
        const temaNoTitulo = parsedContent.tema && parsedContent.tema.toLowerCase().includes(temaEspecifico.toLowerCase());
        const temaNoConteudo = parsedContent.conceitos && parsedContent.conceitos.toLowerCase().includes(temaEspecifico.toLowerCase());
        
        if (!temaNoTitulo || !temaNoConteudo) {
          console.error('❌ Conteúdo gerado não é específico para o tema:', temaEspecifico);
          console.error('❌ Título:', parsedContent.tema);
          console.error('❌ Conceitos:', parsedContent.conceitos);
          throw new Error(`Conteúdo gerado não é específico para o tema: ${temaEspecifico}`);
        }
      }
      
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      console.error('❌ Raw content:', generatedContent);
      throw new Error('Generated content is not valid JSON');
    }

    // Processar imagens para slides
    if (materialType === 'slides') {
      console.log('🎨 Processando imagens para slides com tema:', temaEspecifico);
      
      // Lista de campos de imagem para processar
      const imageFields = [
        'tema_imagem', 'introducao_imagem', 'conceitos_imagem',
        'desenvolvimento_1_imagem', 'desenvolvimento_2_imagem',
        'desenvolvimento_3_imagem', 'desenvolvimento_4_imagem', 'exemplo_imagem'
      ];

      // Processar cada campo de imagem sequencialmente com prompts MUITO específicos
      for (const field of imageFields) {
        if (parsedContent[field]) {
          // Criar prompt EXTREMAMENTE específico baseado no tema
          let specificPrompt = `Ilustração educativa brasileira sobre ${temaEspecifico} para ${disciplina}, série ${serie}`;
          
          if (field === 'tema_imagem') {
            specificPrompt = `Capa educativa brasileira sobre ${temaEspecifico} em ${disciplina}, visual atraente para ${serie}`;
          } else if (field === 'introducao_imagem') {
            specificPrompt = `Introdução visual sobre ${temaEspecifico}, conceitos básicos para ${disciplina} ${serie}`;
          } else if (field === 'conceitos_imagem') {
            specificPrompt = `Diagrama educativo dos conceitos de ${temaEspecifico} para ${disciplina} ${serie}`;
          } else if (field.includes('desenvolvimento')) {
            const numero = field.split('_')[1];
            specificPrompt = `Ilustração específica do tópico ${numero} sobre ${temaEspecifico} em ${disciplina} para ${serie}`;
          } else if (field === 'exemplo_imagem') {
            specificPrompt = `Exemplo visual prático de ${temaEspecifico} aplicado em ${disciplina} para ${serie}`;
          }
          
          console.log(`🖼️ Gerando imagem para ${field} com prompt específico:`, specificPrompt);
          try {
            const imageUrl = await generateImage(specificPrompt);
            parsedContent[field] = imageUrl;
            console.log(`✅ Imagem gerada para ${field}`);
          } catch (error) {
            console.error(`❌ Erro ao gerar imagem para ${field}:`, error);
            throw new Error(`Falha na geração de imagem para ${field}: ${error.message}`);
          }
        }
      }

      console.log('✅ Processamento de imagens concluído');
    }

    // Validar estrutura específica para slides
    if (materialType === 'slides') {
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
          console.error(`❌ Missing required field for slides: ${field}`);
          throw new Error(`Missing required field: ${field}`);
        }
      }
      console.log('✅ All required fields present for slides');
    }

    // LOG FINAL de verificação
    console.log('📋 VERIFICAÇÃO FINAL - Tema solicitado:', temaEspecifico);
    console.log('📋 VERIFICAÇÃO FINAL - Tema no material:', parsedContent.tema);
    console.log('📋 VERIFICAÇÃO FINAL - Disciplina:', parsedContent.disciplina);

    return new Response(JSON.stringify({ 
      success: true, 
      content: parsedContent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in gerarMaterialIA:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
