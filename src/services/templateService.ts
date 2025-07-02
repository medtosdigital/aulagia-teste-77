export interface Template {
  id: string;
  name: string;
  type: 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao';
  htmlContent: string;
  variables: string[]; // variáveis que podem ser preenchidas no template
  createdAt: string;
  updatedAt: string;
}

class TemplateService {
  private templates: Template[] = [
    {
      id: '1',
      name: 'Plano de Aula ABNT',
      type: 'plano-de-aula',
      htmlContent: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Plano de Aula – AulagIA</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            /* Define página A4 para impressão e visualização */
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
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
              padding: 20px 0;
            }
            /* Container no tamanho A4 */
            .page {
              position: relative;
              width: 210mm;
              min-height: 297mm;
              background: white;
              overflow: hidden;
              margin: 0 auto;
              box-sizing: border-box;
              padding: 0;
              display: flex;
              flex-direction: column;
              border-radius: 6px;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
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
            
            /* Cabeçalho que aparece no topo */
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
              width: 18px;
              height: 18px;
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
              font-size: 8px;
              color: #6b7280;
              margin: -1px 0 0 0;
              font-family: 'Inter', sans-serif;
              line-height: 1;
              font-weight: 400;
            }
            
            /* Conteúdo principal com margem para não sobrepor o cabeçalho */
            .content {
              margin-top: 20mm;
              margin-bottom: 12mm;
              padding: 0 15mm;
              position: relative;
              flex: 1;
              overflow: visible;
              z-index: 1;
            }
            /* Título principal */
            h2 {
              text-align: center;
              margin: 10px 0 18px 0;
              font-size: 1.5rem;
              color: #4f46e5;
              position: relative;
              font-family: 'Inter', sans-serif;
              font-weight: 700;
            }
            h2::after {
              content: '';
              width: 50px;
              height: 3px;
              background: #a78bfa;
              display: block;
              margin: 6px auto 0;
              border-radius: 2px;
            }
            /* Tabelas */
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
            /* Tabela de informações básicas com layout específico */
            .info-table th {
              font-size: 0.8rem;
              text-align: left;
              padding: 8px 12px;
            }
            .info-table td {
              font-size: 0.85rem;
              padding: 8px 12px;
            }
            /* Layout específico para a primeira linha */
            .info-table tr:first-child th:first-child { width: 15%; }
            .info-table tr:first-child td:first-child { width: 35%; }
            .info-table tr:first-child th:nth-child(3) { width: 10%; }
            .info-table tr:first-child td:nth-child(4) { width: 40%; }
            
            /* Layout para segunda linha */
            .info-table tr:nth-child(2) th:first-child { width: 15%; }
            .info-table tr:nth-child(2) td:first-child { width: 35%; }
            .info-table tr:nth-child(2) th:nth-child(3) { width: 15%; }
            .info-table tr:nth-child(2) td:nth-child(4) { width: 35%; }
            
            /* Layout para terceira linha - tema ocupa largura total */
            .info-table tr:nth-child(3) th { width: 15%; }
            .info-table tr:nth-child(3) td { width: 85%; }
            
            /* Layout para quarta linha */
            .info-table tr:nth-child(4) th:first-child { width: 15%; }
            .info-table tr:nth-child(4) td:first-child { width: 35%; }
            .info-table tr:nth-child(4) th:nth-child(3) { width: 10%; }
            .info-table tr:nth-child(4) td:nth-child(4) { width: 40%; }
            
            /* Desenvolvimento metodológico com tabela mais compacta */
            .development-table th {
              font-size: 0.8rem;
              padding: 8px 6px;
              text-align: center;
              background: #f8fafc;
            }
            .development-table td {
              font-size: 0.8rem;
              padding: 8px 6px;
              text-align: center;
            }
            .development-table th:first-child { width: 15%; }
            .development-table th:nth-child(2) { width: 50%; }
            .development-table th:nth-child(3) { width: 15%; }
            .development-table th:nth-child(4) { width: 20%; }
            
            /* Seções e listas */
            .section-title {
              font-weight: 600;
              margin-top: 18px;
              margin-bottom: 8px;
              font-size: 1.0rem;
              color: #4338ca;
              font-family: 'Inter', sans-serif;
            }
            ul {
              list-style: disc inside;
              margin-bottom: 16px;
              line-height: 1.4;
              font-size: 0.9rem;
              font-family: 'Inter', sans-serif;
              padding-left: 0;
            }
            li {
              margin-bottom: 0.5mm;
            }
            p {
              font-size: 0.9rem;
              line-height: 1.4;
              margin-bottom: 12px;
              font-family: 'Inter', sans-serif;
              text-align: justify;
            }
            /* Rodapé */
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
            /* Ajustes para impressão */
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
              .header {
                position: fixed;
                top: 6mm;
                left: 0;
                right: 0;
                padding: 0 15mm;
                flex-shrink: 0;
                background: transparent;
                z-index: 1000;
              }
              .header .logo-container {
                gap: 6px;
              }
              .header .logo {
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header .logo svg {
                width: 14px;
                height: 14px;
              }
              .header .brand-text h1 {
                font-size: 14px;
                text-transform: none !important;
              }
              .header .brand-text p {
                font-size: 7px;
                margin: 0;
              }
              .footer {
                position: fixed;
                bottom: 6mm;
                left: 0;
                right: 0;
                flex-shrink: 0;
                background: transparent;
              }
              .content {
                margin-top: 20mm;
                margin-bottom: 12mm;
                padding: 0 15mm;
                flex: 1;
              }
              h2 {
                color: #4f46e5 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              h2::after {
                background: #a78bfa !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .section-title {
                color: #4338ca !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              th {
                background: #f3f4f6 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <!-- Formas decorativas -->
            <div class="shape-circle purple"></div>
            <div class="shape-circle blue"></div>

            <!-- Cabeçalho -->
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
              Plano de aula gerado pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • Template Padrão
            </div>

            <div class="content">
              <!-- Título do Plano de Aula -->
              <h2>PLANO DE AULA</h2>

              <!-- Informações básicas -->
              <table class="info-table">
                <tr>
                  <th>Professor(a):</th>
                  <td>{{professor}}</td>
                  <th>Data:</th>
                  <td>{{data}}</td>
                </tr>
                <tr>
                  <th>Disciplina:</th>
                  <td>{{disciplina}}</td>
                  <th>Série/Ano:</th>
                  <td>{{serie}}</td>
                </tr>
                <tr>
                  <th>Tema:</th>
                  <td colspan="3">{{tema}}</td>
                </tr>
                <tr>
                  <th>Duração:</th>
                  <td>{{duracao}}</td>
                  <th>BNCC:</th>
                  <td>{{bncc}}</td>
                </tr>
              </table>

              <!-- Objetivos de Aprendizagem -->
              <div class="section-title">OBJETIVOS DE APRENDIZAGEM</div>
              <ul>
                {{#each objetivos}}
                <li>{{this}}</li>
                {{/each}}
              </ul>

              <!-- Desenvolvimento Metodológico -->
              <div class="section-title">DESENVOLVIMENTO METODOLÓGICO</div>
              <div class="development-section">
                <table class="development-table">
                  <thead>
                    <tr>
                      <th>Etapa</th>
                      <th>Atividade</th>
                      <th>Tempo</th>
                      <th>Recursos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {{#each desenvolvimento}}
                    <tr>
                      <td>{{etapa}}</td>
                      <td>{{atividade}}</td>
                      <td>{{tempo}}</td>
                      <td>{{recursos}}</td>
                    </tr>
                    {{/each}}
                  </tbody>
                </table>
              </div>

              <!-- Recursos Didáticos -->
              <div class="section-title">RECURSOS DIDÁTICOS</div>
              <p>{{recursos}}</p>

              <!-- Avaliação -->
              <div class="section-title">AVALIAÇÃO</div>
              <p>{{avaliacao}}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      variables: ['tema', 'professor', 'disciplina', 'serie', 'data', 'duracao', 'bncc', 'objetivos', 'desenvolvimento', 'recursos', 'avaliacao'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Slides Educativos Interativos',
      type: 'slides',
      htmlContent: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{{titulo}} - {{serie}}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Fredoka:wght@400;600&display=swap');

            body {
              margin: 0;
              padding: 0;
              background-color: #e0f2fe;
              font-family: 'Fredoka', sans-serif;
            }

            .page-separator {
              height: 40px;
              background-color: #1e3a8a;
            }

            .slide {
              width: 960px;
              height: 720px;
              margin: auto;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
              padding: 40px;
              background-color: #ffffff;
              box-sizing: border-box;
            }

            .text-content {
              width: 55%;
            }

            .title {
              font-family: 'Patrick Hand', cursive;
              font-size: 2.8rem;
              color: #0f172a;
              margin-bottom: 20px;
            }

            .content {
              font-size: 1.4rem;
              color: #1e293b;
              line-height: 1.6;
            }

            .image-side img {
              width: 280px;
            }

            .table {
              width: 100%;
              margin-top: 20px;
              border-collapse: collapse;
            }

            .table th, .table td {
              border: 1px solid #ccc;
              padding: 10px 14px;
              font-size: 1.1rem;
              text-align: center;
            }

            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              margin-top: 20px;
            }

            .box {
              background-color: #fef9c3;
              padding: 16px;
              border-radius: 10px;
              font-size: 1.2rem;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          {{#each slides}}
          <div class="slide">
            <div class="text-content">
              <div class="title">{{titulo}}</div>
              {{#if conteudo}}
              <div class="content">{{conteudo}}</div>
              {{/if}}
              {{#if tabela}}
              <table class="table">
                {{#if tabela.cabecalho}}
                <tr>
                  {{#each tabela.cabecalho}}
                  <th>{{this}}</th>
                  {{/each}}
                </tr>
                {{/if}}
                {{#each tabela.linhas}}
                <tr>
                  {{#each this}}
                  <td>{{this}}</td>
                  {{/each}}
                </tr>
                {{/each}}
              </table>
              {{/if}}
              {{#if grade}}
              <div class="grid">
                {{#each grade}}
                <div class="box">{{this}}</div>
                {{/each}}
              </div>
              {{/if}}
            </div>
            {{#if imagem}}
            <div class="image-side">
              <img src="{{imagem}}" alt="{{altImagem}}">
            </div>
            {{/if}}
          </div>
          {{#unless @last}}
          <div class="page-separator"></div>
          {{/unless}}
          {{/each}}
        </body>
        </html>
      `,
      variables: ['titulo', 'serie', 'slides'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Atividade Padrão',
      type: 'atividade',
      htmlContent: `
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
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: #f0f4f8;
              font-family: 'Inter', sans-serif;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
              padding: 20px 0;
            }
            /* Container no tamanho A4 */
            .page {
              position: relative;
              width: 210mm;
              min-height: 297mm;
              background: white;
              overflow: hidden;
              margin: 0 auto;
              box-sizing: border-box;
              padding: 0;
              display: flex;
              flex-direction: column;
              border-radius: 6px;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
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
            
            /* Cabeçalho que aparece no topo */
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
              width: 18px;
              height: 18px;
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
              font-size: 8px;
              color: #6b7280;
              margin: -1px 0 0 0;
              font-family: 'Inter', sans-serif;
              line-height: 1;
              font-weight: 400;
            }
            
            /* Conteúdo principal com margem para não sobrepor o cabeçalho */
            .content {
              margin-top: 20mm;
              margin-bottom: 12mm;
              padding: 0 15mm;
              position: relative;
              flex: 1;
              overflow: visible;
              z-index: 1;
            }
            /* Título principal */
            h2 {
              text-align: center;
              margin: 10px 0 18px 0;
              font-size: 1.5rem;
              color: #4f46e5;
              position: relative;
              font-family: 'Inter', sans-serif;
              font-weight: 700;
            }
            h2::after {
              content: '';
              width: 50px;
              height: 3px;
              background: #a78bfa;
              display: block;
              margin: 6px auto 0;
              border-radius: 2px;
            }
            /* Tabelas */
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
            
            .instructions {
              background: #eff6ff;
              padding: 15px;
              border-left: 4px solid #0ea5e9;
              margin-bottom: 30px;
              font-family: 'Inter', sans-serif;
              border-radius: 6px;
            }
            
            .student-info {
              margin-bottom: 20px;
              font-family: 'Inter', sans-serif;
              font-size: 0.9rem;
            }
            
            .question {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .question-header {
              font-weight: 600;
              color: #4338ca;
              margin-bottom: 10px;
              font-size: 1.0rem;
              font-family: 'Inter', sans-serif;
            }
            .question-text {
              margin-bottom: 15px;
              text-align: justify;
              font-family: 'Inter', sans-serif;
              font-size: 0.9rem;
              line-height: 1.4;
            }
            .options {
              margin-left: 20px;
            }
            .option {
              margin-bottom: 8px;
              display: flex;
              align-items: flex-start;
              font-family: 'Inter', sans-serif;
              font-size: 0.9rem;
            }
            .option-letter {
              font-weight: bold;
              margin-right: 10px;
              color: #4338ca;
              min-width: 25px;
            }
            .answer-space {
              border: 1px solid #e5e7eb;
              min-height: 60px;
              margin: 10px 0;
              padding: 10px;
              border-radius: 4px;
              background: #fafafa;
            }
            .answer-lines {
              border-bottom: 1px solid #d1d5db;
              margin-bottom: 8px;
              height: 20px;
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
            .interpretation-text {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
              font-size: 0.9rem;
              line-height: 1.5;
              border-left: 4px solid #6b7280;
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
            
            /* Rodapé */
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
            
            /* Ajustes para impressão */
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
              .header {
                position: fixed;
                top: 6mm;
                left: 0;
                right: 0;
                padding: 0 15mm;
                flex-shrink: 0;
                background: transparent;
                z-index: 1000;
              }
              .header .logo-container {
                gap: 6px;
              }
              .header .logo {
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header .logo svg {
                width: 14px;
                height: 14px;
              }
              .header .brand-text h1 {
                font-size: 14px;
                text-transform: none !important;
              }
              .header .brand-text p {
                font-size: 7px;
                margin: 0;
              }
              .footer {
                position: fixed;
                bottom: 6mm;
                left: 0;
                right: 0;
                flex-shrink: 0;
                background: transparent;
              }
              .content {
                margin-top: 20mm;
                margin-bottom: 12mm;
                padding: 0 15mm;
                flex: 1;
              }
              h2 {
                color: #4f46e5 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              h2::after {
                background: #a78bfa !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .question-header {
                color: #4338ca !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              th {
                background: #f3f4f6 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <!-- Formas decorativas -->
            <div class="shape-circle purple"></div>
            <div class="shape-circle blue"></div>

            <!-- Cabeçalho -->
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
              Atividade gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • Template Padrão
            </div>

            <div class="content">
              <!-- Título da Atividade -->
              <h2>ATIVIDADE</h2>

              <!-- Informações básicas -->
              <table>
                <tr>
                  <th>Escola:</th>
                  <td>_________________________________</td>
                  <th>Data:</th>
                  <td>_________________</td>
                </tr>
                <tr>
                  <th>Disciplina:</th>
                  <td>{{disciplina}}</td>
                  <th>Série/Ano:</th>
                  <td>{{serie}}</td>
                </tr>
              </table>

              <div class="student-info">
                <p><strong>Nome do Aluno(a):</strong> ____________________________________________</p>
              </div>

              <div class="instructions">
                <strong>{{titulo}}</strong><br>
                {{instrucoes}}
              </div>

              <!-- Questões -->
              {{questoesContent}}
            </div>
          </div>
        </body>
        </html>
      `,
      variables: ['titulo', 'disciplina', 'serie', 'instrucoes', 'questoes'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Avaliação ABNT',
      type: 'avaliacao',
      htmlContent: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Avaliação – AulagIA</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            /* Define página A4 para impressão e visualização */
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
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
              padding: 20px 0;
            }
            /* Container no tamanho A4 */
            .page {
              position: relative;
              width: 210mm;
              min-height: 297mm;
              background: white;
              overflow: hidden;
              margin: 0 auto;
              box-sizing: border-box;
              padding: 0;
              display: flex;
              flex-direction: column;
              border-radius: 6px;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
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
            
            /* Cabeçalho que aparece no topo */
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
              width: 18px;
              height: 18px;
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
              font-size: 8px;
              color: #6b7280;
              margin: -1px 0 0 0;
              font-family: 'Inter', sans-serif;
              line-height: 1;
              font-weight: 400;
            }
            
            /* Conteúdo principal com margem para não sobrepor o cabeçalho */
            .content {
              margin-top: 20mm;
              margin-bottom: 12mm;
              padding: 0 15mm;
              position: relative;
              flex: 1;
              overflow: visible;
              z-index: 1;
            }
            /* Título principal */
            h2 {
              text-align: center;
              margin: 10px 0 18px 0;
              font-size: 1.5rem;
              color: #4f46e5;
              position: relative;
              font-family: 'Inter', sans-serif;
              font-weight: 700;
            }
            h2::after {
              content: '';
              width: 50px;
              height: 3px;
              background: #a78bfa;
              display: block;
              margin: 6px auto 0;
              border-radius: 2px;
            }
            /* Tabelas */
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
            
            .evaluation-info {
              background: #fef3f2;
              padding: 15px;
              border-left: 4px solid #ef4444;
              margin-bottom: 30px;
              font-family: 'Inter', sans-serif;
              border-radius: 6px;
            }
            
            .question {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .question-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-weight: 600;
              color: #4338ca;
              margin-bottom: 10px;
              font-size: 1.0rem;
              font-family: 'Inter', sans-serif;
            }
            .points {
              background: #fef3f2;
              color: #ef4444;
              padding: 4px 8px;
              border: 1px solid #ef4444;
              border-radius: 4px;
              font-size: 0.75rem;
              font-weight: 500;
            }
            .question-text {
              margin-bottom: 15px;
              text-align: justify;
              font-family: 'Inter', sans-serif;
              font-size: 0.9rem;
              line-height: 1.4;
            }
            .options {
              margin-left: 20px;
            }
            .option {
              margin-bottom: 8px;
              display: flex;
              align-items: flex-start;
              font-family: 'Inter', sans-serif;
              font-size: 0.9rem;
            }
            .option-letter {
              font-weight: bold;
              margin-right: 10px;
              color: #4338ca;
              min-width: 25px;
            }
            .answer-space {
              border: 1px solid #e5e7eb;
              min-height: 60px;
              margin: 10px 0;
              padding: 10px;
              border-radius: 4px;
              background: #fafafa;
            }
            .answer-lines {
              border-bottom: 1px solid #d1d5db;
              margin-bottom: 8px;
              height: 20px;
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
            .interpretation-text {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
              font-size: 0.9rem;
              line-height: 1.5;
              border-left: 4px solid #6b7280;
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
            
            /* Rodapé */
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
            
            /* Ajustes para impressão */
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
              .header {
                position: fixed;
                top: 6mm;
                left: 0;
                right: 0;
                padding: 0 15mm;
                flex-shrink: 0;
                background: transparent;
                z-index: 1000;
              }
              .header .logo-container {
                gap: 6px;
              }
              .header .logo {
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header .logo svg {
                width: 14px;
                height: 14px;
              }
              .header .brand-text h1 {
                font-size: 14px;
                text-transform: none !important;
              }
              .header .brand-text p {
                font-size: 7px;
                margin: 0;
              }
              .footer {
                position: fixed;
                bottom: 6mm;
                left: 0;
                right: 0;
                flex-shrink: 0;
                background: transparent;
              }
              .content {
                margin-top: 20mm;
                margin-bottom: 12mm;
                padding: 0 15mm;
                flex: 1;
              }
              h2 {
                color: #4f46e5 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              h2::after {
                background: #a78bfa !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .question-header {
                color: #4338ca !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              th {
                background: #f3f4f6 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <!-- Formas decorativas -->
            <div class="shape-circle purple"></div>
            <div class="shape-circle blue"></div>

            <!-- Cabeçalho -->
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
              Avaliação gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • Template Padrão
            </div>

            <div class="content">
              <!-- Título da Avaliação -->
              <h2>AVALIAÇÃO</h2>

              <!-- Informações básicas -->
              <table>
                <tr>
                  <th colspan="4">{{titulo}}</th>
                </tr>
                <tr>
                  <th>Nome:</th>
                  <td>_________________________________</td>
                  <th>Turma:</th>
                  <td>_____________</td>
                </tr>
                <tr>
                  <th>Data:</th>
                  <td>_____________</td>
                  <th>Professor(a):</th>
                  <td>_____________</td>
                </tr>
              </table>

              <div class="evaluation-info">
                <p><strong>Instruções:</strong> {{instrucoes}}</p>
                <p><strong>Tempo Limite:</strong> {{tempoLimite}}</p>
              </div>

              <!-- Questões -->
              {{questoesContent}}
            </div>
          </div>
        </body>
        </html>
      `,
      variables: ['titulo', 'instrucoes', 'tempoLimite', 'questoes'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  getTemplates(): Template[] {
    return this.templates;
  }

  getTemplatesByType(type: Template['type']): Template[] {
    return this.templates.filter(t => t.type === type);
  }

  getTemplateById(id: string): Template | undefined {
    return this.templates.find(t => t.id === id);
  }

  createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.templates.push(newTemplate);
    return newTemplate;
  }

  updateTemplate(id: string, updates: Partial<Template>): Template | undefined {
    const index = this.templates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.templates[index] = {
        ...this.templates[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return this.templates[index];
    }
    return undefined;
  }

  deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.templates.splice(index, 1);
      return true;
    }
    return false;
  }

  renderTemplate(templateId: string, data: any): string {
    const template = this.getTemplateById(templateId);
    if (!template) {
      throw new Error('Template não encontrado');
    }

    let html = template.htmlContent;

    // Handle questoesContent for atividade and avaliacao templates
    if ((template.type === 'atividade' || template.type === 'avaliacao') && data.questoes) {
      const questoesHtml = this.generateQuestionsHTML(data.questoes, template.type);
      html = html.replace('{{questoesContent}}', questoesHtml);
    }

    // Handle simple variables
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key] || '');
    });

    // Handle arrays with #each
    const eachRegex = /{{#each (\w+)}}([\s\S]*?){{\/each}}/g;
    html = html.replace(eachRegex, (match, arrayName, template) => {
      const array = data[arrayName];
      if (!Array.isArray(array)) return '';
      
      return array.map((item, index) => {
        let itemHtml = template;
        
        // Handle {{this}} for simple arrays
        itemHtml = itemHtml.replace(/{{this}}/g, typeof item === 'string' ? item : '');
        
        // Handle object properties
        if (typeof item === 'object') {
          Object.keys(item).forEach(prop => {
            const propRegex = new RegExp(`{{${prop}}}`, 'g');
            itemHtml = itemHtml.replace(propRegex, item[prop] || '');
          });
        }
        
        // Handle @letter for options (A, B, C, D)
        itemHtml = itemHtml.replace(/{{@letter}}/g, String.fromCharCode(65 + index) + ')');
        
        // Handle @last for conditional rendering
        itemHtml = itemHtml.replace(/{{#unless @last}}([\s\S]*?){{\/unless}}/g, (match, content) => {
          return index < array.length - 1 ? content : '';
        });
        
        // Handle conditional blocks
        const ifRegex = /{{#if (\w+)}}([\s\S]*?){{\/if}}/g;
        itemHtml = itemHtml.replace(ifRegex, (match, condition, content) => {
          return item[condition] ? content : '';
        });
        
        return itemHtml;
      }).join('');
    });

    // Handle top-level conditional blocks
    const ifRegex = /{{#if (\w+)}}([\s\S]*?){{\/if}}/g;
    html = html.replace(ifRegex, (match, condition, content) => {
      return data[condition] ? content : '';
    });

    return html;
  }

  private generateQuestionsHTML(questoes: any[], type: 'atividade' | 'avaliacao'): string {
    return questoes.map((questao, index) => {
      let questionHTML = `
        <div class="question">
          <div class="question-header">
            <span>Questão ${questao.numero || index + 1}</span>
            ${type === 'avaliacao' && questao.pontuacao ? 
              `<span class="points">(${questao.pontuacao} pontos)</span>` : ''
            }
          </div>`;

      // Adicionar texto de interpretação se existir
      if (questao.textoInterpretacao) {
        questionHTML += `
          <div class="interpretation-text">
            <strong>Texto para interpretação:</strong><br>
            ${questao.textoInterpretacao}
          </div>`;
      }

      // Adicionar fórmula se existir
      if (questao.formula) {
        questionHTML += `
          <div class="formula-display">
            ${questao.formula}
          </div>`;
      }

      questionHTML += `<div class="question-text">${questao.pergunta}</div>`;

      // Diferentes tipos de questão
      switch (questao.tipo) {
        case 'multipla_escolha':
          if (questao.opcoes && questao.opcoes.length > 0) {
            questionHTML += '<div class="options">';
            questao.opcoes.forEach((opcao: string, opcaoIndex: number) => {
              questionHTML += `
                <div class="option">
                  <span class="option-letter">${String.fromCharCode(65 + opcaoIndex)})</span>
                  <span>${opcao}</span>
                </div>`;
            });
            questionHTML += '</div>';
          }
          break;

        case 'aberta':
          if (questao.isCalculo) {
            questionHTML += '<div class="math-space">Espaço para cálculos</div>';
          } else {
            // Adicionar linhas para resposta baseado no tamanho esperado
            const numLines = questao.linhasResposta || 3;
            for (let i = 0; i < numLines; i++) {
              questionHTML += '<div class="answer-lines"></div>';
            }
          }
          break;

        case 'verdadeiro_falso':
          questionHTML += `
            <div class="options">
              <div class="option">
                <span class="option-letter">( )</span>
                <span>Verdadeiro</span>
              </div>
              <div class="option">
                <span class="option-letter">( )</span>
                <span>Falso</span>
              </div>
            </div>`;
          break;

        case 'ligar':
          if (questao.colunaA && questao.colunaB) {
            questionHTML += `
              <div class="matching-section">
                <div class="matching-column">
                  <strong>Coluna A</strong>`;
            questao.colunaA.forEach((item: string, idx: number) => {
              questionHTML += `<div class="matching-item">${idx + 1}) ${item}</div>`;
            });
            questionHTML += `
                </div>
                <div class="matching-column">
                  <strong>Coluna B</strong>`;
            questao.colunaB.forEach((item: string, idx: number) => {
              questionHTML += `<div class="matching-item">${String.fromCharCode(65 + idx)}) ${item}</div>`;
            });
            questionHTML += `
                </div>
              </div>`;
          }
          break;

        case 'completar':
          // Para questões de completar, o texto já deve ter os espaços marcados
          if (questao.textoComLacunas) {
            questionHTML += `<div class="question-text">${questao.textoComLacunas}</div>`;
          }
          break;

        case 'desenho':
          questionHTML += `
            <div class="image-space">
              <span>Espaço para desenho ou colagem de imagem</span>
            </div>`;
          break;

        case 'dissertativa':
          const numLines = questao.linhasResposta || 5;
          for (let i = 0; i < numLines; i++) {
            questionHTML += '<div class="answer-lines"></div>';
          }
          break;

        default:
          // Questão padrão com espaço para resposta
          questionHTML += '<div class="answer-space"></div>';
      }

      questionHTML += '</div>';
      return questionHTML;
    }).join('');
  }

  // Novo método para gerar dados de slides baseados em keywords
  generateSlidesData(formData: any): any {
    const keywords = this.extractKeywords(formData);
    
    return {
      titulo: `Slides sobre ${formData.tema}`,
      serie: formData.serie || '3º Ano',
      slides: this.createSlidesFromKeywords(keywords, formData)
    };
  }

  private extractKeywords(formData: any): string[] {
    const text = `${formData.tema} ${formData.disciplina} ${formData.objetivos?.join(' ') || ''}`;
    
    // Keywords educacionais por disciplina
    const keywordsBySubject = {
      matematica: ['números', 'operações', 'geometria', 'medidas', 'gráficos', 'problemas', 'cálculos', 'tabuada'],
      portugues: ['leitura', 'escrita', 'gramática', 'interpretação', 'texto', 'palavras', 'frases'],
      ciencias: ['experimentos', 'natureza', 'animais', 'plantas', 'corpo humano', 'meio ambiente'],
      historia: ['tempo', 'passado', 'presente', 'cultura', 'sociedade', 'civilizações'],
      geografia: ['mapas', 'lugares', 'paisagens', 'clima', 'relevo', 'população']
    };

    const disciplina = formData.disciplina?.toLowerCase() || '';
    const baseKeywords = keywordsBySubject[disciplina] || [];
    
    // Extrai keywords do tema
    const themeKeywords = text.toLowerCase().split(' ').filter(word => word.length > 3);
    
    return [...baseKeywords, ...themeKeywords].slice(0, 10);
  }

  private createSlidesFromKeywords(keywords: string[], formData: any): any[] {
    const slides = [];
    
    // Slide de introdução
    slides.push({
      titulo: `Vamos aprender ${formData.tema}!`,
      conteudo: `Hoje vamos descobrir coisas incríveis sobre ${formData.tema}. Preparem-se para uma aula divertida!`,
      imagem: 'https://cdn-icons-png.flaticon.com/512/1687/1687603.png',
      altImagem: 'aprendizado'
    });

    // Slides de conteúdo baseados em keywords
    keywords.slice(0, 6).forEach((keyword, index) => {
      const slide: any = {
        titulo: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
        conteudo: `Vamos explorar ${keyword} de forma prática e divertida!`,
        imagem: index % 2 === 0 ? 'https://cdn-icons-png.flaticon.com/512/2403/2403361.png' : 'https://cdn-icons-png.flaticon.com/512/2917/2917999.png',
        altImagem: keyword
      };

      if (index % 3 === 0) {
        slide.tabela = {
          cabecalho: ['Conceito', 'Exemplo'],
          linhas: [
            [keyword, `Exemplo prático de ${keyword}`],
            ['Aplicação', `Como usar ${keyword} no dia a dia`]
          ]
        };
      }

      if (index % 2 === 0) {
        slide.grade = [
          `${keyword} na teoria`,
          `${keyword} na prática`,
          `Exemplo de ${keyword}`,
          `Aplicação de ${keyword}`
        ];
      }

      slides.push(slide);
    });

    // Slide de desafio
    slides.push({
      titulo: 'Desafio!',
      conteudo: `Agora é sua vez! Vamos testar o que aprendemos sobre ${formData.tema}. Como você aplicaria ${formData.tema} em uma situação do seu dia a dia?`,
      imagem: 'https://cdn-icons-png.flaticon.com/512/1732/1732602.png',
      altImagem: 'desafio'
    });

    // Slide de resposta
    slides.push({
      titulo: 'Excelente!',
      conteudo: `Existem muitas formas de aplicar ${formData.tema}. O importante é praticar e explorar!`,
      imagem: 'https://cdn-icons-png.flaticon.com/512/2601/2601717.png',
      altImagem: 'resposta'
    });

    // Slide de conclusão
    slides.push({
      titulo: 'Parabéns!',
      conteudo: `Você aprendeu muito sobre ${formData.tema}! Continue praticando e explorando esse tema fascinante.`,
      imagem: 'https://cdn-icons-png.flaticon.com/512/4149/4149673.png',
      altImagem: 'celebração'
    });

    return slides;
  }
}

export const templateService = new TemplateService();
