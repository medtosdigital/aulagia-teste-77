import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialType, formData } = await req.json();
    console.log('📋 Generating material:', { materialType, formData });

    let prompt = '';
    
    // Prompts para diferentes tipos de materiais
    if (materialType === 'plano-de-aula') {
      prompt = `
Crie um plano de aula completo e detalhado sobre o tema "${formData.tema}" para a disciplina ${formData.disciplina} da série ${formData.serie}.

IMPORTANTE: Responda APENAS com um JSON válido, sem explicações adicionais.

Estrutura obrigatória do JSON:
{
  "titulo": "Título do plano de aula",
  "professor": "${formData.professor || 'Professor(a)'}",
  "disciplina": "${formData.disciplina}",
  "serie": "${formData.serie}",
  "tema": "${formData.tema}",
  "data": "${formData.data || new Date().toLocaleDateString('pt-BR')}",
  "duracao": "${formData.duracao || '50 minutos'}",
  "bncc": "Códigos BNCC relevantes",
  "objetivos": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
  "habilidades": [
    {"codigo": "EF01MA01", "descricao": "Descrição da habilidade"},
    {"codigo": "EF01MA02", "descricao": "Descrição da habilidade"}
  ],
  "desenvolvimento": [
    {
      "etapa": "Introdução",
      "atividade": "Descrição da atividade",
      "tempo": "10 minutos",
      "recursos": "Recursos necessários"
    },
    {
      "etapa": "Desenvolvimento",
      "atividade": "Descrição da atividade",
      "tempo": "30 minutos",
      "recursos": "Recursos necessários"
    },
    {
      "etapa": "Conclusão",
      "atividade": "Descrição da atividade",
      "tempo": "10 minutos",
      "recursos": "Recursos necessários"
    }
  ],
  "recursos": ["Recurso 1", "Recurso 2", "Recurso 3"],
  "conteudosProgramaticos": ["Conteúdo 1", "Conteúdo 2", "Conteúdo 3"],
  "metodologia": "Descrição da metodologia utilizada",
  "avaliacao": "Descrição dos critérios de avaliação",
  "referencias": ["Referência 1", "Referência 2"]
}

Certifique-se de que todos os campos estão preenchidos adequadamente para o tema "${formData.tema}" da disciplina ${formData.disciplina}.
`;
    } else if (materialType === 'slides') {
      prompt = `
Crie uma apresentação em slides sobre o tema "${formData.tema}" para a disciplina ${formData.disciplina} da série ${formData.serie}.

IMPORTANTE: Responda APENAS com um JSON válido, sem explicações adicionais.

Estrutura obrigatória do JSON:
{
  "titulo": "Título da apresentação",
  "disciplina": "${formData.disciplina}",
  "serie": "${formData.serie}",
  "tema": "${formData.tema}",
  "tema_imagem": "Prompt para gerar imagem do tema principal",
  "introducao_titulo": "Título da introdução",
  "introducao_conteudo": "Conteúdo da introdução",
  "introducao_imagem": "Prompt para gerar imagem da introdução",
  "conceitos_titulo": "Título dos conceitos",
  "conceitos_conteudo": "Conteúdo dos conceitos",
  "conceitos_imagem": "Prompt para gerar imagem dos conceitos",
  "exemplo_titulo": "Título do exemplo",
  "exemplo_conteudo": "Conteúdo do exemplo",
  "exemplo_imagem": "Prompt para gerar imagem do exemplo",
  "desenvolvimento_1_titulo": "Título do desenvolvimento 1",
  "desenvolvimento_1_conteudo": "Conteúdo do desenvolvimento 1",
  "desenvolvimento_1_imagem": "Prompt para gerar imagem do desenvolvimento 1",
  "desenvolvimento_2_titulo": "Título do desenvolvimento 2",
  "desenvolvimento_2_conteudo": "Conteúdo do desenvolvimento 2",
  "desenvolvimento_2_imagem": "Prompt para gerar imagem do desenvolvimento 2",
  "desenvolvimento_3_titulo": "Título do desenvolvimento 3",
  "desenvolvimento_3_conteudo": "Conteúdo do desenvolvimento 3",
  "desenvolvimento_3_imagem": "Prompt para gerar imagem do desenvolvimento 3",
  "desenvolvimento_4_titulo": "Título do desenvolvimento 4",
  "desenvolvimento_4_conteudo": "Conteúdo do desenvolvimento 4",
  "desenvolvimento_4_imagem": "Prompt para gerar imagem do desenvolvimento 4",
  "conclusao_titulo": "Título da conclusão",
  "conclusao_conteudo": "Conteúdo da conclusão"
}

Certifique-se de que todos os campos estão preenchidos adequadamente para o tema "${formData.tema}" da disciplina ${formData.disciplina}.
`;
    } else if (materialType === 'atividade') {
      const tiposQuestoes = formData.tiposQuestoes || ['multipla-escolha', 'verdadeiro-falso', 'dissertativa'];
      const numeroQuestoes = formData.numeroQuestoes || 10;
      
      prompt = `
Crie uma atividade educativa sobre o tema "${formData.tema}" para a disciplina ${formData.disciplina} da série ${formData.serie}.

IMPORTANTE: Responda APENAS com um JSON válido, sem explicações adicionais.

A atividade deve ter ${numeroQuestoes} questões dos tipos: ${tiposQuestoes.join(', ')}.

Estrutura obrigatória do JSON:
{
  "titulo": "Título da atividade",
  "disciplina": "${formData.disciplina}",
  "serie": "${formData.serie}",
  "tema": "${formData.tema}",
  "instrucoes": "Instruções para os alunos",
  "questoes": [
    {
      "numero": 1,
      "tipo": "multipla-escolha",
      "pergunta": "Pergunta da questão",
      "opcoes": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
      "resposta": "A"
    },
    {
      "numero": 2,
      "tipo": "verdadeiro-falso",
      "pergunta": "Pergunta da questão",
      "resposta": "Verdadeiro"
    },
    {
      "numero": 3,
      "tipo": "dissertativa",
      "pergunta": "Pergunta da questão",
      "linhasResposta": 5
    }
  ]
}

Certifique-se de criar exatamente ${numeroQuestoes} questões variadas e adequadas para o tema "${formData.tema}".
`;
    } else if (materialType === 'avaliacao') {
      const assuntos = formData.assuntos || [formData.tema];
      const tiposQuestoes = formData.tiposQuestoes || ['multipla-escolha', 'verdadeiro-falso', 'dissertativa'];
      const quantidadeQuestoes = formData.quantidadeQuestoes || 10;
      
      prompt = `
Crie uma avaliação sobre os assuntos: ${assuntos.join(', ')} para a disciplina ${formData.disciplina} da série ${formData.serie}.

IMPORTANTE: Responda APENAS com um JSON válido, sem explicações adicionais.

A avaliação deve ter ${quantidadeQuestoes} questões dos tipos: ${tiposQuestoes.join(', ')}.

Estrutura obrigatória do JSON:
{
  "titulo": "Título da avaliação",
  "disciplina": "${formData.disciplina}",
  "serie": "${formData.serie}",
  "assuntos": ${JSON.stringify(assuntos)},
  "instrucoes": "Instruções para os alunos",
  "tempoLimite": "Tempo limite para a prova",
  "questoes": [
    {
      "numero": 1,
      "tipo": "multipla-escolha",
      "pergunta": "Pergunta da questão",
      "opcoes": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
      "pontuacao": 1.0
    },
    {
      "numero": 2,
      "tipo": "verdadeiro-falso",
      "pergunta": "Pergunta da questão",
      "pontuacao": 1.0
    },
    {
      "numero": 3,
      "tipo": "dissertativa",
      "pergunta": "Pergunta da questão",
      "pontuacao": 2.0,
      "linhasResposta": 5
    }
  ]
}

Certifique-se de criar exatamente ${quantidadeQuestoes} questões variadas e adequadas para os assuntos especificados.
`;
    }

    // Prompt específico para Material de Apoio
    if (materialType === 'apoio') {
      console.log('🎯 Generated prompt for apoio');
      
      const prompt = `
Gere um material de apoio educacional COMPLETO para professores sobre o tema "${formData.tema}" da disciplina ${formData.disciplina} para ${formData.serie}.

IMPORTANTE: Responda APENAS com um JSON válido contendo TODOS os campos necessários para preencher o template de 5 páginas.

Estrutura obrigatória do JSON:

{
  "TEMA_DO_MATERIAL_PRINCIPAL": "${formData.titulo_material_principal || formData.tema}",
  "DISCIPLINA": "${formData.disciplina}",
  "NIVEL_ANO": "${formData.serie}",
  "TIPO_DE_MATERIAL_PRINCIPAL": "Plano de Aula",
  "TEMA_DO_MATERIAL": "${formData.tema}",
  "TURMA_DO_MATERIAL": "${formData.serie}",
  "DATA_GERACAO": "${new Date().toLocaleDateString('pt-BR')}",
  
  "EXPLICACAO_SIMPLES_DO_TEMA": "Explicação clara e direta do tema em 2-3 frases",
  "EXPLICACAO_DETALHADA_DO_TEMA": "Explicação completa e técnica do tema em 1-2 parágrafos",
  
  "EXPLICACAO_SIMPLES_UTILIDADE": "Explicação simples da importância na vida prática em 2-3 frases",
  "EXPLICACAO_DETALHADA_UTILIDADE": "Explicação detalhada da aplicação prática em 1-2 parágrafos",
  "IMPORTANCIA_NA_FORMACAO_ITEM_1": "Primeiro aspecto da importância na formação",
  "IMPORTANCIA_NA_FORMACAO_ITEM_2": "Segundo aspecto da importância na formação", 
  "IMPORTANCIA_NA_FORMACAO_ITEM_3": "Terceiro aspecto da importância na formação",
  
  "EXPLICACAO_SIMPLES_ENSINO": "Como ensinar de forma simples em 2-3 frases",
  "EXPLICACAO_DETALHADA_ENSINO": "Metodologia detalhada de ensino em 1-2 parágrafos",
  "PASSO_A_PASSO_ITEM_1_INICIAR": "Primeiro passo para iniciar a aula",
  "PASSO_A_PASSO_ITEM_2_DESENVOLVER": "Segundo passo para desenvolver o conteúdo",
  "PASSO_A_PASSO_ITEM_3_CONCLUIR": "Terceiro passo para concluir a aula",
  "HIGHLIGHT_TITULO_1": "Título da dica importante",
  "HIGHLIGHT_TEXTO_1": "Texto da dica importante",
  "PARAGRAFO_COMO_ENSINAR_P3": "Parágrafo adicional sobre como ensinar",
  "SUGESTAO_VISUAL_OU_CONCRETA_ITEM_1": "Primeira sugestão visual ou concreta",
  "SUGESTAO_VISUAL_OU_CONCRETA_ITEM_2": "Segunda sugestão visual ou concreta",
  
  "EXPLICACAO_SIMPLES_EXEMPLOS": "Explicação simples sobre os exemplos em 2-3 frases",
  "EXPLICACAO_DETALHADA_EXEMPLOS": "Explicação detalhada sobre os exemplos em 1-2 parágrafos",
  "TITULO_EXEMPLO_1": "Título do primeiro exemplo prático",
  "DESCRICAO_EXEMPLO_1": "Descrição completa do primeiro exemplo",
  "COMENTARIO_EXEMPLO_1": "Comentário pedagógico sobre o primeiro exemplo",
  "TITULO_EXEMPLO_2": "Título do segundo exemplo prático",
  "DESCRICAO_EXEMPLO_2": "Descrição completa do segundo exemplo",
  "COMENTARIO_EXEMPLO_2": "Comentário pedagógico sobre o segundo exemplo",
  "SUCCESS_BOX_TITULO_1": "Título da caixa de sucesso 1",
  "SUCCESS_BOX_TEXTO_1": "Texto da caixa de sucesso 1",
  
  "EXPLICACAO_SIMPLES_DIFICULDADES": "Explicação simples sobre dificuldades em 2-3 frases",
  "EXPLICACAO_DETALHADA_DIFICULDADES": "Explicação detalhada sobre dificuldades em 1-2 parágrafos",
  "TITULO_DIFICULDADE_1": "Título da primeira dificuldade comum",
  "DESCRICAO_DIFICULDADE_1": "Descrição da primeira dificuldade",
  "CORRECAO_DIFICULDADE_1": "Como corrigir a primeira dificuldade",
  "TITULO_DIFICULDADE_2": "Título da segunda dificuldade comum",
  "DESCRICAO_DIFICULDADE_2": "Descrição da segunda dificuldade",
  "CORRECAO_DIFICULDADE_2": "Como corrigir a segunda dificuldade",
  "EXPLICACAO_SIMPLES_ATIVIDADES": "Explicação simples sobre atividades em 2-3 frases",
  "EXPLICACAO_DETALHADA_ATIVIDADES": "Explicação detalhada sobre atividades em 1-2 parágrafos",
  "ATIVIDADE_PRATICA_1_DESCRICAO": "Descrição da primeira atividade prática",
  "ATIVIDADE_PRATICA_2_DESCRICAO": "Descrição da segunda atividade prática",
  
  "EXPLICACAO_SIMPLES_RECURSOS": "Explicação simples sobre recursos em 2-3 frases",
  "EXPLICACAO_DETALHADA_RECURSOS": "Explicação detalhada sobre recursos em 1-2 parágrafos",
  "RECURSO_VIDEO_DESCRICAO": "Descrição do recurso de vídeo",
  "RECURSO_VIDEO_LINK": "Link sugerido para vídeo educativo",
  "RECURSO_IMAGEM_DESCRICAO": "Descrição do recurso de imagem",
  "RECURSO_IMAGEM_LINK": "Link sugerido para imagens/diagramas",
  "RECURSO_SITE_DESCRICAO": "Descrição do site interativo",
  "RECURSO_SITE_LINK": "Link sugerido para site educativo",
  "RECURSO_OBJETO_DESCRICAO": "Descrição de objetos manipuláveis",
  "SUCCESS_BOX_TITULO_2": "Título da caixa de sucesso 2",
  "SUCCESS_BOX_TEXTO_2": "Texto da caixa de sucesso 2"
}

Certifique-se de que TODOS os campos estão preenchidos com conteúdo relevante e educativo para o tema "${formData.tema}" da disciplina ${formData.disciplina}.
`;

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
              content: 'Você é um especialista em educação brasileira que cria materiais de apoio para professores. Responda APENAS com JSON válido, sem explicações adicionais.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      
      console.log('🤖 OpenAI response:', content);

      let parsedContent;
      try {
        // Remove qualquer texto antes ou depois do JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        throw new Error('Falha ao processar resposta da IA');
      }

      // Criar cliente Supabase
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Usar template de 5 páginas
      const SUPPORT_MATERIAL_TEMPLATE = `
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
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      padding: 20px 0;
    }
    .page { 
      position: relative; 
      width: 210mm; 
      min-height: 297mm; 
      background: white; 
      overflow: hidden; 
      margin: 0 auto 20px auto;
      box-sizing: border-box; 
      padding: 0; 
      display: flex; 
      flex-direction: column; 
      border-radius: 6px; 
      box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
      page-break-after: always;
    }
    .page:last-of-type {
      page-break-after: auto;
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
      justify-content: flex-start;
      align-items: center; 
      z-index: 999; 
      height: 15mm; 
      background: transparent; 
      padding: 0 12mm;
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
      margin-top: 25mm;
      margin-bottom: 12mm;
      padding: 15mm;
      position: relative; 
      flex: 1; 
      overflow: hidden;
      z-index: 1; 
      box-sizing: border-box;
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
    
    .support-content {
      font-size: 1.13rem;
      color: #222;
      text-align: justify;
      line-height: 1.7;
      word-break: break-word;
    }
    
    .support-content h1 {
      font-size: 1.8rem;
      color: #4338ca;
      font-weight: 800;
      text-align: center;
      margin: 0 0 0.5rem 0;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      word-wrap: break-word;
    }
    .support-content .material-details {
        font-size: 1rem;
        color: #333;
        text-align: center;
        margin-top: 5px;
        margin-bottom: 20px;
        line-height: 1.4;
        border-bottom: 1px solid #d1d5db;
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
    
    .support-content .highlight {
      background: #fef3c7;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-weight: 500;
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
`;

      // Substituir variáveis no template
      let finalHtml = SUPPORT_MATERIAL_TEMPLATE;
      Object.entries(parsedContent).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        finalHtml = finalHtml.replace(new RegExp(placeholder, 'g'), value || '');
      });

      // Salvar no banco de dados
      const { data: materialApoio, error: insertError } = await supabase
        .from('materiais_apoio')
        .insert({
          titulo: parsedContent.TEMA_DO_MATERIAL_PRINCIPAL || 'Material de Apoio',
          conteudo: finalHtml,
          disciplina: formData.disciplina,
          tema: formData.tema,
          turma: formData.serie,
          user_id: formData.user_id,
          material_principal_id: formData.material_principal_id,
          status: 'ativo'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao salvar material de apoio:', insertError);
        throw new Error('Falha ao salvar material de apoio');
      }

      console.log('✅ Material de apoio salvo com sucesso');

      return new Response(JSON.stringify({
        success: true,
        apoioId: materialApoio.id,
        content: parsedContent
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Para outros tipos de materiais, usar o prompt correspondente
    if (!prompt) {
      throw new Error('Tipo de material não suportado');
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
            content: 'Você é um especialista em educação brasileira que cria materiais educativos de alta qualidade. Responda APENAS com JSON válido, sem explicações adicionais.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    console.log('🤖 OpenAI response:', content);

    let parsedContent;
    try {
      // Remove qualquer texto antes ou depois do JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error('Falha ao processar resposta da IA');
    }

    console.log('✅ Content generated successfully');

    return new Response(JSON.stringify({
      success: true,
      content: parsedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in gerarMaterialIA function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
