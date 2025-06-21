class TemplateService {
  private templates = new Map<string, string>();

  constructor() {
    this.loadTemplates();
  }

  private loadTemplates() {
    // Template 1: Plano de Aula
    this.templates.set('1', `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plano de Aula</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f4f4f4;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1, h2 {
            color: #444;
            margin-bottom: 20px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 10px;
        }
        h2 {
            font-size: 1.5em;
            margin-top: 30px;
        }
        ul {
            list-style-type: square;
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 1.2em;
            color: #555;
            margin-bottom: 10px;
        }
        @media print {
            body {
                background: #fff;
                color: #000;
            }
            .container {
                box-shadow: none;
                border-radius: 0;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Plano de Aula</h1>

        <div class="section">
            <h2 class="section-title">Informações Gerais</h2>
            <p><strong>Professor(a):</strong> {{professor}}</p>
            <p><strong>Disciplina:</strong> {{disciplina}}</p>
            <p><strong>Tema:</strong> {{tema}}</p>
            <p><strong>Duração:</strong> {{duracao}}</p>
            <p><strong>Série:</strong> {{serie}}</p>
        </div>

        <div class="section">
            <h2 class="section-title">Objetivos</h2>
            <ul>
                {{#objetivos}}
                <li>{{.}}</li>
                {{/objetivos}}
            </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Desenvolvimento</h2>
            {{#desenvolvimento}}
            <div class="etapa">
                <h3>Etapa: {{etapa}}</h3>
                <p><strong>Atividade:</strong> {{atividade}}</p>
                <p><strong>Tempo:</strong> {{tempo}}</p>
            </div>
            {{/desenvolvimento}}
        </div>

        <div class="section">
            <h2 class="section-title">Recursos</h2>
            <ul>
                {{#recursos}}
                <li>{{.}}</li>
                {{/recursos}}
            </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Avaliação</h2>
            <p>{{avaliacao}}</p>
        </div>
    </div>
</body>
</html>
    `);

    // Template 2: Slides
    this.templates.set('2', `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slides</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f4f4f4;
            padding: 20px;
        }
        .slide {
            max-width: 800px;
            margin: 20px auto;
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #444;
            margin-bottom: 20px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 10px;
        }
        ul {
            list-style-type: disc;
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        @media print {
            body {
                background: #fff;
                color: #000;
            }
            .slide {
                box-shadow: none;
                border-radius: 0;
                padding: 0;
                margin: 0;
                page-break-after: always;
            }
            .slide:last-child {
                page-break-after: auto;
            }
        }
    </style>
</head>
<body>
    {{#slides}}
    <div class="slide">
        <h1>{{titulo}}</h1>
        <ul>
            {{#conteudo}}
            <li>{{.}}</li>
            {{/conteudo}}
        </ul>
    </div>
    {{/slides}}
</body>
</html>
    `);

    // Template 3: Atividade com quebras de página corrigidas
    this.templates.set('3', `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Atividade – AulagIA</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    /* Define página A4 para impressão e visualização */
    @page {
      size: A4;
      margin: 15mm 20mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      background: #f0f4f8;
      font-family: 'Inter', sans-serif;
      line-height: 1.4;
      color: #1f2937;
      font-size: 14px;
    }
    
    /* Container principal da página */
    .page-container {
      width: 210mm;
      min-height: 297mm;
      background: white;
      margin: 0 auto 20px auto;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      border-radius: 6px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      page-break-after: always;
    }
    
    .page-container:last-child {
      page-break-after: auto;
      margin-bottom: 0;
    }
    
    /* Formas decorativas */
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
    
    /* Cabeçalho fixo */
    .header {
      position: absolute;
      top: 15mm;
      left: 20mm;
      right: 20mm;
      height: 15mm;
      display: flex;
      align-items: center;
      z-index: 10;
      background: transparent;
    }
    
    .header .logo-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .header .logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 2px 6px rgba(14, 165, 233, 0.2);
    }
    
    .header .logo svg {
      width: 18px;
      height: 18px;
      stroke: white;
      fill: none;
      stroke-width: 2;
    }
    
    .header .brand-text h1 {
      font-size: 20px;
      color: #0ea5e9;
      margin: 0;
      font-weight: 700;
      letter-spacing: -0.2px;
      line-height: 1;
    }
    
    .header .brand-text p {
      font-size: 8px;
      color: #6b7280;
      margin: -1px 0 0 0;
      font-weight: 400;
      line-height: 1;
    }
    
    /* Área de conteúdo principal */
    .content {
      position: absolute;
      top: 35mm;
      left: 20mm;
      right: 20mm;
      bottom: 25mm;
      z-index: 5;
      overflow: visible;
      display: flex;
      flex-direction: column;
    }
    
    .content.subsequent-page {
      top: 35mm;
    }
    
    /* Título principal */
    .title {
      text-align: center;
      margin: 0 0 20px 0;
      font-size: 24px;
      color: #4f46e5;
      font-weight: 700;
      position: relative;
    }
    
    .title::after {
      content: '';
      width: 50px;
      height: 3px;
      background: #a78bfa;
      display: block;
      margin: 8px auto 0;
      border-radius: 2px;
    }
    
    /* Tabela de informações */
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .info-table th,
    .info-table td {
      padding: 10px 12px;
      font-size: 13px;
      border: none;
      vertical-align: middle;
    }
    
    .info-table th {
      background: #f3f4f6;
      color: #1f2937;
      font-weight: 600;
      text-align: left;
      width: 20%;
    }
    
    .info-table td {
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .info-table tr:last-child td {
      border-bottom: none;
    }
    
    /* Instruções */
    .instructions {
      background: #eff6ff;
      padding: 16px;
      border-left: 4px solid #0ea5e9;
      margin-bottom: 25px;
      border-radius: 6px;
      font-size: 13px;
      line-height: 1.5;
    }
    
    .instructions strong {
      display: block;
      margin-bottom: 8px;
      color: #1e40af;
      font-weight: 600;
    }
    
    /* Área de questões */
    .questions-area {
      flex: 1;
      overflow: visible;
    }
    
    /* Questões individuais */
    .question {
      margin-bottom: 25px;
      page-break-inside: avoid;
      break-inside: avoid;
      position: relative;
    }
    
    .question-header {
      font-weight: 600;
      color: #4338ca;
      margin-bottom: 12px;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .question-number {
      background: #4338ca;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
    }
    
    .question-text {
      margin-bottom: 16px;
      text-align: justify;
      font-size: 13px;
      line-height: 1.5;
      color: #374151;
    }
    
    .question-options {
      margin-left: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .question-option {
      display: flex;
      align-items: flex-start;
      font-size: 13px;
      line-height: 1.4;
      padding: 8px 12px;
      background: #f9fafb;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    
    .option-letter {
      font-weight: 700;
      color: #4338ca;
      min-width: 25px;
      margin-right: 12px;
    }
    
    .option-text {
      flex: 1;
      color: #374151;
    }
    
    /* Espaços para respostas */
    .answer-space {
      border: 2px dashed #d1d5db;
      min-height: 60px;
      margin: 15px 0;
      padding: 12px;
      border-radius: 6px;
      background: #fafafa;
      position: relative;
    }
    
    .answer-space::before {
      content: 'Espaço para resposta';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #9ca3af;
      font-size: 12px;
      font-style: italic;
    }
    
    .answer-lines {
      border-bottom: 1px solid #d1d5db;
      margin-bottom: 12px;
      height: 24px;
    }
    
    .answer-lines:last-child {
      margin-bottom: 0;
    }
    
    /* Espaço para cálculos matemáticos */
    .math-space {
      border: 2px dashed #e5e7eb;
      min-height: 100px;
      margin: 15px 0;
      padding: 20px;
      border-radius: 8px;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 12px;
      font-style: italic;
    }
    
    /* Espaços para imagens */
    .image-space {
      border: 2px dashed #d1d5db;
      min-height: 120px;
      margin: 15px 0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 12px;
      background: #fafafa;
      font-style: italic;
    }
    
    /* Rodapé fixo */
    .footer {
      position: absolute;
      bottom: 15mm;
      left: 20mm;
      right: 20mm;
      text-align: center;
      font-size: 10px;
      color: #6b7280;
      z-index: 10;
      background: transparent;
      font-weight: 400;
    }
    
    /* Ajustes para impressão */
    @media print {
      body { 
        margin: 0; 
        padding: 0; 
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .page-container { 
        box-shadow: none; 
        margin: 0;
        border-radius: 0;
        width: 100%;
        min-height: 100vh;
        page-break-after: always;
        display: flex;
        flex-direction: column;
      }
      
      .page-container:last-child {
        page-break-after: auto;
      }
      
      .shape-circle {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        margin: 15mm 20mm 0;
        background: white;
      }
      
      .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        margin: 0 20mm 15mm;
        background: white;
      }
      
      .content {
        position: static;
        margin: 30mm 0 20mm;
        padding: 0;
      }
      
      .header .logo {
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .title {
        color: #4f46e5 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .title::after {
        background: #a78bfa !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .question-header {
        color: #4338ca !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .question-number {
        background: #4338ca !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .info-table th {
        background: #f3f4f6 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .instructions {
        background: #eff6ff !important;
        border-left: 4px solid #0ea5e9 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .question {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Formas decorativas -->
    <div class="shape-circle purple"></div>
    <div class="shape-circle blue"></div>

    <!-- Cabeçalho AulagIA -->
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

    <!-- Rodapé -->
    <div class="footer">
      Atividade gerada pela AulagIA - Sua aula com toque mágico • aulagia.com.br
    </div>

    <!-- Conteúdo principal -->
    <div class="content">
      <!-- Título da Atividade -->
      <h2 class="title">ATIVIDADE</h2>

      <!-- Informações básicas -->
      <table class="info-table">
        <tr>
          <th>Escola:</th>
          <td>_________________________________</td>
          <th>Data:</th>
          <td>_________________</td>
        </tr>
        <tr>
          <th>Disciplina:</th>
          <td>{{subject}}</td>
          <th>Série/Ano:</th>
          <td>{{grade}}</td>
        </tr>
        <tr>
          <th>Aluno(a):</th>
          <td>____________________________________________</td>
          <th>BNCC:</th>
          <td>{{bnccCode}}</td>
        </tr>
      </table>

      <!-- Instruções -->
      <div class="instructions">
        <strong>{{title}}</strong>
        {{instructions}}
      </div>

      <!-- Área de questões -->
      <div class="questions-area">
        {{questionsContent}}
      </div>
    </div>
  </div>
</body>
</html>
    `);

    // Template 4: Avaliação
    this.templates.set('4', `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Avaliação</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f4f4f4;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1, h2 {
            color: #444;
            margin-bottom: 20px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 10px;
        }
        ul {
            list-style-type: disc;
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .question {
            margin-bottom: 20px;
        }
        .options {
            margin-left: 20px;
        }
        @media print {
            body {
                background: #fff;
                color: #000;
            }
            .container {
                box-shadow: none;
                border-radius: 0;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Avaliação</h1>
        <h2>{{title}}</h2>
        <p><strong>Instruções:</strong> {{instructions}}</p>
        <p><strong>Tempo Limite:</strong> {{tempoLimite}}</p>

        {{#questoes}}
        <div class="question">
            <h3>Questão {{numero}} ({{pontuacao}} pontos)</h3>
            <p>{{pergunta}}</p>
            {{#opcoes}}
            <div class="options">
                <li>{{.}}</li>
            </div>
            {{/opcoes}}
        </div>
        {{/questoes}}
    </div>
</body>
</html>
    `);
  }

  renderTemplate(templateId: string, content: any): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} não encontrado`);
    }

    // Renderização específica para atividades (template 3)
    if (templateId === '3') {
      return this.renderActivityTemplate(template, content);
    }

    // Renderização para slides (template 2)
    if (templateId === '2') {
      let rendered = template;
      // Certifique-se de que 'content' é um objeto com a propriedade 'slides'
      if (content && content.slides && Array.isArray(content.slides)) {
        // Use a função 'replace' com um loop para substituir todas as ocorrências
        let slidesHtml = '';
        for (const slide of content.slides) {
          let slideHtml = `<div class="slide">
            <h1>${slide.titulo}</h1>
            <ul>`;
          if (slide.conteudo && Array.isArray(slide.conteudo)) {
            for (const item of slide.conteudo) {
              slideHtml += `<li>${item}</li>`;
            }
          }
          slideHtml += `</ul></div>`;
          slidesHtml += slideHtml;
        }
        rendered = rendered.replace(/\{\{slides\}\}/g, slidesHtml);
      }
      return rendered;
    }
    
    return template;
  }

  private renderActivityTemplate(template: string, content: any): string {
    let rendered = template;

    // Substituir informações básicas
    rendered = rendered.replace(/\{\{subject\}\}/g, content.disciplina || 'Disciplina');
    rendered = rendered.replace(/\{\{grade\}\}/g, content.serie || 'Série');
    rendered = rendered.replace(/\{\{title\}\}/g, content.titulo || 'Atividade');
    rendered = rendered.replace(/\{\{instructions\}\}/g, content.instrucoes || 'Instruções da atividade');
    rendered = rendered.replace(/\{\{bnccCode\}\}/g, content.bnccCode || '');

    // Renderizar questões
    if (content.questoes && Array.isArray(content.questoes)) {
      const questionsHtml = this.renderQuestions(content.questoes);
      rendered = rendered.replace(/\{\{questionsContent\}\}/g, questionsHtml);
    } else {
      rendered = rendered.replace(/\{\{questionsContent\}\}/g, '');
    }

    return rendered;
  }

  private renderQuestions(questoes: any[]): string {
    return questoes.map((questao, index) => {
      const questionNumber = questao.numero || (index + 1);
      let questionHtml = `
        <div class="question">
          <div class="question-header">
            <div class="question-number">${questionNumber}</div>
            <span>Questão ${questionNumber}</span>
          </div>
          <div class="question-text">${questao.pergunta || ''}</div>
      `;

      // Renderizar opções baseadas no tipo
      if (questao.tipo === 'multipla_escolha' && questao.opcoes) {
        questionHtml += '<div class="question-options">';
        questao.opcoes.forEach((opcao: string, optIndex: number) => {
          const letter = String.fromCharCode(65 + optIndex);
          questionHtml += `
            <div class="question-option">
              <span class="option-letter">${letter})</span>
              <span class="option-text">${opcao}</span>
            </div>
          `;
        });
        questionHtml += '</div>';
      } else if (questao.tipo === 'dissertativa' || questao.tipo === 'aberta') {
        questionHtml += '<div class="answer-space"></div>';
        for (let i = 0; i < 4; i++) {
          questionHtml += '<div class="answer-lines"></div>';
        }
      } else if (questao.tipo === 'calculo') {
        questionHtml += '<div class="math-space">Espaço para cálculos</div>';
      } else if (questao.tipo === 'desenho' || questao.tipo === 'esquema') {
        questionHtml += '<div class="image-space">Espaço para desenho/esquema</div>';
      } else if (questao.tipo === 'verdadeiro_falso') {
        questionHtml += `
          <div class="question-options">
            <div class="question-option">
              <span class="option-letter">( )</span>
              <span class="option-text">Verdadeiro</span>
            </div>
            <div class="question-option">
              <span class="option-letter">( )</span>
              <span class="option-text">Falso</span>
            </div>
          </div>
        `;
      }

      questionHtml += '</div>';
      return questionHtml;
    }).join('');
  }

  getTemplate(templateId: string): string | undefined {
    return this.templates.get(templateId);
  }
}

export const templateService = new TemplateService();
