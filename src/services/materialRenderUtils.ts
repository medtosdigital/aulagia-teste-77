// materialRenderUtils.ts
// Utilitário para renderização e paginação de materiais (preview e exportação)

export function splitContentIntoPages(htmlContent: string, material: any): string[] {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Para atividades e avaliações
  if (material.type === 'atividade' || material.type === 'avaliacao') {
    const pages: string[] = [];
    const questions = tempDiv.querySelectorAll('.questao-container, .question');
    if (questions.length === 0) return [htmlContent];
    const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
    const instructions = tempDiv.querySelector('.instructions-section')?.outerHTML || '';
    const questionsPerPage = 4;
    let questionIndex = 0;
    let isFirstPage = true;
    while (questionIndex < questions.length) {
      const questionsForPage = [];
      let limit = isFirstPage ? 3 : questionsPerPage;
      for (let i = 0; i < limit && questionIndex < questions.length; i++) {
        questionsForPage.push(questions[questionIndex]);
        questionIndex++;
      }
      let pageContent = '';
      if (isFirstPage) {
        pageContent += material.type === 'atividade' ? '<h2>ATIVIDADE</h2>' : '<h2>AVALIAÇÃO</h2>';
        pageContent += `
          <table>
            <tr>
              <th>Escola:</th>
              <td>_________________________________</td>
              <th>Data:</th>
              <td>${new Date().toLocaleDateString('pt-BR')}</td>
            </tr>
            <tr>
              <th>Disciplina:</th>
              <td>${material.subject ? material.subject.charAt(0).toUpperCase() + material.subject.slice(1) : '[DISCIPLINA]'}</td>
              <th>Série/Ano:</th>
              <td>${material.grade || '[SERIE_ANO]'}</td>
            </tr>
            <tr>
              <th>Aluno(a):</th>
              <td class="student-info-cell">____________________________________________</td>
              <th>${material.type === 'avaliacao' ? 'NOTA:' : 'BNCC:'}</th>
              <td class="student-info-cell ${material.type === 'avaliacao' ? 'nota-highlight-cell' : ''}">${material.type === 'avaliacao' ? '' : '{bncc}'}</td>
            </tr>
          </table>
        `;
        pageContent += `
          <div class="instructions">
            <strong>${material.title}:</strong><br>
            ${instructions || (material.type === 'avaliacao' ? 'Leia com atenção cada questão e escolha a alternativa correta ou responda de forma completa.' : 'Leia atentamente cada questão e responda de acordo com o solicitado.')}
          </div>
        `;
      }
      questionsForPage.forEach(question => {
        pageContent += question.outerHTML;
      });
      pages.push(wrapPageContentWithTemplate(pageContent, isFirstPage, material));
      isFirstPage = false;
    }
    return pages.length > 0 ? pages : [htmlContent];
  }

  // Para planos de aula
  if (material.type === 'plano-de-aula') {
    const sections = tempDiv.querySelectorAll('.section');
    if (sections.length <= 1) return [htmlContent];
    const pages: string[] = [];
    const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
    let metodologiaIdx = -1, avaliacaoIdx = -1, referenciasIdx = -1;
    let recursosIdx = -1, conteudosIdx = -1;
    sections.forEach((section, idx) => {
      const h3 = section.querySelector('h3');
      if (!h3) return;
      const title = h3.textContent?.toLowerCase() || '';
      if (title.includes('recursos didáticos')) recursosIdx = idx;
      if (title.includes('conteúdos programáticos')) conteudosIdx = idx;
      if (title.includes('metodologia')) metodologiaIdx = idx;
      if (title.includes('avaliação')) avaliacaoIdx = idx;
      if (title.includes('referências')) referenciasIdx = idx;
    });
    const firstPageSections = Array.from(sections).slice(0, recursosIdx);
    const secondPageSections = Array.from(sections).slice(recursosIdx, referenciasIdx + 1);
    let pageContent = header;
    firstPageSections.forEach(section => { pageContent += section.outerHTML; });
    pages.push(wrapPageContentWithTemplate(pageContent, true, material));
    let secondPageContent = '';
    secondPageSections.forEach(section => { secondPageContent += section.outerHTML; });
    pages.push(wrapPageContentWithTemplate(secondPageContent, false, material));
    return pages.length > 0 ? pages : [htmlContent];
  }
  return [htmlContent];
}

