import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { materialType, formData } = await req.json();
    
    console.log('📋 Generating material:', { materialType, formData });
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let prompt = '';
    let responseStructure = '';

    if (materialType === 'exercicio') {
      prompt = `
      Você é um assistente pedagógico especializado em criar exercícios educativos envolventes e eficazes.
      
      INFORMAÇÕES FORNECIDAS:
      - Tema: ${formData.tema}
      - Disciplina: ${formData.disciplina}
      - Série/Ano: ${formData.serie}
      - Tipo de Exercício: ${formData.tipoExercicio || 'Não especificado'}
      - Objetivos: ${Array.isArray(formData.objetivos) ? formData.objetivos.join(', ') : (formData.objetivos || 'Não especificado')}
      - Recursos: ${formData.recursos || 'Não especificado'}
      
      INSTRUÇÕES ESPECÍFICAS:
      1. Crie um exercício educativo completo e bem estruturado.
      2. Use linguagem clara e adequada ao nível dos alunos.
      3. Inclua exemplos práticos e situações do cotidiano.
      4. Organize o conteúdo de forma lógica e progressiva.
      5. Mantenha o foco no tema principal.
      6. Evite linguagem muito técnica ou complexa.
      7. Inclua elementos visuais quando apropriado (descrições de imagens, diagramas, etc.).
      
      ESTRUTURA OBRIGATÓRIA:
      O exercício deve conter exatamente as seguintes seções:
      
      1. **Título do Exercício:** Título claro e conciso do exercício.
      2. **Objetivos:** Descreva os objetivos de aprendizado do exercício.
      3. **Instruções:** Forneça instruções detalhadas sobre como realizar o exercício.
      4. **Materiais Necessários:** Liste todos os materiais necessários para realizar o exercício.
      5. **Passos:** Descreva os passos detalhados para completar o exercício.
      6. **Exemplo:** Forneça um exemplo de como o exercício deve ser realizado.
      7. **Avaliação:** Explique como o exercício será avaliado.
      
      FORMATO DE RESPOSTA:
      Retorne apenas um JSON válido com a seguinte estrutura:
      
      {
        "titulo": "Título do Exercício",
        "objetivos": ["Objetivo 1", "Objetivo 2"],
        "instrucoes": "Instruções detalhadas",
        "materiais_necessarios": ["Material 1", "Material 2"],
        "passos": ["Passo 1", "Passo 2"],
        "exemplo": "Exemplo de como realizar o exercício",
        "avaliacao": "Critérios de avaliação"
      }
      
      IMPORTANTE:
      - Cada seção deve ter entre 100-200 palavras.
      - Use formatação HTML simples quando necessário (negrito, itálico, listas).
      - Mantenha a linguagem adequada à faixa etária.
      - Seja prático e objetivo.
      - Não use markdown, apenas HTML simples.
      - Retorne APENAS o JSON válido, sem texto adicional.
      `;
      
      responseStructure = `
      Estrutura esperada:
      {
        "titulo": "string",
        "objetivos": ["string"],
        "instrucoes": "string",
        "materiais_necessarios": ["string"],
        "passos": ["string"],
        "exemplo": "string",
        "avaliacao": "string"
      }
      `;
    }

    if (materialType === 'apoio') {
      prompt = `
      Você é um assistente pedagógico especializado em criar materiais de apoio didático para professores. 
      Sua função é gerar conteúdo claro, prático e acessível que ajude os alunos a compreender melhor os temas apresentados em aula.

      INFORMAÇÕES DO MATERIAL:
      - Tema: ${formData.tema}
      - Disciplina: ${formData.disciplina}
      - Série/Ano: ${formData.serie}
      - Título do Material Principal: ${formData.titulo || 'Não especificado'}
      - Objetivos: ${Array.isArray(formData.objetivos) ? formData.objetivos.join(', ') : (formData.objetivos || 'Não especificado')}

      INSTRUÇÕES ESPECÍFICAS:
      1. Crie um material de apoio completo e estruturado
      2. Use linguagem clara e adequada ao nível dos alunos
      3. Inclua exemplos práticos e situações do cotidiano
      4. Organize o conteúdo de forma lógica e progressiva
      5. Mantenha o foco no tema principal
      6. Evite linguagem muito técnica ou complexa
      7. Inclua elementos visuais quando apropriado (descrições de imagens, diagramas, etc.)

      ESTRUTURA OBRIGATÓRIA - O material deve conter exatamente estas 7 seções:

      1. **O que é?** - Definição clara e simples do conceito principal
      2. **Por que é importante?** - Relevância do tema na vida dos alunos
      3. **Como funciona?** - Explicação do processo ou funcionamento
      4. **Exemplos práticos** - Situações reais e cotidianas
      5. **Dicas importantes** - Pontos-chave e observações relevantes
      6. **Atividades sugeridas** - Exercícios simples para fixação
      7. **Saiba mais** - Curiosidades e informações complementares

      FORMATO DE RESPOSTA:
      Retorne apenas um JSON válido com a seguinte estrutura:

      {
        "titulo": "Título do Material de Apoio",
        "conteudo": {
          "o_que_e": "Conteúdo da seção 1",
          "por_que_importante": "Conteúdo da seção 2", 
          "como_funciona": "Conteúdo da seção 3",
          "exemplos_praticos": "Conteúdo da seção 4",
          "dicas_importantes": "Conteúdo da seção 5",
          "atividades_sugeridas": "Conteúdo da seção 6",
          "saiba_mais": "Conteúdo da seção 7"
        }
      }

      IMPORTANTE:
      - Cada seção deve ter entre 100-200 palavras
      - Use formatação HTML simples quando necessário (negrito, itálico, listas)
      - Mantenha a linguagem adequada à faixa etária
      - Seja prático e objetivo
      - Não use markdown, apenas HTML simples
      - Retorne APENAS o JSON válido, sem texto adicional
      `;

      responseStructure = `
        Estrutura esperada:
        {
          "titulo": "string",
          "conteudo": {
            "o_que_e": "string",
            "por_que_importante": "string",
            "como_funciona": "string", 
            "exemplos_praticos": "string",
            "dicas_importantes": "string",
            "atividades_sugeridas": "string",
            "saiba_mais": "string"
          }
        }
      `;
    } else if (materialType === 'plano_aula') {
      prompt = `
      Você é um assistente pedagógico especializado em criar planos de aula detalhados e práticos para professores.
      
      INFORMAÇÕES FORNECIDAS:
      - Tema: ${formData.tema}
      - Disciplina: ${formData.disciplina}
      - Série/Ano: ${formData.serie}
      - Duração: ${formData.duracao || '50 minutos'}
      - Objetivos: ${Array.isArray(formData.objetivos) ? formData.objetivos.join(', ') : (formData.objetivos || 'Não especificado')}
      - Recursos: ${formData.recursos || 'Não especificado'}
      - Metodologia: ${formData.metodologia || 'Não especificado'}

      INSTRUÇÕES ESPECÍFICAS:
      1. Elabore um plano de aula completo e bem estruturado.
      2. Use linguagem clara e adequada ao nível dos alunos.
      3. Inclua exemplos práticos e situações do cotidiano.
      4. Organize o conteúdo de forma lógica e progressiva.
      5. Mantenha o foco no tema principal.
      6. Evite linguagem muito técnica ou complexa.
      7. Inclua elementos visuais quando apropriado (descrições de imagens, diagramas, etc.).

      ESTRUTURA OBRIGATÓRIA:
      O plano de aula deve conter exatamente as seguintes seções:

      1. **Título:** Título claro e conciso do plano de aula.
      2. **Tema:** Tema principal da aula.
      3. **Disciplina:** Disciplina relacionada ao tema.
      4. **Série/Ano:** Série ou ano escolar para o qual o plano de aula é destinado.
      5. **Duração:** Tempo estimado para a realização da aula.
      6. **Objetivos:** Objetivos de aprendizado que os alunos devem alcançar.
      7. **Recursos:** Materiais e recursos necessários para a aula.
      8. **Metodologia:** Estratégias e métodos de ensino a serem utilizados.
      9. **Desenvolvimento:**
          - **Introdução:** Atividades iniciais para engajar os alunos.
          - **Desenvolvimento:** Atividades principais para explorar o tema.
          - **Conclusão:** Atividades finais para consolidar o aprendizado.
      10. **Avaliação:** Métodos para avaliar o aprendizado dos alunos.
      11. **Observações:** Notas adicionais ou informações relevantes.

      FORMATO DE RESPOSTA:
      Retorne apenas um JSON válido com a seguinte estrutura:

      {
        "titulo": "Título do Plano de Aula",
        "tema": "Tema Principal",
        "disciplina": "Disciplina",
        "serie": "Série/Ano",
        "duracao": "Tempo Estimado",
        "objetivos": ["Objetivo 1", "Objetivo 2"],
        "recursos": ["Recurso 1", "Recurso 2"],
        "metodologia": "Metodologia de Ensino",
        "desenvolvimento": {
          "introducao": "Atividades Iniciais",
          "desenvolvimento": "Atividades Principais",
          "conclusao": "Atividades Finais"
        },
        "avaliacao": "Métodos de Avaliação",
        "observacoes": "Notas Adicionais"
      }

      IMPORTANTE:
      - Cada seção deve ter entre 100-200 palavras.
      - Use formatação HTML simples quando necessário (negrito, itálico, listas).
      - Mantenha a linguagem adequada à faixa etária.
      - Seja prático e objetivo.
      - Não use markdown, apenas HTML simples.
      - Retorne APENAS o JSON válido, sem texto adicional.
      `;

      responseStructure = `
        Estrutura esperada:
        {
          "titulo": "string",
          "tema": "string",
          "disciplina": "string",
          "serie": "string",
          "duracao": "string",
          "objetivos": ["string"],
          "recursos": ["string"],
          "metodologia": "string",
          "desenvolvimento": {
            "introducao": "string",
            "desenvolvimento": "string",
            "conclusao": "string"
          },
          "avaliacao": "string",
          "observacoes": "string"
        }
      `;
    } else if (materialType === 'atividade') {
      prompt = `
      Você é um assistente pedagógico especializado em criar atividades educacionais envolventes e eficazes.
      
      INFORMAÇÕES FORNECIDAS:
      - Tema: ${formData.tema}
      - Disciplina: ${formData.disciplina}
      - Série/Ano: ${formData.serie}
      - Tipo de Atividade: ${formData.tipoAtividade || 'Não especificado'}
      - Objetivos: ${Array.isArray(formData.objetivos) ? formData.objetivos.join(', ') : (formData.objetivos || 'Não especificado')}
      - Recursos: ${formData.recursos || 'Não especificado'}

      INSTRUÇÕES ESPECÍFICAS:
      1. Elabore uma atividade educacional completa e bem estruturada.
      2. Use linguagem clara e adequada ao nível dos alunos.
      3. Inclua exemplos práticos e situações do cotidiano.
      4. Organize o conteúdo de forma lógica e progressiva.
      5. Mantenha o foco no tema principal.
      6. Evite linguagem muito técnica ou complexa.
      7. Inclua elementos visuais quando apropriado (descrições de imagens, diagramas, etc.).

      ESTRUTURA OBRIGATÓRIA:
      A atividade deve conter exatamente as seguintes seções:

      1. **Título:** Título claro e conciso da atividade.
      2. **Tema:** Tema principal da atividade.
      3. **Disciplina:** Disciplina relacionada ao tema.
      4. **Série/Ano:** Série ou ano escolar para o qual a atividade é destinada.
      5. **Tipo de Atividade:** Tipo de atividade (ex: jogo, experimento, discussão).
      6. **Objetivos:** Objetivos de aprendizado que os alunos devem alcançar.
      7. **Recursos:** Materiais e recursos necessários para a atividade.
      8. **Instruções:** Passos detalhados para realizar a atividade.
      9. **Desenvolvimento:** Descrição detalhada de como a atividade deve ser conduzida.
      10. **Avaliação:** Métodos para avaliar o aprendizado dos alunos durante a atividade.
      11. **Tempo Estimado:** Tempo estimado para a realização da atividade.

      FORMATO DE RESPOSTA:
      Retorne apenas um JSON válido com a seguinte estrutura:

      {
        "titulo": "Título da Atividade",
        "tema": "Tema Principal",
        "disciplina": "Disciplina",
        "serie": "Série/Ano",
        "tipo_atividade": "Tipo de Atividade",
        "objetivos": ["Objetivo 1", "Objetivo 2"],
        "recursos": ["Recurso 1", "Recurso 2"],
        "instrucoes": "Instruções Detalhadas",
        "desenvolvimento": "Descrição Detalhada",
        "avaliacao": "Métodos de Avaliação",
        "tempo_estimado": "Tempo Estimado"
      }

      IMPORTANTE:
      - Cada seção deve ter entre 100-200 palavras.
      - Use formatação HTML simples quando necessário (negrito, itálico, listas).
      - Mantenha a linguagem adequada à faixa etária.
      - Seja prático e objetivo.
      - Não use markdown, apenas HTML simples.
      - Retorne APENAS o JSON válido, sem texto adicional.
      `;

      responseStructure = `
        Estrutura esperada:
        {
          "titulo": "string",
          "tema": "string",
          "disciplina": "string",
          "serie": "string",
          "tipo_atividade": "string",
          "objetivos": ["string"],
          "recursos": ["string"],
          "instrucoes": "string",
          "desenvolvimento": "string",
          "avaliacao": "string",
          "tempo_estimado": "string"
        }
      `;
    } else if (materialType === 'avaliacao') {
      prompt = `
      Você é um assistente pedagógico especializado em criar avaliações educacionais justas e abrangentes.
      
      INFORMAÇÕES FORNECIDAS:
      - Tema: ${formData.tema}
      - Disciplina: ${formData.disciplina}
      - Série/Ano: ${formData.serie}
      - Tipo de Avaliação: ${formData.tipoAvaliacao || 'Não especificado'}
      - Objetivos: ${Array.isArray(formData.objetivos) ? formData.objetivos.join(', ') : (formData.objetivos || 'Não especificado')}
      - Número de Questões: ${formData.numeroQuestoes || '10'}

      INSTRUÇÕES ESPECÍFICAS:
      1. Elabore uma avaliação educacional completa e bem estruturada.
      2. Use linguagem clara e adequada ao nível dos alunos.
      3. Inclua exemplos práticos e situações do cotidiano.
      4. Organize o conteúdo de forma lógica e progressiva.
      5. Mantenha o foco no tema principal.
      6. Evite linguagem muito técnica ou complexa.
      7. Inclua elementos visuais quando apropriado (descrições de imagens, diagramas, etc.).

      ESTRUTURA OBRIGATÓRIA:
      A avaliação deve conter exatamente as seguintes seções:

      1. **Título:** Título claro e conciso da avaliação.
      2. **Tema:** Tema principal da avaliação.
      3. **Disciplina:** Disciplina relacionada ao tema.
      4. **Série/Ano:** Série ou ano escolar para o qual a avaliação é destinada.
      5. **Tipo de Avaliação:** Tipo de avaliação (ex: prova, teste, questionário).
      6. **Instruções:** Instruções claras e concisas para os alunos.
      7. **Questões:** Lista de questões com enunciados claros e objetivos.
          - Cada questão deve ter um número, enunciado, tipo (ex: múltipla escolha, dissertativa) e opções (se aplicável).
      8. **Gabarito:** Respostas corretas para cada questão, com justificativas (se necessário).

      FORMATO DE RESPOSTA:
      Retorne apenas um JSON válido com a seguinte estrutura:

      {
        "titulo": "Título da Avaliação",
        "tema": "Tema Principal",
        "disciplina": "Disciplina",
        "serie": "Série/Ano",
        "tipo_avaliacao": "Tipo de Avaliação",
        "instrucoes": "Instruções para os Alunos",
        "questoes": [
          {
            "numero": 1,
            "enunciado": "Enunciado da Questão",
            "tipo": "Tipo da Questão",
            "opcoes": ["Opção A", "Opção B", "Opção C", "Opção D"] // Apenas para múltipla escolha
          }
        ],
        "gabarito": [
          {
            "questao": 1,
            "resposta": "Resposta Correta",
            "justificativa": "Justificativa da Resposta"
          }
        ]
      }

      IMPORTANTE:
      - Cada seção deve ter entre 100-200 palavras.
      - Use formatação HTML simples quando necessário (negrito, itálico, listas).
      - Mantenha a linguagem adequada à faixa etária.
      - Seja prático e objetivo.
      - Não use markdown, apenas HTML simples.
      - Retorne APENAS o JSON válido, sem texto adicional.
      `;

      responseStructure = `
        Estrutura esperada:
        {
          "titulo": "string",
          "tema": "string",
          "disciplina": "string",
          "serie": "string",
          "tipo_avaliacao": "string",
          "instrucoes": "string",
          "questoes": [
            {
              "numero": 1,
              "enunciado": "string",
              "tipo": "string",
              "opcoes": ["string"] // apenas para múltipla escolha
            }
          ],
          "gabarito": [
            {
              "questao": 1,
              "resposta": "string",
              "justificativa": "string"
            }
          ]
        }
      `;
    } else if (materialType === 'slide') {
      prompt = `
      Você é um assistente pedagógico especializado em criar apresentações em slides educacionais dinâmicas e visuais.
      
      INFORMAÇÕES FORNECIDAS:
      - Tema: ${formData.tema}
      - Disciplina: ${formData.disciplina}
      - Série/Ano: ${formData.serie}
      - Objetivos: ${Array.isArray(formData.objetivos) ? formData.objetivos.join(', ') : (formData.objetivos || 'Não especificado')}
      - Número de Slides: ${formData.numeroSlides || '10'}

      INSTRUÇÕES ESPECÍFICAS:
      1. Elabore uma apresentação em slides completa e bem estruturada.
      2. Use linguagem clara e adequada ao nível dos alunos.
      3. Inclua exemplos práticos e situações do cotidiano.
      4. Organize o conteúdo de forma lógica e progressiva.
      5. Mantenha o foco no tema principal.
      6. Evite linguagem muito técnica ou complexa.
      7. Inclua elementos visuais quando apropriado (imagens, gráficos, etc.).

      ESTRUTURA OBRIGATÓRIA:
      A apresentação deve conter exatamente as seguintes seções:

      1. **Título:** Título claro e conciso da apresentação.
      2. **Tema:** Tema principal da apresentação.
      3. **Disciplina:** Disciplina relacionada ao tema.
      4. **Série/Ano:** Série ou ano escolar para o qual a apresentação é destinada.
      5. **Slides:** Lista de slides com títulos e conteúdos claros e objetivos.
          - Cada slide deve ter um número, título, conteúdo e observações (se necessário).

      FORMATO DE RESPOSTA:
      Retorne apenas um JSON válido com a seguinte estrutura:

      {
        "titulo": "Título da Apresentação",
        "tema": "Tema Principal",
        "disciplina": "Disciplina",
        "serie": "Série/Ano",
        "slides": [
          {
            "numero": 1,
            "titulo": "Título do Slide",
            "conteudo": "Conteúdo do Slide",
            "observacoes": "Observações Adicionais"
          }
        ]
      }

      IMPORTANTE:
      - Cada seção deve ter entre 100-200 palavras.
      - Use formatação HTML simples quando necessário (negrito, itálico, listas).
      - Mantenha a linguagem adequada à faixa etária.
      - Seja prático e objetivo.
      - Não use markdown, apenas HTML simples.
      - Retorne APENAS o JSON válido, sem texto adicional.
      `;

      responseStructure = `
        Estrutura esperada:
        {
          "titulo": "string",
          "tema": "string",
          "disciplina": "string",
          "serie": "string",
          "slides": [
            {
              "numero": 1,
              "titulo": "string",
              "conteudo": "string",
              "observacoes": "string"
            }
          ]
        }
      `;
    } else {
      throw new Error(`Tipo de material não suportado: ${materialType}`);
    }

    console.log('🎯 Generated prompt for', materialType);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente pedagógico especializado em criar materiais educacionais. Responda sempre em português brasileiro e retorne apenas JSON válido.'
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

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const content = data.choices[0].message.content;
    console.log('🤖 OpenAI response:', content);

    let parsedContent;
    try {
      // Remove possible markdown formatting
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (error) {
      console.error('JSON parsing error:', error);
      console.error('Raw content:', content);
      throw new Error(`Erro ao processar resposta da IA: ${error.message}`);
    }

    // Convert structured content to HTML for apoio materials
    let htmlContent = '';
    if (materialType === 'apoio' && parsedContent.conteudo) {
      htmlContent = `
        <div class="material-apoio">
          <h1>${parsedContent.titulo}</h1>
          
          <div class="secao">
            <h2>💡 O que é?</h2>
            <div class="conteudo-secao">${parsedContent.conteudo.o_que_e}</div>
          </div>
          
          <div class="secao">
            <h2>🎯 Por que é importante?</h2>
            <div class="conteudo-secao">${parsedContent.conteudo.por_que_importante}</div>
          </div>
          
          <div class="secao">
            <h2>⚙️ Como funciona?</h2>
            <div class="conteudo-secao">${parsedContent.conteudo.como_funciona}</div>
          </div>
          
          <div class="secao">
            <h2>🌟 Exemplos práticos</h2>
            <div class="conteudo-secao">${parsedContent.conteudo.exemplos_praticos}</div>
          </div>
          
          <div class="secao">
            <h2>📌 Dicas importantes</h2>
            <div class="conteudo-secao">${parsedContent.conteudo.dicas_importantes}</div>
          </div>
          
          <div class="secao">
            <h2>📝 Atividades sugeridas</h2>
            <div class="conteudo-secao">${parsedContent.conteudo.atividades_sugeridas}</div>
          </div>
          
          <div class="secao">
            <h2>🔍 Saiba mais</h2>
            <div class="conteudo-secao">${parsedContent.conteudo.saiba_mais}</div>
          </div>
        </div>
        
        <style>
          .material-apoio {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          
          .material-apoio h1 {
            color: #2563eb;
            font-size: 2em;
            margin-bottom: 30px;
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
          }
          
          .secao {
            margin-bottom: 30px;
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            border-left: 4px solid #3b82f6;
          }
          
          .secao h2 {
            color: #1e40af;
            font-size: 1.3em;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .conteudo-secao {
            font-size: 1em;
            line-height: 1.7;
            color: #374151;
          }
          
          .conteudo-secao p {
            margin-bottom: 12px;
          }
          
          .conteudo-secao ul, .conteudo-secao ol {
            margin-left: 20px;
            margin-bottom: 12px;
          }
          
          .conteudo-secao li {
            margin-bottom: 6px;
          }
          
          .conteudo-secao strong {
            color: #1f2937;
            font-weight: 600;
          }
          
          .conteudo-secao em {
            color: #6b7280;
            font-style: italic;
          }
          
          @media (max-width: 768px) {
            .material-apoio {
              padding: 15px;
            }
            
            .secao {
              padding: 15px;
            }
            
            .material-apoio h1 {
              font-size: 1.6em;
            }
            
            .secao h2 {
              font-size: 1.2em;
            }
          }
        </style>
      `;
    }

    // Save to database for apoio materials
    if (materialType === 'apoio') {
      try {
        const { error: saveError } = await supabase
          .from('materiais_apoio')
          .insert({
            user_id: formData.user_id,
            material_principal_id: formData.material_principal_id,
            titulo: parsedContent.titulo,
            tema: formData.tema,
            disciplina: formData.disciplina,
            turma: formData.serie,
            conteudo: htmlContent,
            status: 'ativo'
          });

        if (saveError) {
          console.error('Error saving apoio material:', saveError);
          throw new Error(`Erro ao salvar material de apoio: ${saveError.message}`);
        }

        console.log('✅ Material de apoio salvo com sucesso');
      } catch (error) {
        console.error('Database save error:', error);
        throw new Error(`Erro ao salvar no banco: ${error.message}`);
      }
    }

    // Return the content (HTML for apoio, JSON for others)
    const finalContent = materialType === 'apoio' ? htmlContent : parsedContent;

    return new Response(
      JSON.stringify({
        success: true,
        content: finalContent,
        message: 'Material gerado com sucesso!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in gerarMaterialIA:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
