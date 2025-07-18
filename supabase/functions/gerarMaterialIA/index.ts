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

      1. **Explicação Simples do Tema** - Definição clara e simples do conceito principal (máximo 150 palavras)
      2. **Por que é Importante** - Relevância do tema na vida dos alunos (máximo 150 palavras)
      3. **Como Funciona** - Explicação do processo ou funcionamento (máximo 200 palavras)
      4. **Exemplos do Dia a Dia** - Situações reais e cotidianas (máximo 200 palavras)
      5. **Dicas de Estudo** - Pontos-chave e observações relevantes (máximo 150 palavras)
      6. **Atividades Práticas** - Exercícios simples para fixação (máximo 200 palavras)
      7. **Curiosidades** - Informações interessantes e complementares (máximo 150 palavras)

      FORMATO DE RESPOSTA:
      Retorne apenas um JSON válido com a seguinte estrutura:

      {
        "titulo": "Título do Material de Apoio",
        "tema_material_principal": "${formData.tema}",
        "explicacao_simples": "Conteúdo da seção 1",
        "por_que_importante": "Conteúdo da seção 2", 
        "como_funciona": "Conteúdo da seção 3",
        "exemplos_dia_a_dia": "Conteúdo da seção 4",
        "dicas_estudo": "Conteúdo da seção 5",
        "atividades_praticas": "Conteúdo da seção 6",
        "curiosidades": "Conteúdo da seção 7"
      }

      IMPORTANTE:
      - Cada seção deve respeitar o limite de palavras especificado
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
          "tema_material_principal": "string",
          "explicacao_simples": "string",
          "por_que_importante": "string",
          "como_funciona": "string", 
          "exemplos_dia_a_dia": "string",
          "dicas_estudo": "string",
          "atividades_praticas": "string",
          "curiosidades": "string"
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
    if (materialType === 'apoio' && parsedContent) {
      // Novo template HTML para Material de Apoio
      htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Material de Apoio - ${parsedContent.titulo || 'Conteúdo de Apoio'}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Inter', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }
                
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    overflow: hidden;
                    position: relative;
                }
                
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="60" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="70" cy="30" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                    animation: float 20s ease-in-out infinite;
                    pointer-events: none;
                }
                
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(-20px, -20px) rotate(2deg); }
                }
                
                .brand {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 20px;
                    position: relative;
                    z-index: 2;
                }
                
                .logo {
                    width: 50px;
                    height: 50px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                
                .logo svg {
                    width: 28px;
                    height: 28px;
                    stroke: white;
                    fill: none;
                    stroke-width: 2;
                }
                
                .brand-text h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                
                .brand-text p {
                    font-size: 0.9rem;
                    opacity: 0.9;
                    margin: 5px 0 0 0;
                    font-weight: 300;
                }
                
                .subtitle {
                    font-size: 1.2rem;
                    opacity: 0.9;
                    font-weight: 300;
                    position: relative;
                    z-index: 2;
                }
                
                .content {
                    padding: 50px;
                }
                
                .title {
                    text-align: center;
                    margin-bottom: 40px;
                }
                
                .title h2 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 10px;
                    line-height: 1.2;
                }
                
                .theme-highlight {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 8px 20px;
                    border-radius: 25px;
                    font-size: 1rem;
                    font-weight: 500;
                    margin-bottom: 30px;
                }
                
                .section {
                    margin-bottom: 40px;
                    padding: 30px;
                    background: #f8fafc;
                    border-radius: 16px;
                    border-left: 5px solid #667eea;
                    position: relative;
                    overflow: hidden;
                }
                
                .section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                    border-radius: 50%;
                    transform: translate(30px, -30px);
                    pointer-events: none;
                }
                
                .section h3 {
                    color: #667eea;
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    position: relative;
                    z-index: 1;
                }
                
                .section-icon {
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                    font-weight: bold;
                    flex-shrink: 0;
                }
                
                .section-content {
                    font-size: 1rem;
                    line-height: 1.7;
                    color: #4a5568;
                    position: relative;
                    z-index: 1;
                }
                
                .section-content p {
                    margin-bottom: 15px;
                }
                
                .section-content ul, .section-content ol {
                    margin-left: 20px;
                    margin-bottom: 15px;
                }
                
                .section-content li {
                    margin-bottom: 8px;
                }
                
                .section-content strong {
                    color: #2d3748;
                    font-weight: 600;
                }
                
                .section-content em {
                    color: #667eea;
                    font-style: italic;
                }
                
                .footer {
                    background: #2d3748;
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                
                .footer-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 15px;
                }
                
                .footer-logo {
                    width: 40px;
                    height: 40px;
                    background: rgba(102, 126, 234, 0.2);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .footer-logo svg {
                    width: 20px;
                    height: 20px;
                    stroke: #667eea;
                    fill: none;
                    stroke-width: 2;
                }
                
                .footer-text {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #667eea;
                }
                
                .footer-tagline {
                    font-size: 0.9rem;
                    opacity: 0.8;
                    font-style: italic;
                }
                
                .footer-bottom {
                    font-size: 0.8rem;
                    opacity: 0.7;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding-top: 15px;
                }
                
                @media (max-width: 768px) {
                    body {
                        padding: 10px;
                    }
                    
                    .header {
                        padding: 30px 20px;
                    }
                    
                    .brand {
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .brand-text h1 {
                        font-size: 1.5rem;
                    }
                    
                    .content {
                        padding: 30px 20px;
                    }
                    
                    .title h2 {
                        font-size: 2rem;
                    }
                    
                    .section {
                        padding: 20px;
                    }
                    
                    .section h3 {
                        font-size: 1.3rem;
                    }
                    
                    .footer {
                        padding: 20px;
                    }
                    
                    .footer-content {
                        flex-direction: column;
                        gap: 10px;
                    }
                }
                
                @media print {
                    body {
                        background: white;
                        padding: 0;
                    }
                    
                    .container {
                        box-shadow: none;
                        border-radius: 0;
                    }
                    
                    .header::before {
                        display: none;
                    }
                    
                    .section::before {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="brand">
                        <div class="logo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                            </svg>
                        </div>
                        <div class="brand-text">
                            <h1>AulagIA</h1>
                            <p>Sua aula com toque mágico</p>
                        </div>
                    </div>
                    <div class="subtitle">Material de Apoio Educacional</div>
                </div>
                
                <div class="content">
                    <div class="title">
                        <h2>${parsedContent.titulo || 'Material de Apoio'}</h2>
                        <div class="theme-highlight">Tema: ${parsedContent.tema_material_principal || formData.tema}</div>
                    </div>
                    
                    <div class="section">
                        <h3>
                            <div class="section-icon">💡</div>
                            Explicação Simples do Tema
                        </h3>
                        <div class="section-content">
                            ${parsedContent.explicacao_simples || 'Conteúdo não disponível'}
                        </div>
                    </div>
                    
                    <div class="section">
                        <h3>
                            <div class="section-icon">🎯</div>
                            Por que é Importante?
                        </h3>
                        <div class="section-content">
                            ${parsedContent.por_que_importante || 'Conteúdo não disponível'}
                        </div>
                    </div>
                    
                    <div class="section">
                        <h3>
                            <div class="section-icon">⚙️</div>
                            Como Funciona?
                        </h3>
                        <div class="section-content">
                            ${parsedContent.como_funciona || 'Conteúdo não disponível'}
                        </div>
                    </div>
                    
                    <div class="section">
                        <h3>
                            <div class="section-icon">🌟</div>
                            Exemplos do Dia a Dia
                        </h3>
                        <div class="section-content">
                            ${parsedContent.exemplos_dia_a_dia || 'Conteúdo não disponível'}
                        </div>
                    </div>
                    
                    <div class="section">
                        <h3>
                            <div class="section-icon">📚</div>
                            Dicas de Estudo
                        </h3>
                        <div class="section-content">
                            ${parsedContent.dicas_estudo || 'Conteúdo não disponível'}
                        </div>
                    </div>
                    
                    <div class="section">
                        <h3>
                            <div class="section-icon">✏️</div>
                            Atividades Práticas
                        </h3>
                        <div class="section-content">
                            ${parsedContent.atividades_praticas || 'Conteúdo não disponível'}
                        </div>
                    </div>
                    
                    <div class="section">
                        <h3>
                            <div class="section-icon">🔍</div>
                            Curiosidades
                        </h3>
                        <div class="section-content">
                            ${parsedContent.curiosidades || 'Conteúdo não disponível'}
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <div class="footer-content">
                        <div class="footer-logo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                            </svg>
                        </div>
                        <div>
                            <div class="footer-text">AulagIA</div>
                            <div class="footer-tagline">Sua aula com toque mágico</div>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        Material de Apoio gerado em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br
                    </div>
                </div>
            </div>
        </body>
        </html>
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