function wrapPageContentWithTemplate(content: string, isFirstPage: boolean, material: any): string {
  const pageClass = isFirstPage ? 'first-page-content' : 'subsequent-page-content';
  const contentClass = isFirstPage ? 'content' : 'content subsequent-page';
  const getFooterText = () => {
    if (material.type === 'plano-de-aula') {
      return `Plano de aula gerado pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
    } else if (material.type === 'atividade') {
      return `Atividade gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
    } else {
      return `Avaliação gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
    }
  };
  return `
    <div class="page ${pageClass}">
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
        ${getFooterText()}
      </div>
      <div class="${contentClass}">
        ${content}
      </div>
    </div>
  `;
}

export function enhanceHtmlWithNewTemplate(htmlContent: string, material: any): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${material.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        /* (Cole aqui TODO o CSS do preview do MaterialPreview.tsx, incluindo estilos de página, cabeçalho, tabelas, seções, etc) */
        body {
          margin: 0;
          padding: 0;
          background: #f0f4f8;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
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
          width: 180px; height: 180px;
          background: #a78bfa;
          top: -60px; left: -40px;
        }
        .shape-circle.blue {
          width: 240px; height: 240px;
          background: #60a5fa;
          bottom: -80px; right: -60px;
        }
        .header {
          position: absolute;
          top: 6mm;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          z-index: 999;
          height: 12mm;
          background: transparent;
          padding: 0 12mm;
          flex-shrink: 0;
        }
        .header .logo-container {
          display: flex;
          align-items: center;
          gap: 3px;
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
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(14, 165, 233, 0.2);
        }
        .header .logo svg {
          width: 16px;
          height: 16px;
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
          font-size: 20px;
          color: #0ea5e9;
          margin: 0;
          font-family: 'Inter', sans-serif;
          line-height: 1;
          font-weight: 700;
          letter-spacing: -0.2px;
          text-transform: none;
        }
        .header .brand-text p {
          font-size: 10px !important;
          color: #6b7280 !important;
          font-weight: 400 !important;
          margin: 0 !important;
          line-height: 1 !important;
        }
        .content {
          margin-top: 20mm;
          margin-bottom: 12mm;
          padding: 0 15mm;
          position: relative;
          flex: 1;
          overflow: visible;
          z-index: 1;
        }
        .content.subsequent-page {
          margin-top: 40mm;
        }
        h2 {
          text-align: center;
          margin: 10px 0 18px 0;
          font-size: 1.5rem;
          color: #4338ca !important;
          position: relative;
          font-family: 'Inter', sans-serif;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px;
        }
        h2::after {
          content: '';
          width: 60px;
          height: 4px;
          background: #a5b4fc;
          display: block;
          margin: 8px auto 0;
          border-radius: 2px;
        }
        .section h3 {
          color: #4338ca !important;
          font-size: 1.00rem !important;
          margin-bottom: 12px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          border-bottom: none !important;
          padding-bottom: 0 !important;
          font-family: 'Inter', sans-serif !important;
        }
        .objectives-list li, .skills-list li, .resources-list li, p, .content-text, .evaluation-text {
          font-size: 0.90rem !important;
        }
        td, th {
          font-size: 0.85rem !important;
        }
        .development-table td, .development-table th {
          font-size: 0.80rem !important;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 18px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        th, td {
          padding: 8px 12px;
          font-size: 0.85rem;
          border: none;
          font-family: 'Inter', sans-serif;
          vertical-align: top;
        }
        th {
          background: #f3f4f6;
          color: #1f2937;
          font-weight: 600;
          text-align: left;
          width: 18%;
        }
        td {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
        }
        td:last-child {
          border-bottom: none;
        }
        table .student-info-cell {
          width: 32%;
        }
        .nota-highlight-cell {
          background-color: #fef3c7;
          color: #000000;
          font-weight: 600;
          border: 2px solid #f59e0b;
        }
        .instructions {
          background: #eff6ff;
          padding: 15px;
          border-left: 4px solid #0ea5e9;
          margin-bottom: 30px;
          font-family: 'Inter', sans-serif;
          border-radius: 6px;
        }
        .questao-container, .question {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .questao-numero, .question-header {
          font-weight: 600;
          color: #4338ca;
          margin-bottom: 10px;
          font-size: 1.0rem;
          font-family: 'Inter', sans-serif;
        }
        .questao-enunciado, .question-text {
          margin-bottom: 15px;
          text-align: justify;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        .questao-opcoes, .options {
          margin-left: 20px;
        }
        .opcao, .option {
          margin-bottom: 8px;
          display: flex;
          align-items: flex-start;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
        }
        .opcao-letra, .option-letter {
          font-weight: bold;
          margin-right: 10px;
          color: #4338ca;
          min-width: 25px;
        }
        .answer-lines {
          border-bottom: 1px solid #d1d5db;
          margin-bottom: 8px;
          height: 20px;
          padding: 0;
          background: none;
          border-radius: 0;
          min-height: 20px;
        }
        .answer-lines:last-child {
          margin-bottom: 0;
        }
        .math-space {
          border: 1px solid #e5e7eb;
          min-height: 80px;
          margin: 10px 0;
          padding: 15px;
          border-radius: 4px;
          background: #fafafa;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-size: 0.8rem;
        }
        .matching-section {
          display: flex;
          gap: 30px;
          margin: 15px 0;
        }
        .matching-column {
          flex: 1;
        }
        .matching-item {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          margin-bottom: 8px;
          border-radius: 4px;
          background: #f9fafb;
        }
        .fill-blank {
          display: inline-block;
          border-bottom: 2px solid #4338ca;
          min-width: 100px;
          height: 20px;
          margin: 0 5px;
        }
        .image-space {
          border: 2px dashed #d1d5db;
          min-height: 120px;
          margin: 15px 0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-size: 0.8rem;
          background: #fafafa;
        }
        .formula-display {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 15px 0;
          text-align: center;
          font-family: 'Times New Roman', serif;
          font-size: 1.1rem;
          border: 1px solid #e2e8f0;
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
        @media print {
          body { margin: 0 !important; padding: 0 !important; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; width: 100% !important; min-height: 100vh !important; display: flex !important; flex-direction: column !important; }
          .shape-circle { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .header, .footer { position: fixed; background: transparent; }
          .header .logo { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          h2 { color: #4f46e5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          h2::after { background: #a78bfa !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .questao-numero, .question-header { color: #4338ca !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          th { background: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .nota-highlight-cell { background-color: #fef3c7 !important; border: 2px solid #f59e0b !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
      <script>
        window.onload = function() {
          // Ajuste do título principal
          var h1 = document.querySelector('.header-section h1');
          if (h1) {
            h1.textContent = '';
            var spanMain = document.createElement('span');
            spanMain.textContent = 'PLANO DE AULA';
            spanMain.style.fontWeight = '900';
            spanMain.style.fontFamily = 'Inter, sans-serif';
            spanMain.style.fontSize = '1.5rem';
            spanMain.style.letterSpacing = '0.5px';
            spanMain.style.textTransform = 'uppercase';
            spanMain.style.color = '#4338ca';
            spanMain.style.position = 'relative';
            spanMain.style.textAlign = 'center';
            spanMain.style.fontStretch = 'expanded';
            // Suavizar o efeito de extrabold
            spanMain.style.textShadow = '';
            h1.appendChild(spanMain);
            h1.style.textAlign = 'center';
            h1.style.background = 'none';
            h1.style.border = 'none';
            h1.style.position = 'relative';
            // Remove sublinhados antigos
            var next = h1.nextSibling;
            while (next && next.nodeType === 1 && next.offsetHeight <= 4) {
              var toRemove = next;
              next = next.nextSibling;
              toRemove.remove();
            }
            // Sublinhado roxo claro ajustado
            var underline = document.createElement('div');
            underline.style.width = '48px';
            underline.style.height = '2px';
            underline.style.background = '#a5b4fc';
            underline.style.margin = '2px auto 0 auto';
            underline.style.borderRadius = '2px';
            h1.insertAdjacentElement('afterend', underline);
          }
          // Diminuir fonte dos conteúdos e tópicos
          var content = document.querySelectorAll('.section, .content-text, .evaluation-text, .objectives-list li, .skills-list li, .resources-list li, td, p, li');
          content.forEach(function(el) {
            el.style.fontSize = '0.97rem';
          });
          var h3s = document.querySelectorAll('.section h3');
          h3s.forEach(function(h3) {
            h3.style.fontSize = '1.05rem';
          });
          // Diminuir fonte das células de tabela
          var tableCells = document.querySelectorAll('td, th');
          tableCells.forEach(function(cell) {
            cell.style.fontSize = '0.82rem';
          });
          // Ajustar tamanho do subtítulo da logo
          var brandText = document.querySelector('.header .brand-text p');
          if (brandText) {
            brandText.style.fontSize = '10px';
            brandText.style.margin = '-1px 0 0 0';
            brandText.style.lineHeight = '1';
          }
        }
      </script>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;
} 