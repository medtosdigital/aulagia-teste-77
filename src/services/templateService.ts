import { formatarRecursosPT } from '../lib/utils';

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
            .development-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            .development-table th, .development-table td {
              border: 1px solid #e5e7eb;
              padding: 6px 8px;
              font-size: 0.75rem;
              font-family: 'Inter', sans-serif;
              background: #fff;
              text-align: center;
              vertical-align: middle;
            }
            .development-table th {
              background: #f3f4f6;
              color: #1f2937;
              font-weight: 600;
              text-align: left;
              width: 18%;
            }
            .development-table tr:last-child td {
              border-bottom: 1px solid #e5e7eb;
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
              font-size: 0.85rem;
              font-family: 'Inter', sans-serif;
              padding-left: 0;
            }
            li {
              margin-bottom: 0.5mm;
            }
            p {
              font-size: 0.85rem;
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
              Plano de aula gerado pela AulagIA - Sua aula com toque mágico em {{data}} • aulagia.com.br
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
                <table class="development-table" style="margin-bottom: 24px;">
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
              <div class="section-title" style="margin-top: 32px;">RECURSOS DIDÁTICOS</div>
              <p style="margin-bottom: 24px;">{{recursos}}</p>

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
              align-items: center;
              justify-content: space-between;
              padding: 40px;
              background-color: #ffffff;
              box-sizing: border-box;
              position: relative;
              overflow: hidden;
            }

            .slide-capa {
              flex-direction: column;
              text-align: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }

            .slide-objetivos {
              flex-direction: column;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
            }

            .slide-introducao {
              flex-direction: row;
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }

            .slide-desenvolvimento {
              flex-direction: row;
              background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }

            .slide-exemplo {
              flex-direction: column;
              background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            }

            .slide-pratica {
              flex-direction: row;
              background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            }

            .slide-formula {
              flex-direction: column;
              background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
              text-align: center;
            }

            .slide-tabela {
              flex-direction: column;
              background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            }

            .slide-imagem {
              flex-direction: row;
              background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
            }

            .slide-atividade {
              flex-direction: column;
              background: linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%);
            }

            .slide-conclusao {
              flex-direction: column;
              background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
              text-align: center;
            }

            .slide-referencias {
              flex-direction: column;
              background: linear-gradient(135deg, #e0c3fc 0%, #9bb5ff 100%);
              text-align: center;
            }

            .text-content {
              width: 55%;
              color: #1e293b;
            }

            .text-content-full {
              width: 100%;
              color: #1e293b;
            }

            .title {
              font-family: 'Patrick Hand', cursive;
              font-size: 2.8rem;
              margin-bottom: 20px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }

            .subtitle {
              font-size: 1.8rem;
              margin-bottom: 30px;
              color: rgba(255,255,255,0.9);
            }

            .content {
              font-size: 1.4rem;
              line-height: 1.6;
            }

            .content-list {
              font-size: 1.3rem;
              line-height: 1.8;
              padding-left: 20px;
            }

            .content-list li {
              margin-bottom: 15px;
              list-style: none;
              position: relative;
            }

            .content-list li:before {
              content: "★";
              color: #fbbf24;
              font-size: 1.2em;
              position: absolute;
              left: -20px;
            }

            .image-side {
              width: 40%;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .image-side img {
              max-width: 100%;
              border-radius: 15px;
              box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            }

            .image-placeholder {
              width: 300px;
              height: 200px;
              background: rgba(255,255,255,0.3);
              border: 3px dashed rgba(255,255,255,0.6);
              border-radius: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: rgba(255,255,255,0.8);
              font-size: 1.1rem;
              text-align: center;
            }

            .table {
              width: 100%;
              margin-top: 20px;
              border-collapse: collapse;
              background: white;
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .table th, .table td {
              padding: 15px;
              font-size: 1.1rem;
              text-align: center;
              border-bottom: 1px solid #e5e7eb;
            }

            .table th {
              background: #4f46e5;
              color: white;
              font-weight: 600;
            }

            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-top: 20px;
            }

            .box {
              background-color: rgba(255,255,255,0.9);
              padding: 20px;
              border-radius: 15px;
              font-size: 1.2rem;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              text-align: center;
            }

            .formula-box {
              background: rgba(255,255,255,0.95);
              padding: 30px;
              border-radius: 20px;
              font-size: 2rem;
              font-family: 'Times New Roman', serif;
              text-align: center;
              box-shadow: 0 8px 24px rgba(0,0,0,0.15);
              margin: 20px 0;
            }

            .example-box {
              background: rgba(255,255,255,0.9);
              padding: 25px;
              border-radius: 15px;
              margin: 20px 0;
              border-left: 5px solid #fbbf24;
            }

            .exercise-container {
              background: rgba(255,255,255,0.9);
              padding: 25px;
              border-radius: 15px;
              margin: 20px 0;
            }

            .exercise-question {
              font-size: 1.3rem;
              margin-bottom: 15px;
              font-weight: 600;
            }

            .exercise-options {
              font-size: 1.1rem;
              line-height: 1.8;
            }

            .date-info {
              position: absolute;
              top: 20px;
              right: 30px;
              font-size: 1rem;
              color: rgba(255,255,255,0.8);
            }

            .teacher-info {
              position: absolute;
              bottom: 20px;
              left: 30px;
              font-size: 1rem;
              color: rgba(255,255,255,0.8);
            }

            .slide-number {
              position: absolute;
              bottom: 20px;
              right: 30px;
              font-size: 1rem;
              color: rgba(255,255,255,0.8);
            }
          </style>
        </head>
        <body>
          <!-- Slide 1: Capa -->
          <div class="slide slide-capa">
            <div class="text-content">
              <div class="title" style="font-size: 3.5rem; font-weight: 800; text-align: center; margin-bottom: 30px; color: #fff; letter-spacing: -2px;">{{tema}}</div>
              <div class="subtitle" style="font-size: 1.5rem; text-align: center; color: #fff; font-weight: 600; margin-bottom: 10px;">Aula de {{disciplina}} - {{serie}}</div>
              <div class="presented-by" style="color: #facc15; text-align: center; font-size: 1.1rem; margin-bottom: 0.2em;">Apresentado por:</div>
              <div class="teacher-info" style="text-align: center; color: #fff; font-size: 1.2rem;">Professor(a): {{professor}}</div>
            </div>
            <div class="image-side">
              <div class="image-placeholder"></div>
              <div class="image-content">{{tema_imagem}}</div>
            </div>
            <div class="slide-number">1/12</div>
          </div>

          <div class="page-separator"></div>

          <!-- Slide 2: Objetivos da Aula -->
          <div class="slide slide-objetivos">
            <div class="text-content-full">
              <div class="title">Objetivos da Aula</div>
              <div class="content-list">
                <li>{{objetivo_1}}</li>
                <li>{{objetivo_2}}</li>
                <li>{{objetivo_3}}</li>
                <li>{{objetivo_4}}</li>
              </div>
            </div>
            <div class="slide-number">2/12</div>
          </div>

          <div class="page-separator"></div>

          <!-- Slide 3: Introdução ao Tema -->
          <div class="slide slide-introducao">
            <div class="text-content">
              <div class="title">Introdução</div>
              <div class="content">{{introducao_texto}}</div>
            </div>
            <div class="image-side">
              <div class="image-placeholder"></div>
              <div class="image-content">{{introducao_imagem}}</div>
            </div>
            <div class="slide-number">3/12</div>
          </div>

          <div class="page-separator"></div>

          <!-- Slide 4: Conceitos Fundamentais -->
          <div class="slide slide-desenvolvimento">
            <div class="text-content">
              <div class="title">Conceitos Fundamentais</div>
              <div class="content">{{conceitos_texto}}</div>
              <div class="grid" style="grid-template-columns: 1fr;">
                <div class="box">{{conceito_principal}}</div>
              </div>
            </div>
            <div class="image-side">
              <div class="image-placeholder"></div>
              <div class="image-content">{{conceitos_imagem}}</div>
            </div>
            <div class="slide-number">4/12</div>
          </div>

          <div class="page-separator"></div>

          <!-- Slide 5: Exemplo Prático -->
          <div class="slide slide-exemplo">
            <div class="text-content-full">
              <div class="title">Exemplo Prático</div>
              <div class="example-box">
                <div style="font-size: 1.3rem; margin-bottom: 15px;">{{exemplo_titulo}}</div>
                <div style="font-size: 1.1rem;">{{exemplo_conteudo}}</div>
              </div>
              <div class="image-placeholder" style="margin: 20px auto; width: 400px;"></div>
              <div class="image-content" style="text-align:center;">{{exemplo_imagem}}</div>
            </div>
            <div class="slide-number">5/12</div>
          </div>

          <div class="page-separator"></div>

          <!-- Slide 6: Desenvolvimento Detalhado -->
          <div class="slide slide-pratica">
            <div class="text-content">
              <div class="title">Desenvolvimento</div>
              <div class="content">{{desenvolvimento_texto}}</div>
              <div class="grid">
                <div class="box">{{ponto_1}}</div>
                <div class="box">{{ponto_2}}</div>
              </div>
            </div>
            <div class="image-side">
              <div class="image-placeholder"></div>
              <div class="image-content">{{desenvolvimento_imagem}}</div>
            </div>
            <div class="slide-number">6/12</div>
          </div>

          <div class="page-separator"></div>

          <!-- Slide 7: Fórmulas/Regras -->
          <div class="slide slide-formula">
            <div class="text-content-full">
              <div class="title">{{formula_titulo}}</div>
              <div class="formula-box">{{formula_principal}}</div>
              <div class="content" style="text-align: center; margin-top: 20px;">{{formula_explicacao}}</div>
            </div>
            <div class="slide-number">7/12</div>
          </div>

          <div class="page-separator"></div>

          <!-- Slide 8: Tabela/Comparação -->
          <div class="slide slide-tabela">
            <div class="text-content-full">
              <div class="title">{{tabela_titulo}}</div>
              <table class="table">
                <thead>
                  <tr>
                    <th>{{coluna_1}}</th>
                    <th>{{coluna_2}}</th>
                    <th>{{coluna_3}}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{linha_1_col_1}}</td>
                    <td>{{linha_1_col_2}}</td>
                    <td>{{linha_1_col_3}}</td>
                  </tr>
                  <tr>
                    <td>{{linha_2_col_1}}</td>
                    <td>{{linha_2_col_2}}</td>
                    <td>{{linha_2_col_3}}</td>
                  </tr>
                  <tr>
                    <td>{{linha_3_col_1}}</td>
                    <td>{{linha_3_col_2}}</td>
                    <td>{{linha_3_col_3}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="slide-number">8/12</div>
          </div>

          <div class="page-separator"></div>

          <!-- Slide 9: Imagem Central -->
          <div class="slide slide-imagem">
            <div class="text-content">
              <div class="title">Imagem Central</div>
              <div class="content">{{imagem_descricao}}</div>
            </div>
            <div class="image-side" style="width: 50%;">
              <div class="image-placeholder" style="width: 100%; height: 300px; display: flex; align-items: center; justify-content: center;">{{imagem_principal}}</div>
            </div>
            <div class="slide-number">9/12</div>
          </div>

          <div class="page-separator"></div>

          <!-- Slide 10: Atividade Interativa -->
          <div class="slide slide-atividade">
            <div class="text-content-full">
              <div class="title">Vamos Praticar!</div>
              <div class="exercise-container">
                <div class="exercise-question">{{atividade_pergunta}}</div>
                <div class="exercise-options">
                  <div style="margin: 10px 0;">a) {{opcao_a}}</div>
                  <div style="margin: 10px 0;">b) {{opcao_b}}</div>
                  <div style="margin: 10px 0;">c) {{opcao_c}}</div>
                  <div style="margin: 10px 0;">d) {{opcao_d}}</div>
                </div>
              </div>
            </div>
            <div class="slide-number">10/12</div>
          </div>

          <div class="page-separator"></div>

          <!-- Slide 11: Conclusão -->
          <div class="slide slide-conclusao">
            <div class="text-content-full">
              <div class="title">Conclusão</div>
              <div class="content" style="font-size: 1.5rem; line-height: 1.8;">{{conclusao_texto}}</div>
              <div class="grid" style="margin-top: 30px;">
                <div class="box">{{ponto_chave_1}}</div>
                <div class="box">{{ponto_chave_2}}</div>
              </div>
            </div>
            <div class="slide-number">11/12</div>
          </div>

          <div class="page-separator"></div>

          <!-- Slide 12: Próximos Passos -->
          <div class="slide slide-referencias">
            <div class="text-content-full">
              <div class="title">Próximos Passos</div>
              <div class="content-list" style="font-size: 1.4rem;">
                <li>{{proximo_passo_1}}</li>
                <li>{{proximo_passo_2}}</li>
                <li>{{proximo_passo_3}}</li>
              </div>
              <div style="margin-top: 40px; font-size: 1.2rem; color: rgba(30, 41, 59, 0.8);">
                Obrigado pela atenção!
              </div>
            </div>
            <div class="slide-number">12/12</div>
          </div>
        </body>
        </html>
      `,
      variables: [
        'titulo', 'serie', 'tema', 'disciplina', 'professor', 'data',
        'objetivo_1', 'objetivo_2', 'objetivo_3', 'objetivo_4',
        'introducao_texto', 'introducao_imagem',
        'conceitos_texto', 'conceito_principal', 'conceitos_imagem',
        'exemplo_titulo', 'exemplo_conteudo', 'exemplo_imagem',
        'desenvolvimento_texto', 'ponto_1', 'ponto_2', 'desenvolvimento_imagem',
        'formula_titulo', 'formula_principal', 'formula_explicacao',
        'tabela_titulo', 'coluna_1', 'coluna_2', 'coluna_3',
        'linha_1_col_1', 'linha_1_col_2', 'linha_1_col_3',
        'linha_2_col_1', 'linha_2_col_2', 'linha_2_col_3',
        'linha_3_col_1', 'linha_3_col_2', 'linha_3_col_3',
        'imagem_titulo', 'imagem_descricao', 'imagem_principal',
        'atividade_pergunta', 'opcao_a', 'opcao_b', 'opcao_c', 'opcao_d',
        'conclusao_texto', 'ponto_chave_1', 'ponto_chave_2',
        'proximo_passo_1', 'proximo_passo_2', 'proximo_passo_3',
        'slide_1_titulo', 'slide_1_subtitulo', 'tema_imagem',
        'introducao_imagem', 'conceitos_imagem',
        'exemplo_imagem', 'desenvolvimento_imagem',
        'formula_principal', 'formula_explicacao',
        'tabela_titulo', 'coluna_1', 'coluna_2', 'coluna_3',
        'linha_1_col_1', 'linha_1_col_2', 'linha_1_col_3',
        'linha_2_col_1', 'linha_2_col_2', 'linha_2_col_3',
        'linha_3_col_1', 'linha_3_col_2', 'linha_3_col_3',
        'imagem_principal', 'imagem_principal_legenda'
      ],
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
              Atividade gerada pela AulagIA - Sua aula com toque mágico em {{data}} • Template Padrão
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
              Avaliação gerada pela AulagIA - Sua aula com toque mágico em {{data}} • aulagia.com.br
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
    // Forçar o uso do template padrão de atividade se o tipo for 'atividade'
    if (data && (data.type === 'atividade' || data.tipo === 'atividade')) {
      templateId = '3';
    }
    // Forçar o uso do template padrão de avaliação se o tipo for 'avaliacao'
    if (data && (data.type === 'avaliacao' || data.tipo === 'avaliacao')) {
      templateId = '4';
    }
    const template = this.getTemplateById(templateId);
    if (!template) {
      throw new Error('Template não encontrado');
    }

    let html = template.htmlContent;

    // Formatar recursos didáticos gerais, se for array
    if (Array.isArray(data.recursos)) {
      data.recursos = formatarRecursosPT(data.recursos);
    }

    // Formatar recursos de cada etapa do desenvolvimento, se houver
    if (Array.isArray(data.desenvolvimento)) {
      data.desenvolvimento = data.desenvolvimento.map(etapa => {
        // Garante que cada etapa mantenha apenas seus próprios recursos
        let recursosEtapa = '';
        if (Array.isArray(etapa.recursos)) {
          recursosEtapa = formatarRecursosPT(etapa.recursos);
        } else if (typeof etapa.recursos === 'string') {
          // Divide e formata apenas os recursos desta etapa
          recursosEtapa = formatarRecursosPT(etapa.recursos.split(/,| e /).map(r => r.trim()).filter(Boolean));
        }
        return {
        ...etapa,
          recursos: recursosEtapa
        };
      });
    }

    // Handle questoesContent for atividade and avaliacao templates
    if ((template.type === 'atividade' || template.type === 'avaliacao') && data.questoes) {
      const questoesHtml = this.generateQuestionsHTML(data.questoes, template.type);
      html = html.replace('{{questoesContent}}', questoesHtml);
    }

    // Handle simple variables (fora dos blocos #each)
    // Substitui apenas variáveis que NÃO estão dentro de blocos {{#each}}
    const eachRegex = /{{#each (\w+)}}([\s\S]*?){{\/each}}/g;
    let eachBlocks: { key: string, content: string, placeholder: string }[] = [];
    let htmlCopy = html;
    let match;
    let blockIndex = 0;
    // Extrai blocos #each e substitui por placeholders temporários
    while ((match = eachRegex.exec(htmlCopy)) !== null) {
      const placeholder = `__EACH_BLOCK_${blockIndex}__`;
      eachBlocks.push({ key: match[1], content: match[2], placeholder });
      htmlCopy = htmlCopy.replace(match[0], placeholder);
      blockIndex++;
    }
    // Substitui variáveis simples fora dos blocos #each
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlCopy = htmlCopy.replace(regex, data[key] || '');
    });
    // Restaura e processa os blocos #each normalmente
    eachBlocks.forEach(block => {
      const array = data[block.key];
      let blockHtml = '';
      if (Array.isArray(array)) {
        blockHtml = array.map((item, index) => {
          let itemHtml = block.content;
          // Handle {{this}} para arrays simples
        itemHtml = itemHtml.replace(/{{this}}/g, typeof item === 'string' ? item : '');
          // Handle propriedades do objeto
        if (typeof item === 'object') {
          Object.keys(item).forEach(prop => {
            const propRegex = new RegExp(`{{${prop}}}`, 'g');
            itemHtml = itemHtml.replace(propRegex, item[prop] || '');
          });
        }
          // Handle @letter para opções (A, B, C, D)
        itemHtml = itemHtml.replace(/{{@letter}}/g, String.fromCharCode(65 + index) + ')');
          // Handle @last para renderização condicional
        itemHtml = itemHtml.replace(/{{#unless @last}}([\s\S]*?){{\/unless}}/g, (match, content) => {
          return index < array.length - 1 ? content : '';
        });
          // Handle blocos condicionais
        const ifRegex = /{{#if (\w+)}}([\s\S]*?){{\/if}}/g;
        itemHtml = itemHtml.replace(ifRegex, (match, condition, content) => {
          return item[condition] ? content : '';
        });
        return itemHtml;
      }).join('');
      }
      htmlCopy = htmlCopy.replace(block.placeholder, blockHtml);
    });
    // Handle top-level conditional blocks
    const ifRegex = /{{#if (\w+)}}([\s\S]*?){{\/if}}/g;
    htmlCopy = htmlCopy.replace(ifRegex, (match, condition, content) => {
      return data[condition] ? content : '';
    });
    return htmlCopy;
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

      // Renderizar imagem da questão, se houver
      if (questao.imagem) {
        questionHTML += `<div style='text-align:center;margin-bottom:10px;'><img src='${questao.imagem}' alt='Imagem da questão' style='max-width:180px;max-height:120px;object-fit:contain;border-radius:6px;border:1px solid #e5e7eb;background:#fff;padding:4px;'/></div>`;
      }

      // Renderizar ícones, se houver
      if (questao.icones && Array.isArray(questao.icones)) {
        questionHTML += `<div style='text-align:center;margin-bottom:10px;'>`;
        questionHTML += questao.icones.map((icon) => {
          switch (icon) {
            case 'estrela':
              return `<svg width='32' height='32' viewBox='0 0 24 24' fill='#facc15' stroke='#f59e42' stroke-width='1.5'><polygon points='12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9'/></svg>`;
            case 'coracao':
              return `<svg width='32' height='32' viewBox='0 0 24 24' fill='#ef4444'><path d='M12 21s-8-6.6-8-11.3C4 5.1 6.2 3 8.8 3c1.7 0 3.2 1.1 3.2 2.7C12 4.1 13.5 3 15.2 3 17.8 3 20 5.1 20 9.7c0 4.7-8 11.3-8 11.3z'/></svg>`;
            case 'check':
              return `<svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#22c55e' stroke-width='2'><polyline points='20 6 9 17 4 12'/></svg>`;
            case 'x':
              return `<svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#ef4444' stroke-width='2'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>`;
            default:
              return `<span style='font-size:2rem;margin:0 6px;'>[${icon}]</span>`;
          }
        }).join('');
        questionHTML += `</div>`;
      }

      // Renderizar gráfico (SVG simples ou placeholder)
      if (questao.grafico) {
        if (questao.grafico.tipo === 'bar') {
          questionHTML += `<div style='text-align:center;margin-bottom:10px;'><svg width='120' height='60'><rect x='10' y='30' width='15' height='20' fill='#6366f1'/><rect x='35' y='20' width='15' height='30' fill='#a78bfa'/><rect x='60' y='10' width='15' height='40' fill='#f59e42'/></svg><br><span style='color:#6366f1;font-size:0.95rem;'>[Gráfico de barras]</span></div>`;
        } else if (questao.grafico.tipo === 'pie') {
          questionHTML += `<div style='text-align:center;margin-bottom:10px;'><svg width='60' height='60' viewBox='0 0 32 32'><circle r='16' cx='16' cy='16' fill='#f3f4f6'/><path d='M16 16 L16 0 A16 16 0 0 1 32 16 Z' fill='#6366f1'/><path d='M16 16 L32 16 A16 16 0 0 1 16 32 Z' fill='#a78bfa'/></svg><br><span style='color:#6366f1;font-size:0.95rem;'>[Gráfico de pizza]</span></div>`;
        } else if (questao.grafico.tipo === 'line') {
          questionHTML += `<div style='text-align:center;margin-bottom:10px;'><svg width='120' height='60'><polyline points='10,50 30,30 50,40 70,20 90,30' fill='none' stroke='#6366f1' stroke-width='3'/></svg><br><span style='color:#6366f1;font-size:0.95rem;'>[Gráfico de linha]</span></div>`;
        } else {
          questionHTML += `<div style='text-align:center;margin-bottom:10px;'><span style='color:#6366f1;font-size:0.95rem;'>[Gráfico: ${questao.grafico.tipo || 'tipo'}]</span></div>`;
        }
      }

      // Renderizar figura geométrica (SVG simples ou placeholder)
      if (questao.figuraGeometrica) {
        if (questao.figuraGeometrica.tipo === 'circulo') {
          questionHTML += `<div style='text-align:center;margin-bottom:10px;'><svg width='60' height='60'><circle cx='30' cy='30' r='25' fill='#a7f3d0' stroke='#059669' stroke-width='3'/></svg><br><span style='color:#059669;font-size:0.95rem;'>[Círculo]</span></div>`;
        } else if (questao.figuraGeometrica.tipo === 'triangulo') {
          questionHTML += `<div style='text-align:center;margin-bottom:10px;'><svg width='60' height='60'><polygon points='30,10 10,50 50,50' fill='#fef08a' stroke='#eab308' stroke-width='3'/></svg><br><span style='color:#059669;font-size:0.95rem;'>[Triângulo]</span></div>`;
        } else if (questao.figuraGeometrica.tipo === 'quadrado') {
          questionHTML += `<div style='text-align:center;margin-bottom:10px;'><svg width='60' height='60'><rect x='10' y='10' width='40' height='40' fill='#dbeafe' stroke='#2563eb' stroke-width='3'/></svg><br><span style='color:#059669;font-size:0.95rem;'>[Quadrado]</span></div>`;
        } else {
          questionHTML += `<div style='text-align:center;margin-bottom:10px;'><span style='color:#059669;font-size:0.95rem;'>[Figura: ${questao.figuraGeometrica.tipo || 'tipo'}]</span></div>`;
        }
      }

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
