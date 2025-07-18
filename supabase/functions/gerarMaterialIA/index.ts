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
      1. Crie um material de apoio completo e estruturado em 5 páginas
      2. Use linguagem clara e adequada ao nível dos alunos
      3. Inclua exemplos práticos e situações do cotidiano
      4. Organize o conteúdo de forma lógica e progressiva
      5. Mantenha o foco no tema principal
      6. Evite linguagem muito técnica ou complexa
      7. Inclua elementos visuais quando apropriado (descrições de imagens, diagramas, etc.)

      ESTRUTURA OBRIGATÓRIA - O material deve conter exatamente estas seções distribuídas em 5 páginas:

      PÁGINA 1:
      - TEMA_DO_MATERIAL_PRINCIPAL: Título principal do material
      - DISCIPLINA: Nome da disciplina
      - NIVEL_ANO: Série/ano escolar
      - TIPO_DE_MATERIAL_PRINCIPAL: Tipo do material (plano de aula, atividade, etc.)
      - TEMA_DO_MATERIAL: Tema específico
      - TURMA_DO_MATERIAL: Turma específica
      - EXPLICACAO_SIMPLES_DO_TEMA: Explicação simples do que é o tema
      - EXPLICACAO_DETALHADA_DO_TEMA: Explicação detalhada do tema
      - EXPLICACAO_SIMPLES_UTILIDADE: Por que é importante (explicação simples)
      - EXPLICACAO_DETALHADA_UTILIDADE: Por que é importante (explicação detalhada)
      - IMPORTANCIA_NA_FORMACAO_ITEM_1: Primeiro item da importância
      - IMPORTANCIA_NA_FORMACAO_ITEM_2: Segundo item da importância
      - IMPORTANCIA_NA_FORMACAO_ITEM_3: Terceiro item da importância

      PÁGINA 2:
      - EXPLICACAO_SIMPLES_ENSINO: Como ensinar (explicação simples)
      - EXPLICACAO_DETALHADA_ENSINO: Como ensinar (explicação detalhada)
      - PASSO_A_PASSO_ITEM_1_INICIAR: Primeiro passo para iniciar
      - PASSO_A_PASSO_ITEM_2_DESENVOLVER: Segundo passo para desenvolver
      - PASSO_A_PASSO_ITEM_3_CONCLUIR: Terceiro passo para concluir
      - HIGHLIGHT_TITULO_1: Título do destaque
      - HIGHLIGHT_TEXTO_1: Texto do destaque
      - PARAGRAFO_COMO_ENSINAR_P3: Parágrafo adicional sobre como ensinar
      - SUGESTAO_VISUAL_OU_CONCRETA_ITEM_1: Primeira sugestão visual/concreta
      - SUGESTAO_VISUAL_OU_CONCRETA_ITEM_2: Segunda sugestão visual/concreta

      PÁGINA 3:
      - EXPLICACAO_SIMPLES_EXEMPLOS: Exemplos práticos (explicação simples)
      - EXPLICACAO_DETALHADA_EXEMPLOS: Exemplos práticos (explicação detalhada)
      - TITULO_EXEMPLO_1: Título do primeiro exemplo
      - DESCRICAO_EXEMPLO_1: Descrição do primeiro exemplo
      - COMENTARIO_EXEMPLO_1: Comentário sobre o primeiro exemplo
      - TITULO_EXEMPLO_2: Título do segundo exemplo
      - DESCRICAO_EXEMPLO_2: Descrição do segundo exemplo
      - COMENTARIO_EXEMPLO_2: Comentário sobre o segundo exemplo
      - SUCCESS_BOX_TITULO_1: Título da caixa de sucesso
      - SUCCESS_BOX_TEXTO_1: Texto da caixa de sucesso

      PÁGINA 4:
      - EXPLICACAO_SIMPLES_DIFICULDADES: Dificuldades comuns (explicação simples)
      - EXPLICACAO_DETALHADA_DIFICULDADES: Dificuldades comuns (explicação detalhada)
      - TITULO_DIFICULDADE_1: Título da primeira dificuldade
      - DESCRICAO_DIFICULDADE_1: Descrição da primeira dificuldade
      - CORRECAO_DIFICULDADE_1: Como corrigir a primeira dificuldade
      - TITULO_DIFICULDADE_2: Título da segunda dificuldade
      - DESCRICAO_DIFICULDADE_2: Descrição da segunda dificuldade
      - CORRECAO_DIFICULDADE_2: Como corrigir a segunda dificuldade
      - EXPLICACAO_SIMPLES_ATIVIDADES: Atividades práticas (explicação simples)
      - EXPLICACAO_DETALHADA_ATIVIDADES: Atividades práticas (explicação detalhada)
      - ATIVIDADE_PRATICA_1_DESCRICAO: Descrição da primeira atividade
      - ATIVIDADE_PRATICA_2_DESCRICAO: Descrição da segunda atividade

      PÁGINA 5:
      - EXPLICACAO_SIMPLES_RECURSOS: Recursos complementares (explicação simples)
      - EXPLICACAO_DETALHADA_RECURSOS: Recursos complementares (explicação detalhada)
      - RECURSO_VIDEO_DESCRICAO: Descrição do recurso de vídeo
      - RECURSO_VIDEO_LINK: Link do vídeo
      - RECURSO_IMAGEM_DESCRICAO: Descrição do recurso de imagem
      - RECURSO_IMAGEM_LINK: Link da imagem
      - RECURSO_SITE_DESCRICAO: Descrição do site interativo
      - RECURSO_SITE_LINK: Link do site
      - RECURSO_OBJETO_DESCRICAO: Descrição de objetos manipuláveis
      - SUCCESS_BOX_TITULO_2: Título da segunda caixa de sucesso
      - SUCCESS_BOX_TEXTO_2: Texto da segunda caixa de sucesso

      TEMPLATE HTML A SER USADO:
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Material de Apoio</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          @page { 
            size: A4; 
            margin: 0; 
          }
          body { 
            margin: 0; 
            padding: 0; 
            background: #f0f4f8; 
            font-family: 'Inter', sans-serif; 
            display: flex; /* Permite empilhar as páginas verticalmente */
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            padding: 20px 0; /* Espaçamento entre as páginas no navegador */
          }
          .page { 
            position: relative; 
            width: 210mm; 
            min-height: 297mm; 
            background: white; 
            overflow: hidden; 
            margin: 0 auto 20px auto; /* Margem entre as páginas */
            box-sizing: border-box; 
            padding: 0; 
            display: flex; 
            flex-direction: column; 
            border-radius: 6px; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
            page-break-after: always; /* Força quebra de página */
          }
          .page:last-of-type {
            page-break-after: auto; /* Remove quebra de página na última */
            margin-bottom: 0;
          }
          .shape-circle { 
            position: absolute; 
            border-radius: 50%; 
            opacity: 0.25; 
            pointer-events: none; 
            z-index: 0; 
          }
          .shape-circle.purple { 
            width: 180px; 
            height: 180px; 
            background: #a78bfa; 
            top: -60px; 
            left: -40px; 
          }
          .shape-circle.blue { 
            width: 240px; 
            height: 240px; 
            background: #60a5fa; 
            bottom: -80px; 
            right: -60px; 
          }
          .header { 
            position: absolute; 
            top: 6mm; 
            left: 0; 
            right: 0; 
            display: flex; 
            /* Ajuste: Alinha a logo e o texto da marca à esquerda */
            justify-content: flex-start; /* Empurra para o início do container */
            align-items: center; 
            z-index: 999; 
            height: 15mm; 
            background: transparent; 
            padding: 0 12mm; /* Padding para afastar da borda */
            flex-shrink: 0; 
          }
          .header .logo-container { 
            display: flex; 
            align-items: center; 
            gap: 6px; 
          }
          .header .logo { 
            width: 38px; 
            height: 38px; 
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            flex-shrink: 0; 
            box-shadow: 0 3px 8px rgba(14, 165, 233, 0.3); 
          }
          .header .logo svg { 
            width: 20px; 
            height: 20px; 
            stroke: white; 
            fill: none; 
            stroke-width: 2; 
          }
          .header .brand-text { 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
          }
          .header .brand-text h1 { 
            font-size: 24px; 
            color: #0ea5e9; 
            margin: 0; 
            font-family: 'Inter', sans-serif; 
            line-height: 1; 
            font-weight: 700; 
            letter-spacing: -0.5px; 
            text-transform: none; 
          }
          .header .brand-text p { 
            font-size: 9px; 
            color: #6b7280; 
            margin: 1px 0 0 0; 
            font-family: 'Inter', sans-serif; 
            line-height: 1; 
            font-weight: 400; 
          }
          .content { 
            margin-top: 25mm; /* Ajusta a margem superior para o cabeçalho */
            margin-bottom: 12mm; /* Ajusta a margem inferior para o rodapé */
            padding: 15mm; /* Padding interno para o conteúdo, garantindo margens laterais */
            position: relative; 
            flex: 1; 
            overflow: hidden; /* Garante que o conteúdo não vaze */
            z-index: 1; 
            box-sizing: border-box; /* Inclui padding no cálculo da largura/altura */
          }
          .footer { 
            position: absolute; 
            bottom: 6mm; 
            left: 0; 
            right: 0; 
            text-align: center; 
            font-size: 0.7rem; 
            color: #6b7280; 
            z-index: 999; 
            height: 6mm; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: transparent; 
            padding: 0 15mm; 
            font-family: 'Inter', sans-serif; 
            flex-shrink: 0; 
          }
          
          /* Estilos para o conteúdo do material de apoio */
          .support-content {
            font-size: 1.13rem;
            color: #222;
            text-align: justify;
            line-height: 1.7;
            word-break: break-word; /* Garante quebra de palavras longas */
          }
          
          .support-content h1 {
            font-size: 1.8rem;
            color: #4338ca;
            font-weight: 800;
            text-align: center;
            margin: 0 0 0.5rem 0; /* Ajustado para dar espaço ao subtítulo */
            letter-spacing: 0.5px;
            text-transform: uppercase;
            word-wrap: break-word; /* Garante quebra de palavras longas */
          }
          .support-content .subtitle-material { /* Novo estilo para o subtítulo do material */
              font-size: 1.1rem;
              color: #6b7280;
              text-align: center;
              margin-bottom: 1.5rem;
              word-wrap: break-word;
          }
          .support-content .material-details { /* Estilo para a linha de detalhes do material */
              font-size: 1rem;
              color: #333;
              text-align: center;
              margin-top: 5px;
              margin-bottom: 20px;
              line-height: 1.4;
              border-bottom: 1px solid #d1d5db; /* A linha visual */
              padding-bottom: 10px;
          }
          
          .support-content h2 {
            font-size: 1.4rem;
            color: #4338ca;
            font-weight: 700;
            margin: 2rem 0 1rem 0;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            word-wrap: break-word;
          }
          
          .support-content h3 {
            font-size: 1.2rem;
            color: #4338ca;
            font-weight: 600;
            margin: 1.5rem 0 0.8rem 0;
            word-wrap: break-word;
          }
          
          .support-content p {
            margin: 0 0 1rem 0;
            text-align: justify;
            word-wrap: break-word;
          }
          
          .support-content ul, .support-content ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
            word-wrap: break-word;
          }
          
          .support-content li {
            margin: 0.5rem 0;
            line-height: 1.6;
            word-wrap: break-word;
          }
          
          .support-content strong {
            font-weight: 600;
            color: #4338ca;
          }
          
          .support-content em {
            font-style: italic;
            color: #6b7280;
          }
          
          .support-content blockquote {
            border-left: 4px solid #0ea5e9;
            padding-left: 1rem;
            margin: 1.5rem 0;
            background: #f8fafc;
            padding: 1rem;
            border-radius: 0 6px 6px 0;
            word-wrap: break-word;
          }
          
          .support-content .highlight {
            background: #fef3c7;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-weight: 500;
            word-wrap: break-word;
          }
          
          .support-content .info-box {
            background: #eff6ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 1rem;
            margin: 1.5rem 0;
            word-wrap: break-word;
          }
          
          .support-content .warning-box {
            background: #fef2f2;
            border: 1px solid #ef4444;
            border-radius: 8px;
            padding: 1rem;
            margin: 1.5rem 0;
            word-wrap: break-word;
          }
          
          .support-content .success-box {
            background: #f0fdf4;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 1rem;
            margin: 1.5rem 0;
            word-wrap: break-word;
          }
          
          @media print { 
            body { 
              margin: 0; 
              padding: 0; 
              background: white; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            } 
            .page { 
              box-shadow: none; 
              margin: 0; 
              border-radius: 0; 
              width: 100%; 
              min-height: 100vh; 
              display: flex; 
              flex-direction: column; 
            } 
            .shape-circle { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            } 
            .header, .footer { 
              position: fixed; 
              background: transparent; 
            } 
            .header .logo { 
              background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            } 
            .header .brand-text h1 { 
              text-transform: none !important; 
            } 
            .header .logo svg { 
              width: 20px !important; 
              height: 20px !important; 
            } 
          }
        </style>
      </head>
      <body>
        <!-- Página 1 -->
        <div class="page">
          <div class="shape-circle purple"></div>
          <div class="shape-circle blue"></div>
          
          <div class="header">
            <div class="logo-container">
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
          </div>
          
          <div class="footer">
            Conteúdo de Apoio gerado pela AulagIA - Sua aula com toque mágico em {{DATA_GERACAO}} • aulagia.com.br
          </div>
          
          <div class="content">
            <div class="support-content">
              <h1>{{TEMA_DO_MATERIAL_PRINCIPAL}}</h1>
              <p class="material-details">
                {{DISCIPLINA}} - {{NIVEL_ANO}}<br>
                {{TIPO_DE_MATERIAL_PRINCIPAL}}: {{TEMA_DO_MATERIAL}}<br>
                Turma: {{TURMA_DO_MATERIAL}}
              </p>
              
              <h2>1. O Que é Esse Tema?</h2>
              <p><strong>Explicação Simples:</strong> {{EXPLICACAO_SIMPLES_DO_TEMA}}</p>
              <p><strong>Explicação Detalhada:</strong> {{EXPLICACAO_DETALHADA_DO_TEMA}}</p>
              
              <div class="info-box">
                <strong>Dica importante:</strong> O conteúdo de apoio deve ser sempre adaptado ao nível de compreensão dos alunos, usando linguagem clara e exemplos práticos.
              </div>
              
              <h2>2. Para que Serve Esse Conteúdo na Vida Prática e Escolar?</h2>
              <p><strong>Explicação Simples:</strong> {{EXPLICACAO_SIMPLES_UTILIDADE}}</p>
              <p><strong>Explicação Detalhada:</strong> {{EXPLICACAO_DETALHADA_UTILIDADE}}</p>
              <ul>
                <li>{{IMPORTANCIA_NA_FORMACAO_ITEM_1}}</li>
                <li>{{IMPORTANCIA_NA_FORMACAO_ITEM_2}}</li>
                <li>{{IMPORTANCIA_NA_FORMACAO_ITEM_3}}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Página 2 -->
        <div class="page">
          <div class="shape-circle purple"></div>
          <div class="shape-circle blue"></div>
          
          <div class="header">
            <div class="logo-container">
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
          </div>
          
          <div class="footer">
            Conteúdo de Apoio gerado pela AulagIA - Sua aula com toque mágico em {{DATA_GERACAO}} • aulagia.com.br
          </div>
          
          <div class="content">
            <div class="support-content">
              <h2>3. Como Ensinar Esse Tema em Sala de Aula – Passo a Passo</h2>
              <p><strong>Explicação Simples:</strong> {{EXPLICACAO_SIMPLES_ENSINO}}</p>
              <p><strong>Explicação Detalhada:</strong> {{EXPLICACAO_DETALHADA_ENSINO}}</p>
              <ol>
                <li>{{PASSO_A_PASSO_ITEM_1_INICIAR}}</li>
                <li>{{PASSO_A_PASSO_ITEM_2_DESENVOLVER}}</li>
                <li>{{PASSO_A_PASSO_ITEM_3_CONCLUIR}}</li>
              </ol>
              
              <div class="highlight">
                <strong>{{HIGHLIGHT_TITULO_1}}:</strong> {{HIGHLIGHT_TEXTO_1}}
              </div>
              
              <p>{{PARAGRAFO_COMO_ENSINAR_P3}}</p>
              <ul>
                <li>{{SUGESTAO_VISUAL_OU_CONCRETA_ITEM_1}}</li>
                <li>{{SUGESTAO_VISUAL_OU_CONCRETA_ITEM_2}}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Página 3 -->
        <div class="page">
          <div class="shape-circle purple"></div>
          <div class="shape-circle blue"></div>
          
          <div class="header">
            <div class="logo-container">
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
          </div>
          
          <div class="footer">
            Conteúdo de Apoio gerado pela AulagIA - Sua aula com toque mágico em {{DATA_GERACAO}} • aulagia.com.br
          </div>
          
          <div class="content">
            <div class="support-content">
              <h2>4. Exemplos Práticos Prontos para Usar em Sala</h2>
              <p><strong>Explicação Simples:</strong> {{EXPLICACAO_SIMPLES_EXEMPLOS}}</p>
              <p><strong>Explicação Detalhada:</strong> {{EXPLICACAO_DETALHADA_EXEMPLOS}}</p>
              
              <h3>Exemplo 1: {{TITULO_EXEMPLO_1}}</h3>
              <p>{{DESCRICAO_EXEMPLO_1}}</p>
              <div class="info-box">
                <strong>Comentário:</strong> {{COMENTARIO_EXEMPLO_1}}
              </div>
              
              <h3>Exemplo 2: {{TITULO_EXEMPLO_2}}</h3>
              <p>{{DESCRICAO_EXEMPLO_2}}</p>
              <div class="info-box">
                <strong>Comentário:</strong> {{COMENTARIO_EXEMPLO_2}}
              </div>

              <div class="success-box">
                <strong>{{SUCCESS_BOX_TITULO_1}}:</strong> {{SUCCESS_BOX_TEXTO_1}}
              </div>
            </div>
          </div>
        </div>

        <!-- Página 4 -->
        <div class="page">
          <div class="shape-circle purple"></div>
          <div class="shape-circle blue"></div>
          
          <div class="header">
            <div class="logo-container">
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
          </div>
          
          <div class="footer">
            Conteúdo de Apoio gerado pela AulagIA - Sua aula com toque mágico em {{DATA_GERACAO}} • aulagia.com.br
          </div>
          
          <div class="content">
            <div class="support-content">
              <h2>5. Dificuldades Comuns dos Alunos e Como Corrigir</h2>
              <p><strong>Explicação Simples:</strong> {{EXPLICACAO_SIMPLES_DIFICULDADES}}</p>
              <p><strong>Explicação Detalhada:</strong> {{EXPLICACAO_DETALHADA_DIFICULDADES}}</p>
              
              <h3>Dificuldade 1: {{TITULO_DIFICULDADE_1}}</h3>
              <p>{{DESCRICAO_DIFICULDADE_1}}</p>
              <div class="warning-box">
                <strong>Como Corrigir:</strong> {{CORRECAO_DIFICULDADE_1}}
              </div>
              
              <h3>Dificuldade 2: {{TITULO_DIFICULDADE_2}}</h3>
              <p>{{DESCRICAO_DIFICULDADE_2}}</p>
              <div class="warning-box">
                <strong>Como Corrigir:</strong> {{CORRECAO_DIFICULDADE_2}}
              </div>
              
              <h2>6. Sugestões de Atividades Práticas</h2>
              <p><strong>Explicação Simples:</strong> {{EXPLICACAO_SIMPLES_ATIVIDADES}}</p>
              <p><strong>Explicação Detalhada:</strong> {{EXPLICACAO_DETALHADA_ATIVIDADES}}</p>
              <ol>
                <li>{{ATIVIDADE_PRATICA_1_DESCRICAO}}</li>
                <li>{{ATIVIDADE_PRATICA_2_DESCRICAO}}</li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Página 5 -->
        <div class="page">
          <div class="shape-circle purple"></div>
          <div class="shape-circle blue"></div>
          
          <div class="header">
            <div class="logo-container">
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
          </div>
          
          <div class="footer">
            Conteúdo de Apoio gerado pela AulagIA - Sua aula com toque mágico em {{DATA_GERACAO}} • aulagia.com.br
          </div>
          
          <div class="content">
            <div class="support-content">
              <h2>7. Sugestões de Recursos Complementares</h2>
              <p><strong>Explicação Simples:</strong> {{EXPLICACAO_SIMPLES_RECURSOS}}</p>
              <p><strong>Explicação Detalhada:</strong> {{EXPLICACAO_DETALHADA_RECURSOS}}</p>
              <ul>
                <li><strong>Vídeos:</strong> {{RECURSO_VIDEO_DESCRICAO}} - {{RECURSO_VIDEO_LINK}}</li>
                <li><strong>Imagens/Diagramas:</strong> {{RECURSO_IMAGEM_DESCRICAO}} - {{RECURSO_IMAGEM_LINK}}</li>
                <li><strong>Sites Interativos:</strong> {{RECURSO_SITE_DESCRICAO}} - {{RECURSO_SITE_LINK}}</li>
                <li><strong>Objetos Manipuláveis:</strong> {{RECURSO_OBJETO_DESCRICAO}}</li>
              </ul>
              
              <div class="success-box">
                <strong>{{SUCCESS_BOX_TITULO_2}}:</strong> {{SUCCESS_BOX_TEXTO_2}}
              </div>
              
              <p style="text-align: center; margin-top: 3rem;">--- Fim do Material de Apoio ---</p>
            </div>
          </div>
        </div>
      </body>
      </html>

      FORMATO DE RESPOSTA:
      Retorne apenas um JSON válido com a seguinte estrutura:

      {
        "titulo": "Título do Material de Apoio",
        "html": "HTML completo com todas as variáveis preenchidas usando o template fornecido"
      }

      IMPORTANTE:
      - Cada seção deve ter entre 100-200 palavras
      - Use formatação HTML simples quando necessário (negrito, itálico, listas)
      - Mantenha a linguagem adequada à faixa etária
      - Seja prático e objetivo
      - Não use markdown, apenas HTML simples
      - Retorne APENAS o JSON válido, sem texto adicional
      - O HTML deve usar o template fornecido com todas as variáveis preenchidas
      - Substitua todas as variáveis {{VARIAVEL}} pelos valores apropriados
      - Inclua a data de geração no formato brasileiro (dd/mm/aaaa)
      `;

      responseStructure = `
        Estrutura esperada:
        {
          "titulo": "string",
          "html": "string (HTML completo com template e variáveis preenchidas)"
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
    if (materialType === 'apoio' && parsedContent.html) {
      // Substituir a data de geração no HTML
      const today = new Date().toLocaleDateString('pt-BR');
      htmlContent = parsedContent.html.replace(/\{\{DATA_GERACAO\}\}/g, today);
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
