export const SUPPORT_MATERIAL_TEMPLATE = `
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

[QUEBRA_DE_PAGINA]

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

[QUEBRA_DE_PAGINA]

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

[QUEBRA_DE_PAGINA]

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

[QUEBRA_DE_PAGINA]

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

export function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  
  // Substituir todas as variáveis no template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || '');
  });
  
  // Substituir quebras de página
  result = result.replace(/\[QUEBRA_DE_PAGINA\]/g, '');
  
  return result;
} 