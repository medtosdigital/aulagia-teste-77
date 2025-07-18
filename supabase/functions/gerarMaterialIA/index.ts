
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
    
    // Prompts melhorados para diferentes tipos de materiais
    if (materialType === 'plano-de-aula') {
      prompt = `
Você é um especialista em educação brasileira e pedagogo experiente. Crie um plano de aula DETALHADO e ESPECÍFICO sobre o tema "${formData.tema}" para a disciplina ${formData.disciplina} da série ${formData.serie}.

TEMA PRINCIPAL: ${formData.tema}
DISCIPLINA: ${formData.disciplina}
SÉRIE/ANO: ${formData.serie}

INSTRUÇÕES IMPORTANTES:
- O plano deve estar TOTALMENTE FOCADO no tema "${formData.tema}"
- Todas as atividades devem abordar diretamente este tema
- Use metodologias ativas e participativas adequadas à faixa etária
- Inclua competências e habilidades da BNCC pertinentes ao tema
- Responda APENAS com JSON válido, sem explicações adicionais

Estrutura obrigatória do JSON:
{
  "titulo": "Título específico do plano sobre ${formData.tema}",
  "professor": "${formData.professor || 'Professor(a)'}",
  "disciplina": "${formData.disciplina}",
  "serie": "${formData.serie}",
  "tema": "${formData.tema}",
  "data": "${formData.data || new Date().toLocaleDateString('pt-BR')}",
  "duracao": "${formData.duracao || '50 minutos'}",
  "bncc": "Códigos BNCC específicos para ${formData.tema} em ${formData.disciplina}",
  "objetivos": [
    "Objetivo específico 1 relacionado a ${formData.tema}",
    "Objetivo específico 2 relacionado a ${formData.tema}",
    "Objetivo específico 3 relacionado a ${formData.tema}"
  ],
  "habilidades": [
    {"codigo": "Código BNCC", "descricao": "Descrição da habilidade relacionada a ${formData.tema}"},
    {"codigo": "Código BNCC", "descricao": "Descrição da habilidade relacionada a ${formData.tema}"}
  ],
  "desenvolvimento": [
    {
      "etapa": "Introdução",
      "atividade": "Atividade introdutória específica sobre ${formData.tema}",
      "tempo": "10 minutos",
      "recursos": "Recursos específicos para apresentar ${formData.tema}"
    },
    {
      "etapa": "Desenvolvimento",
      "atividade": "Atividade principal focada em ${formData.tema}",
      "tempo": "30 minutos",
      "recursos": "Recursos para explorar ${formData.tema} em profundidade"
    },
    {
      "etapa": "Conclusão",
      "atividade": "Síntese e fixação do conteúdo sobre ${formData.tema}",
      "tempo": "10 minutos",
      "recursos": "Recursos para consolidar o aprendizado sobre ${formData.tema}"
    }
  ],
  "recursos": [
    "Recurso específico 1 para ${formData.tema}",
    "Recurso específico 2 para ${formData.tema}",
    "Recurso específico 3 para ${formData.tema}"
  ],
  "conteudosProgramaticos": [
    "Conteúdo específico 1 de ${formData.tema}",
    "Conteúdo específico 2 de ${formData.tema}",
    "Conteúdo específico 3 de ${formData.tema}"
  ],
  "metodologia": "Metodologia detalhada para ensinar ${formData.tema} de forma efetiva",
  "avaliacao": "Critérios de avaliação específicos para verificar o aprendizado sobre ${formData.tema}",
  "referencias": [
    "Referência bibliográfica 1 sobre ${formData.tema}",
    "Referência bibliográfica 2 sobre ${formData.tema}"
  ]
}

Certifique-se de que TODOS os elementos do plano estejam diretamente relacionados ao tema "${formData.tema}".
`;
    } else if (materialType === 'slides') {
      prompt = `
Você é um especialista em educação brasileira e designer instrucional. Crie uma apresentação em slides FOCADA ESPECIFICAMENTE no tema "${formData.tema}" para a disciplina ${formData.disciplina} da série ${formData.serie}.

TEMA PRINCIPAL: ${formData.tema}
DISCIPLINA: ${formData.disciplina}
SÉRIE/ANO: ${formData.serie}

INSTRUÇÕES IMPORTANTES:
- Todos os slides devem abordar diretamente o tema "${formData.tema}"
- Use linguagem adequada à faixa etária da série ${formData.serie}
- Crie conteúdo progressivo e didático sobre o tema
- Inclua prompts para imagens que ilustrem especificamente o tema
- Responda APENAS com JSON válido, sem explicações adicionais

Estrutura obrigatória do JSON:
{
  "titulo": "Apresentação sobre ${formData.tema}",
  "disciplina": "${formData.disciplina}",
  "serie": "${formData.serie}",
  "tema": "${formData.tema}",
  "tema_imagem": "Imagem ilustrativa sobre ${formData.tema} para estudantes de ${formData.serie}",
  "introducao_titulo": "Introdução ao ${formData.tema}",
  "introducao_conteudo": "Conteúdo introdutório específico sobre ${formData.tema}",
  "introducao_imagem": "Imagem que introduza o conceito de ${formData.tema}",
  "conceitos_titulo": "Conceitos Fundamentais de ${formData.tema}",
  "conceitos_conteudo": "Explicação dos conceitos principais de ${formData.tema}",
  "conceitos_imagem": "Imagem que ilustre os conceitos de ${formData.tema}",
  "exemplo_titulo": "Exemplo Prático de ${formData.tema}",
  "exemplo_conteudo": "Exemplo concreto e prático sobre ${formData.tema}",
  "exemplo_imagem": "Imagem de exemplo prático de ${formData.tema}",
  "desenvolvimento_1_titulo": "Aspectos Importantes de ${formData.tema}",
  "desenvolvimento_1_conteudo": "Primeiro aspecto detalhado de ${formData.tema}",
  "desenvolvimento_1_imagem": "Imagem relacionada ao primeiro aspecto de ${formData.tema}",
  "desenvolvimento_2_titulo": "Aplicações de ${formData.tema}",
  "desenvolvimento_2_conteudo": "Como ${formData.tema} se aplica na prática",
  "desenvolvimento_2_imagem": "Imagem mostrando aplicações de ${formData.tema}",
  "desenvolvimento_3_titulo": "Características de ${formData.tema}",
  "desenvolvimento_3_conteudo": "Características específicas de ${formData.tema}",
  "desenvolvimento_3_imagem": "Imagem das características de ${formData.tema}",
  "desenvolvimento_4_titulo": "Importância de ${formData.tema}",
  "desenvolvimento_4_conteudo": "Por que ${formData.tema} é importante para os estudantes",
  "desenvolvimento_4_imagem": "Imagem da importância de ${formData.tema}",
  "conclusao_titulo": "Síntese sobre ${formData.tema}",
  "conclusao_conteudo": "Resumo e pontos principais sobre ${formData.tema}"
}

Garanta que cada slide aborde especificamente o tema "${formData.tema}" de forma educativa e adequada.
`;
    } else if (materialType === 'atividade') {
      const tiposQuestoes = formData.tiposQuestoes || ['multipla-escolha', 'verdadeiro-falso', 'dissertativa'];
      const numeroQuestoes = formData.numeroQuestoes || 10;
      
      prompt = `
Você é um especialista em educação brasileira e avaliação pedagógica. Crie uma atividade educativa ESPECÍFICA sobre o tema "${formData.tema}" para a disciplina ${formData.disciplina} da série ${formData.serie}.

TEMA PRINCIPAL: ${formData.tema}
DISCIPLINA: ${formData.disciplina}
SÉRIE/ANO: ${formData.serie}

INSTRUÇÕES IMPORTANTES:
- TODAS as questões devem abordar diretamente o tema "${formData.tema}"
- Use linguagem adequada à série ${formData.serie}
- Crie questões que avaliem diferentes níveis de conhecimento sobre o tema
- Inclua ${numeroQuestoes} questões dos tipos: ${tiposQuestoes.join(', ')}
- Responda APENAS com JSON válido, sem explicações adicionais

Estrutura obrigatória do JSON:
{
  "titulo": "Atividade sobre ${formData.tema}",
  "disciplina": "${formData.disciplina}",
  "serie": "${formData.serie}",
  "tema": "${formData.tema}",
  "instrucoes": "Instruções específicas para a atividade sobre ${formData.tema}",
  "questoes": [
    {
      "numero": 1,
      "tipo": "multipla-escolha",
      "pergunta": "Pergunta específica sobre ${formData.tema}",
      "opcoes": ["A) Opção relacionada a ${formData.tema}", "B) Opção relacionada a ${formData.tema}", "C) Opção relacionada a ${formData.tema}", "D) Opção relacionada a ${formData.tema}"],
      "resposta": "A"
    }
  ]
}

Crie exatamente ${numeroQuestoes} questões, todas focadas no tema "${formData.tema}".
`;
    } else if (materialType === 'avaliacao') {
      const assuntos = formData.assuntos || [formData.tema];
      const tiposQuestoes = formData.tiposQuestoes || ['multipla-escolha', 'verdadeiro-falso', 'dissertativa'];
      const quantidadeQuestoes = formData.quantidadeQuestoes || 10;
      
      prompt = `
Você é um especialista em educação brasileira e avaliação pedagógica. Crie uma avaliação ESPECÍFICA sobre o tema "${formData.tema}" para a disciplina ${formData.disciplina} da série ${formData.serie}.

TEMA PRINCIPAL: ${formData.tema}
DISCIPLINA: ${formData.disciplina}
SÉRIE/ANO: ${formData.serie}
ASSUNTOS: ${assuntos.join(', ')}

INSTRUÇÕES IMPORTANTES:
- TODAS as questões devem abordar especificamente o tema "${formData.tema}"
- Use linguagem adequada à série ${formData.serie}
- Crie questões de diferentes níveis de dificuldade sobre o tema
- Inclua ${quantidadeQuestoes} questões dos tipos: ${tiposQuestoes.join(', ')}
- Responda APENAS com JSON válido, sem explicações adicionais

Estrutura obrigatória do JSON:
{
  "titulo": "Avaliação sobre ${formData.tema}",
  "disciplina": "${formData.disciplina}",
  "serie": "${formData.serie}",
  "assuntos": ${JSON.stringify(assuntos)},
  "instrucoes": "Instruções específicas para a avaliação sobre ${formData.tema}",
  "tempoLimite": "Tempo adequado para avaliação sobre ${formData.tema}",
  "questoes": [
    {
      "numero": 1,
      "tipo": "multipla-escolha",
      "pergunta": "Pergunta específica sobre ${formData.tema}",
      "opcoes": ["A) Opção sobre ${formData.tema}", "B) Opção sobre ${formData.tema}", "C) Opção sobre ${formData.tema}", "D) Opção sobre ${formData.tema}"],
      "pontuacao": 1.0
    }
  ]
}

Crie exatamente ${quantidadeQuestoes} questões, todas relacionadas diretamente ao tema "${formData.tema}".
`;
    }

    // Prompt específico para Material de Apoio
    if (materialType === 'apoio') {
      console.log('🎯 Generated prompt for apoio');
      
      const prompt = `
Você é um especialista em educação brasileira e pedagogo experiente. Gere um Material de Apoio ao Professor ESPECÍFICO sobre o tema "${formData.tema}" para o ensino de ${formData.disciplina} na série ${formData.serie}.

TEMA PRINCIPAL: ${formData.tema}
DISCIPLINA: ${formData.disciplina}
SÉRIE/ANO: ${formData.serie}

INSTRUÇÕES IMPORTANTES:
- TODO o conteúdo deve estar FOCADO no tema "${formData.tema}"
- Use linguagem didática e prática para professores
- Forneça orientações específicas para ensinar "${formData.tema}"
- Inclua exemplos concretos relacionados ao tema
- Responda APENAS com JSON válido, sem explicações adicionais

Estrutura obrigatória do JSON com foco no tema "${formData.tema}":

{
  "TEMA_DO_MATERIAL_PRINCIPAL": "${formData.tema}",
  "DISCIPLINA": "${formData.disciplina}",
  "NIVEL_ANO": "${formData.serie}",
  "TIPO_DE_MATERIAL_PRINCIPAL": "Material de Apoio",
  "TEMA_DO_MATERIAL": "${formData.tema}",
  "TURMA_DO_MATERIAL": "${formData.serie}",
  "DATA_GERACAO": "${new Date().toLocaleDateString('pt-BR')}",
  
  "EXPLICACAO_SIMPLES_DO_TEMA": "Explicação simples e didática sobre ${formData.tema}",
  "EXPLICACAO_DETALHADA_DO_TEMA": "Explicação detalhada sobre ${formData.tema}, com conceitos fundamentais",
  
  "EXPLICACAO_SIMPLES_UTILIDADE": "Para que serve ${formData.tema} na vida prática dos alunos",
  "EXPLICACAO_DETALHADA_UTILIDADE": "Importância detalhada de ${formData.tema} na formação dos estudantes",
  "IMPORTANCIA_NA_FORMACAO_ITEM_1": "Primeiro aspecto da importância de ${formData.tema}",
  "IMPORTANCIA_NA_FORMACAO_ITEM_2": "Segundo aspecto da importância de ${formData.tema}",
  "IMPORTANCIA_NA_FORMACAO_ITEM_3": "Terceiro aspecto da importância de ${formData.tema}",
  
  "EXPLICACAO_SIMPLES_ENSINO": "Como ensinar ${formData.tema} de forma simples",
  "EXPLICACAO_DETALHADA_ENSINO": "Metodologia detalhada para ensinar ${formData.tema}",
  "PASSO_A_PASSO_ITEM_1_INICIAR": "Como iniciar a aula sobre ${formData.tema}",
  "PASSO_A_PASSO_ITEM_2_DESENVOLVER": "Como desenvolver o conteúdo de ${formData.tema}",
  "PASSO_A_PASSO_ITEM_3_CONCLUIR": "Como concluir a aula sobre ${formData.tema}",
  
  "HIGHLIGHT_TITULO_1": "Dica Importante sobre ${formData.tema}",
  "HIGHLIGHT_TEXTO_1": "Dica prática específica para ensinar ${formData.tema}",
  "PARAGRAFO_COMO_ENSINAR_P3": "Orientações adicionais para ensinar ${formData.tema}",
  "SUGESTAO_VISUAL_OU_CONCRETA_ITEM_1": "Recurso visual específico para ${formData.tema}",
  "SUGESTAO_VISUAL_OU_CONCRETA_ITEM_2": "Recurso concreto específico para ${formData.tema}",
  
  "EXPLICACAO_SIMPLES_EXEMPLOS": "Como usar exemplos práticos de ${formData.tema}",
  "EXPLICACAO_DETALHADA_EXEMPLOS": "Estratégias para exemplificar ${formData.tema}",
  "TITULO_EXEMPLO_1": "Exemplo Prático 1 de ${formData.tema}",
  "DESCRICAO_EXEMPLO_1": "Descrição detalhada do primeiro exemplo sobre ${formData.tema}",
  "COMENTARIO_EXEMPLO_1": "Como aplicar este exemplo de ${formData.tema} em sala",
  "TITULO_EXEMPLO_2": "Exemplo Prático 2 de ${formData.tema}",
  "DESCRICAO_EXEMPLO_2": "Descrição detalhada do segundo exemplo sobre ${formData.tema}",
  "COMENTARIO_EXEMPLO_2": "Como aplicar este segundo exemplo de ${formData.tema} em sala",
  
  "SUCCESS_BOX_TITULO_1": "Sucesso ao Ensinar ${formData.tema}",
  "SUCCESS_BOX_TEXTO_1": "Estratégia comprovada para ensinar ${formData.tema} com eficácia",
  
  "EXPLICACAO_SIMPLES_DIFICULDADES": "Principais dificuldades dos alunos com ${formData.tema}",
  "EXPLICACAO_DETALHADA_DIFICULDADES": "Análise detalhada das dificuldades em ${formData.tema}",
  "TITULO_DIFICULDADE_1": "Dificuldade Comum 1 em ${formData.tema}",
  "DESCRICAO_DIFICULDADE_1": "Descrição da primeira dificuldade com ${formData.tema}",
  "CORRECAO_DIFICULDADE_1": "Como corrigir esta dificuldade em ${formData.tema}",
  "TITULO_DIFICULDADE_2": "Dificuldade Comum 2 em ${formData.tema}",
  "DESCRICAO_DIFICULDADE_2": "Descrição da segunda dificuldade com ${formData.tema}",
  "CORRECAO_DIFICULDADE_2": "Como corrigir esta segunda dificuldade em ${formData.tema}",
  
  "EXPLICACAO_SIMPLES_ATIVIDADES": "Atividades práticas para ${formData.tema}",
  "EXPLICACAO_DETALHADA_ATIVIDADES": "Estratégias de atividades para ensinar ${formData.tema}",
  "ATIVIDADE_PRATICA_1_DESCRICAO": "Primeira atividade prática específica para ${formData.tema}",
  "ATIVIDADE_PRATICA_2_DESCRICAO": "Segunda atividade prática específica para ${formData.tema}",
  
  "EXPLICACAO_SIMPLES_RECURSOS": "Recursos complementares para ${formData.tema}",
  "EXPLICACAO_DETALHADA_RECURSOS": "Como usar recursos extras para ensinar ${formData.tema}",
  "RECURSO_VIDEO_DESCRICAO": "Vídeo recomendado sobre ${formData.tema}",
  "RECURSO_VIDEO_LINK": "Link ou sugestão de busca por vídeos sobre ${formData.tema}",
  "RECURSO_IMAGEM_DESCRICAO": "Imagens úteis para ensinar ${formData.tema}",
  "RECURSO_IMAGEM_LINK": "Sugestão de busca por imagens sobre ${formData.tema}",
  "RECURSO_SITE_DESCRICAO": "Site interativo para ${formData.tema}",
  "RECURSO_SITE_LINK": "Sugestão de sites sobre ${formData.tema}",
  "RECURSO_OBJETO_DESCRICAO": "Objetos manipuláveis para ensinar ${formData.tema}",
  
  "SUCCESS_BOX_TITULO_2": "Recursos Eficazes para ${formData.tema}",
  "SUCCESS_BOX_TEXTO_2": "Dica final para usar recursos no ensino de ${formData.tema}"
}

IMPORTANTE: Certifique-se de que TODOS os campos estejam preenchidos com conteúdo específico e relevante para o tema "${formData.tema}".
`;

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
              content: `Você é um especialista em educação brasileira que cria materiais de apoio para professores. Foque especificamente no tema "${formData.tema}" para ${formData.disciplina} da série ${formData.serie}. Responda APENAS com JSON válido.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 1.0,
          frequency_penalty: 0.2,
          presence_penalty: 0.0
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

      // Substituir variáveis no template (corrigido para slides)
      function replaceAllPlaceholders(template, data) {
        let result = template;
        Object.entries(data).forEach(([key, value]) => {
          const placeholder = new RegExp(`{{${key}}}`, 'g');
          if (typeof value === 'object' && value !== null) {
            // Se for objeto ou array, faz stringificação simples
            result = result.replace(placeholder, JSON.stringify(value));
          } else {
            result = result.replace(placeholder, value !== undefined && value !== null ? String(value) : '');
          }
        });
        return result;
      }

      let finalHtml = SUPPORT_MATERIAL_TEMPLATE;
      finalHtml = replaceAllPlaceholders(finalHtml, parsedContent);

      // Salvar no banco de dados
      const { data: materialApoio, error: insertError } = await supabase
        .from('materiais')
        .insert({
          titulo: parsedContent.TEMA_DO_MATERIAL_PRINCIPAL || 'Material de Apoio',
          conteudo: finalHtml,
          disciplina: formData.disciplina,
          tema: formData.tema,
          turma: formData.serie,
          user_id: formData.user_id,
          material_principal_id: formData.material_principal_id,
          tipo_material: 'apoio',
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

    // Bloco específico para slides
    if (materialType === 'slides') {
      // Template HTML dos slides (resumido, use o template real do seu projeto)
      const SLIDES_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{{titulo}}</title>
  <style>
    body { background: #f0f4f8; font-family: 'Inter', sans-serif; }
    .slide { width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .image-placeholder { width: 400px; height: 250px; background: #eee; display: flex; align-items: center; justify-content: center; border-radius: 16px; margin: 24px auto; }
    h1, h2, h3 { color: #1e40af; }
  </style>
</head>
<body>
  <!-- Slide 1 -->
  <div class="slide">
    <h1>{{titulo}}</h1>
    <h2>{{disciplina}} - {{serie}}</h2>
    <div class="image-placeholder">{{tema_imagem}}</div>
    <p>Apresentado por: {{professor}}</p>
  </div>
  <!-- Slide 2 -->
  <div class="slide">
    <h2>Objetivos da Aula</h2>
    <ul>
      <li>{{objetivo_1}}</li>
      <li>{{objetivo_2}}</li>
      <li>{{objetivo_3}}</li>
      <li>{{objetivo_4}}</li>
    </ul>
  </div>
  <!-- Slide 3 -->
  <div class="slide">
    <h2>{{introducao_titulo}}</h2>
    <p>{{introducao_conteudo}}</p>
    <div class="image-placeholder">{{introducao_imagem}}</div>
  </div>
  <!-- Slide 4 -->
  <div class="slide">
    <h2>{{conceitos_titulo}}</h2>
    <p>{{conceitos_conteudo}}</p>
    <div class="image-placeholder">{{conceitos_imagem}}</div>
  </div>
  <!-- Slide 5 -->
  <div class="slide">
    <h2>{{desenvolvimento_1_titulo}}</h2>
    <p>{{desenvolvimento_1_conteudo}}</p>
    <div class="image-placeholder">{{desenvolvimento_1_imagem}}</div>
  </div>
  <!-- Slide 6 -->
  <div class="slide">
    <h2>{{desenvolvimento_2_titulo}}</h2>
    <p>{{desenvolvimento_2_conteudo}}</p>
    <div class="image-placeholder">{{desenvolvimento_2_imagem}}</div>
  </div>
  <!-- Slide 7 -->
  <div class="slide">
    <h2>{{desenvolvimento_3_titulo}}</h2>
    <p>{{desenvolvimento_3_conteudo}}</p>
    <div class="image-placeholder">{{desenvolvimento_3_imagem}}</div>
  </div>
  <!-- Slide 8 -->
  <div class="slide">
    <h2>{{desenvolvimento_4_titulo}}</h2>
    <p>{{desenvolvimento_4_conteudo}}</p>
    <div class="image-placeholder">{{desenvolvimento_4_imagem}}</div>
  </div>
  <!-- Slide 9 -->
  <div class="slide">
    <h2>{{exemplo_titulo}}</h2>
    <p>{{exemplo_conteudo}}</p>
    <div class="image-placeholder">{{exemplo_imagem}}</div>
  </div>
  <!-- Slide 10 -->
  <div class="slide">
    <h2>{{conclusao_titulo}}</h2>
    <p>{{conclusao_conteudo}}</p>
  </div>
</body>
</html>
      `;
      // Substituir variáveis
      function replaceAllPlaceholders(template, data) {
        let result = template;
        Object.entries(data).forEach(([key, value]) => {
          const placeholder = new RegExp(`{{${key}}}`, 'g');
          result = result.replace(placeholder, value !== undefined && value !== null ? String(value) : '');
        });
        return result;
      }
      let finalHtml = SLIDES_TEMPLATE;
      finalHtml = replaceAllPlaceholders(finalHtml, parsedContent);
      // Salvar no banco de dados
      const { data: materialSlides, error: insertError } = await supabase
        .from('materiais')
        .insert({
          titulo: parsedContent.titulo || 'Slides',
          conteudo: finalHtml,
          disciplina: formData.disciplina,
          tema: formData.tema,
          turma: formData.serie,
          user_id: formData.user_id,
          material_principal_id: formData.material_principal_id,
          tipo_material: 'slides',
          status: 'ativo'
        })
        .select()
        .single();
      if (insertError) {
        console.error('Erro ao salvar slides:', insertError);
        throw new Error('Falha ao salvar slides');
      }
      console.log('✅ Slides salvos com sucesso');
      return new Response(JSON.stringify({
        success: true,
        slidesId: materialSlides.id,
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
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em educação brasileira que cria materiais educativos de alta qualidade. Foque especificamente no tema "${formData.tema}" para ${formData.disciplina} da série ${formData.serie}. Responda APENAS com JSON válido, sem explicações adicionais.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1.0,
        frequency_penalty: 0.2,
        presence_penalty: 0.0
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
