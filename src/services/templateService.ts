export class TemplateService {
  private templates: { [key: string]: string } = {
    '1': `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{titulo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.45;
            color: #333;
            background: #f8fafc;
            padding: 20px;
            font-size: 0.89rem;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 32px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            font-size: 0.89rem;
          }
          
          .header-section {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
          }
          
          .header-section h1 {
            color: #1e40af;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .info-table {
            width: 100%;
            margin-bottom: 30px;
            border-collapse: collapse;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .info-table th {
            background: #3b82f6;
            color: white;
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            font-size: 0.89rem;
          }
          
          .info-table td {
            background: #f8fafc;
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.89rem;
          }
          
          .info-table th.sticky-right, .info-table td.sticky-right {
            position: sticky;
            right: 0;
            background: #f3f4f6;
            z-index: 2;
            min-width: 140px;
            max-width: 180px;
            text-align: left;
            font-weight: 600;
          }
          
          .section {
            margin-bottom: 24px;
            page-break-inside: avoid;
            font-size: 0.89rem;
          }
          
          .section h3 {
            color: #7c3aed !important;
            font-size: 1.05rem !important;
            margin-bottom: 12px !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            border-bottom: none !important;
            padding-bottom: 0 !important;
          }
          
          .objectives-list, .skills-list {
            list-style: none;
            padding: 0;
            margin: 15px 0;
          }
          
          .objectives-list li, .skills-list li {
            margin-bottom: 10px;
            padding: 12px 15px;
            background: #f1f5f9;
            border-left: 4px solid #3b82f6;
            border-radius: 4px;
            font-size: 0.89rem;
            line-height: 1.45;
          }
          
          .skills-list li {
            border-left-color: #10b981;
            background: #f0fdf4;
          }
          
          .development-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .development-table th {
            background: #1e40af;
            color: white;
            padding: 12px 10px;
            text-align: left;
            font-weight: 600;
            font-size: 0.89rem;
          }
          
          .development-table td {
            background: white;
            padding: 15px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.89rem;
            vertical-align: top;
            line-height: 1.4;
          }
          
          .development-table tr:nth-child(even) td {
            background: #f8fafc;
          }
          
          .resources-list {
            list-style: none;
            padding: 0;
            margin: 15px 0;
          }
          
          .resources-list li {
            margin-bottom: 8px;
            padding: 10px 15px;
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 4px;
            font-size: 0.89rem;
          }
          
          .content-text, .evaluation-text {
            font-size: 0.89rem;
            line-height: 1.45;
            text-align: justify;
            margin-top: 8px;
            padding: 10px;
            background: #f8fafc;
            border-radius: 6px;
          }
          
          .evaluation-text {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            border-radius: 6px;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .container {
              box-shadow: none;
              padding: 20px;
            }
            
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-section">
            <h1>{titulo}</h1>
            
            <table class="info-table">
              <tr>
                <th>Professor(a)</th>
                <td>{professor}</td>
                <th style="background:#f3f4f6;min-width:270px;padding-left:8px;padding-right:24px;text-align:left;" colspan="2"><b>Data:</b> <span style="font-weight:400;">{data}</span></th>
              </tr>
              <tr>
                <th>Disciplina</th>
                <td>{disciplina}</td>
                <th style="background:#f3f4f6;min-width:270px;padding-left:8px;padding-right:24px;text-align:left;" colspan="2"><b>Série/Ano:</b> <span style="font-weight:400;">{serie}</span></th>
              </tr>
              <tr>
                <th>BNCC</th>
                <td>{bncc}</td>
                <th style="background:#f3f4f6;min-width:270px;padding-left:8px;padding-right:24px;text-align:left;" colspan="2"><b>Duração:</b> <span style="font-weight:400;">{duracao}</span></th>
              </tr>
              <tr>
                <th>Tema</th>
                <td colspan="4">{tema}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h3>Objetivos</h3>
            <ul class="objectives-list">
              {objetivos}
            </ul>
          </div>
          
          <div class="section">
            <h3>Habilidades</h3>
            <ul class="skills-list">
              {habilidades}
            </ul>
          </div>
          
          <div class="section">
            <h3>Desenvolvimento da Aula</h3>
            <table class="development-table">
              <thead>
                <tr>
                  <th style="width: 15%;">Etapa</th>
                  <th style="width: 10%;">Tempo</th>
                  <th style="width: 45%;">Atividade</th>
                  <th style="width: 30%;">Recursos</th>
                </tr>
              </thead>
              <tbody>
                {desenvolvimento}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h3>Recursos Didáticos</h3>
            <ul class="resources-list">
              {recursos}
            </ul>
          </div>
          
          <div class="section">
            <h3>Conteúdos Programáticos</h3>
            <ul class="objectives-list">
              {conteudosProgramaticos}
            </ul>
          </div>
          
          <div class="section">
            <h3>Metodologia</h3>
            <div class="content-text">{metodologia}</div>
          </div>
          
          <div class="section">
            <h3>Avaliação</h3>
            <div class="evaluation-text">{avaliacao}</div>
          </div>
          
          <div class="section">
            <h3>Referências</h3>
            <ul class="objectives-list">
              {referencias}
            </ul>
          </div>
        </div>
      </body>
      </html>
    `,

    '2': `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{titulo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          
          .presentation-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            width: 100%;
            max-width: 1400px;
            min-height: 80vh;
            position: relative;
            overflow: hidden;
          }
          
          .slide {
            display: none;
            padding: 60px;
            min-height: 80vh;
            position: relative;
            background: white;
          }
          
          .slide.active {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          
          .slide-header {
            position: absolute;
            top: 20px;
            right: 30px;
            font-size: 14px;
            color: #888;
            font-weight: 500;
          }
          
          .slide-footer {
            position: absolute;
            bottom: 20px;
            left: 30px;
            right: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #666;
          }
          
          .slide-footer .logo {
            font-weight: 700;
            color: #667eea;
          }
          
          .slide-number {
            background: #667eea;
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-weight: 500;
          }
          
          .slide-1 {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            display: flex !important;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          
          .slide-1 h1 {
            font-size: 4rem;
            font-weight: 800;
            margin-bottom: 20px;
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
          
          .slide-1 .subtitle {
            font-size: 1.5rem;
            font-weight: 300;
            margin-bottom: 40px;
            opacity: 0.9;
          }
          
          .slide-1 .info {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            margin-top: 40px;
          }
          
          .slide-1 .info p {
            margin: 10px 0;
            font-size: 1.1rem;
          }
          
          .slide-1 .image-placeholder {
            width: 300px;
            height: 200px;
            background: rgba(255,255,255,0.2);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 30px auto;
            font-size: 14px;
            text-align: center;
            padding: 20px;
            backdrop-filter: blur(10px);
          }
          
          h2 {
            font-size: 2.5rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 40px;
            text-align: center;
          }
          
          h3 {
            font-size: 1.8rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
          }
          
          .objectives-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 25px;
            margin-top: 30px;
          }
          
          .objective-card {
            background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
            padding: 25px;
            border-radius: 15px;
            border-left: 5px solid #667eea;
            transition: transform 0.3s ease;
          }
          
          .objective-card:hover {
            transform: translateY(-5px);
          }
          
          .objective-card .number {
            background: #667eea;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            margin-bottom: 15px;
          }
          
          .content-section {
            background: #f8f9ff;
            padding: 40px;
            border-radius: 15px;
            margin: 20px 0;
          }
          
          .content-two-column {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 40px;
            align-items: start;
          }
          
          .text-content p {
            font-size: 1.1rem;
            line-height: 1.8;
            margin-bottom: 20px;
            text-align: justify;
          }
          
          .concept-highlight {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            margin: 30px 0;
          }
          
          .concept-highlight h3 {
            color: white;
            font-size: 2rem;
            margin-bottom: 15px;
          }
          
          .development-page {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 40px;
            align-items: start;
          }
          
          .development-content h3 {
            color: #667eea;
            font-size: 2rem;
            margin-bottom: 25px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
          }
          
          .development-content p {
            font-size: 1.2rem;
            line-height: 1.8;
            text-align: justify;
            color: #444;
          }
          
          .example-section {
            background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
            color: white;
            padding: 40px;
            border-radius: 15px;
            margin: 20px 0;
          }
          
          .example-section h3 {
            color: white;
            font-size: 2.2rem;
            margin-bottom: 25px;
            text-align: center;
          }
          
          .example-content {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 30px;
            align-items: center;
          }
          
          .example-content p {
            font-size: 1.1rem;
            line-height: 1.8;
            text-align: justify;
          }
          
          .image-placeholder {
            background: rgba(255,255,255,0.1);
            border: 2px dashed rgba(255,255,255,0.3);
            border-radius: 15px;
            height: 250px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            text-align: center;
            padding: 20px;
            backdrop-filter: blur(5px);
          }
          
          .slide:not(.slide-1) .image-placeholder {
            background: #f0f4f8;
            border: 2px dashed #ddd;
            color: #666;
          }
          
          .table-container {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin: 30px 0;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          th {
            background: #667eea;
            color: white;
            padding: 20px;
            text-align: left;
            font-weight: 600;
            font-size: 1.1rem;
          }
          
          td {
            padding: 20px;
            border-bottom: 1px solid #eee;
            font-size: 1rem;
          }
          
          tr:hover {
            background: #f8f9ff;
          }
          
          .activity-section {
            background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
            padding: 40px;
            border-radius: 15px;
            margin: 30px 0;
          }
          
          .activity-section h3 {
            color: #2d3436;
            margin-bottom: 30px;
            text-align: center;
          }
          
          .question {
            background: white;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          
          .options {
            list-style: none;
            margin-top: 20px;
          }
          
          .options li {
            background: #f8f9ff;
            padding: 12px 20px;
            margin: 8px 0;
            border-radius: 10px;
            border-left: 4px solid #667eea;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .options li:hover {
            background: #e8f2ff;
            transform: translateX(5px);
          }
          
          .conclusion-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin: 30px 0;
          }
          
          .conclusion-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
          }
          
          .conclusion-card h4 {
            font-size: 1.3rem;
            margin-bottom: 15px;
            color: white;
          }
          
          .next-steps {
            background: #f8f9ff;
            padding: 30px;
            border-radius: 15px;
            margin-top: 30px;
          }
          
          .next-steps ul {
            list-style: none;
            margin-top: 20px;
          }
          
          .next-steps li {
            background: white;
            padding: 15px 20px;
            margin: 10px 0;
            border-radius: 10px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          
          .navigation {
            position: fixed;
            bottom: 30px;
            right: 30px;
            display: flex;
            gap: 10px;
            z-index: 1000;
          }
          
          .nav-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }
          
          .nav-btn:hover {
            background: #5a67d8;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }
          
          .nav-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          
          @media (max-width: 768px) {
            .slide {
              padding: 30px 20px;
            }
            
            .slide-1 h1 {
              font-size: 2.5rem;
            }
            
            h2 {
              font-size: 2rem;
            }
            
            .objectives-grid,
            .conclusion-grid {
              grid-template-columns: 1fr;
            }
            
            .content-two-column,
            .development-page,
            .example-content {
              grid-template-columns: 1fr;
              gap: 20px;
            }
            
            .navigation {
              bottom: 20px;
              right: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="presentation-container">
          <!-- Slide 1: Título -->
          <div class="slide slide-1 active">
            <h1>{slide_1_titulo}</h1>
            <div class="subtitle">{slide_1_subtitulo}</div>
            <div class="image-placeholder"></div>
            <div class="info">
              <p><strong>Professor(a):</strong> {professor}</p>
              <p><strong>Data:</strong> {data}</p>
              <p><strong>Disciplina:</strong> {disciplina}</p>
              <p><strong>Série:</strong> {serie}</p>
            </div>
          </div>

          <!-- Slide 2: Objetivos -->
          <div class="slide">
            <div class="slide-header">Slide 2/12</div>
            <h2>Objetivos da Aula</h2>
            <ul class="objectives-list" style="list-style: disc inside; color: #fff; font-size: 1.18rem; font-weight: 500; text-align: justify; max-width: 800px; margin: 2.2em auto 0 auto; padding: 0 1.5em;">
              <li>{objetivo_1}</li><li>{objetivo_2}</li><li>{objetivo_3}</li><li>{objetivo_4}</li>
            </ul>
            <div class="slide-footer">
              <div class="slide-number">2/12</div>
            </div>
          </div>

          <!-- Slide 3: Introdução -->
          <div class="slide">
            <div class="slide-header">Slide 3/12</div>
            <h2>Introdução</h2>
            <div class="content-two-column">
              <div class="text-content">
                <p>{introducao_texto}</p>
              </div>
              <div class="image-placeholder"></div>
            </div>
            <div class="slide-footer">
              <div class="slide-number">3/12</div>
            </div>
          </div>

          <!-- Slide 4: Conceito Principal -->
          <div class="slide">
            <div class="slide-header">Slide 4/12</div>
            <h2>Conceito Principal</h2>
            <div class="content-section">
              <p>{conceitos_texto}</p>
            </div>
            <div class="concept-highlight">
              <p style="font-size:1rem;font-weight:600;color:#FFD600;margin:18px 0 0 0;">{conceito_principal}</p>
            </div>
            <div class="image-placeholder" style="margin: 20px auto; width: 400px;"></div>
            <div class="slide-footer">
              <div class="slide-number">4/12</div>
            </div>
          </div>

          <!-- Slide 5: Desenvolvimento 1 -->
          <div class="slide">
            <div class="slide-header">Slide 5/12</div>
            <h2>Desenvolvimento do Conteúdo</h2>
            <div class="development-page">
              <div class="development-content">
                <h3>{desenvolvimento_1_titulo}</h3>
                <p>{desenvolvimento_1_texto}</p>
              </div>
              <div class="image-placeholder"></div>
            </div>
            <div class="slide-footer">
              <div class="slide-number">5/12</div>
            </div>
          </div>

          <!-- Slide 6: Desenvolvimento 2 -->
          <div class="slide">
            <div class="slide-header">Slide 6/12</div>
            <h2>Continuação dos Tópicos</h2>
            <div class="development-page">
              <div class="development-content">
                <h3>{desenvolvimento_2_titulo}</h3>
                <p>{desenvolvimento_2_texto}</p>
              </div>
              <div class="image-placeholder"></div>
            </div>
            <div class="slide-footer">
              <div class="slide-number">6/12</div>
            </div>
          </div>

          <!-- Slide 7: Desenvolvimento 3 -->
          <div class="slide">
            <div class="slide-header">Slide 7/12</div>
            <h2>Desenvolvimento do Conteúdo</h2>
            <div class="development-page">
              <div class="development-content">
                <h3>{desenvolvimento_3_titulo}</h3>
                <p>{desenvolvimento_3_texto}</p>
              </div>
              <div class="image-placeholder"></div>
            </div>
            <div class="slide-footer">
              <div class="slide-number">7/12</div>
            </div>
          </div>

          <!-- Slide 8: Desenvolvimento 4 -->
          <div class="slide">
            <div class="slide-header">Slide 8/12</div>
            <h2>Continuação dos Tópicos</h2>
            <div class="development-page">
              <div class="development-content">
                <h3>{desenvolvimento_4_titulo}</h3>
                <p>{desenvolvimento_4_texto}</p>
              </div>
              <div class="image-placeholder"></div>
            </div>
            <div class="slide-footer">
              <div class="slide-number">8/12</div>
            </div>
          </div>

          <!-- Slide 9: Exemplo Prático -->
          <div class="slide">
            <div class="slide-header">Slide 9/12</div>
            <h2>Exemplo Prático</h2>
            <div class="example-section">
              <h3>{exemplo_titulo}</h3>
              <div class="example-content">
                <p>{exemplo_conteudo}</p>
                <div class="image-placeholder"></div>
              </div>
            </div>
            <div class="slide-footer">
              <div class="slide-number">9/12</div>
            </div>
          </div>

          <!-- Slide 10: Tabela -->
          <div class="slide">
            <div class="slide-header">Slide 10/12</div>
            <h2>{tabela_titulo}</h2>
            <div class="table-container" style="display:flex;justify-content:center;align-items:center;margin-top:32px;">
              <table style="min-width:420px;background:rgba(255,255,255,0.12);border-radius:12px;border-collapse:separate;border-spacing:0 8px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                <thead>
                  <tr>
                    <th style="text-align:center;padding:10px 24px 6px 24px;font-size:1.15rem;">{coluna_1}</th>
                    <th style="text-align:center;padding:10px 24px 6px 24px;font-size:1.15rem;">{coluna_2}</th>
                    <th style="text-align:center;padding:10px 24px 6px 24px;font-size:1.15rem;">{coluna_3}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding:8px 24px;font-size:1rem;">{linha_1_col_1}</td>
                    <td style="padding:8px 24px;font-size:1rem;">{linha_1_col_2}</td>
                    <td style="padding:8px 24px;font-size:1rem;">{linha_1_col_3}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 24px;font-size:1rem;">{linha_2_col_1}</td>
                    <td style="padding:8px 24px;font-size:1rem;">{linha_2_col_2}</td>
                    <td style="padding:8px 24px;font-size:1rem;">{linha_2_col_3}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 24px;font-size:1rem;">{linha_3_col_1}</td>
                    <td style="padding:8px 24px;font-size:1rem;">{linha_3_col_2}</td>
                    <td style="padding:8px 24px;font-size:1rem;">{linha_3_col_3}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="slide-footer">
              <div class="slide-number">10/12</div>
            </div>
          </div>

          <!-- Slide 11: Atividade -->
          <div class="slide">
            <div class="slide-header">Slide 11/12</div>
            <h2>Atividade Interativa</h2>
            <div class="activity-section" style="display:flex;flex-direction:column;align-items:center;">
              <h3 style="display:flex;align-items:center;gap:10px;justify-content:center;">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:#FFD600;border-radius:50%;font-size:1.3rem;color:#1e293b;box-shadow:0 2px 6px rgba(0,0,0,0.08);">?</span>
                Responda a pergunta:
              </h3>
              <div class="question" style="animation:fadeInQ 0.7s;display:flex;flex-direction:column;align-items:center;width:100%;">
                <p style="margin-bottom:18px;display:flex;align-items:center;gap:10px;justify-content:center;">
                  <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;background:#3b82f6;border-radius:50%;font-size:1.1rem;color:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.07);">Q</span>
                  <strong>{atividade_pergunta}</strong>
                </p>
                <ul class="options" style="background:rgba(255,255,255,0.10);border-radius:12px;padding:18px 24px;list-style:none;animation:fadeInOpt 1.1s;display:grid;grid-template-columns:1fr 1fr;gap:18px 32px;justify-items:center;max-width:420px;margin:0 auto;">
                  <li style="display:flex;align-items:center;gap:10px;justify-content:flex-start;width:100%;">
                    <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:#f59e42;border-radius:50%;font-size:1.1rem;color:#fff;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.10);">A</span> {opcao_a}
                  </li>
                  <li style="display:flex;align-items:center;gap:10px;justify-content:flex-start;width:100%;">
                    <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:#38bdf8;border-radius:50%;font-size:1.1rem;color:#fff;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.10);">B</span> {opcao_b}
                  </li>
                  <li style="display:flex;align-items:center;gap:10px;justify-content:flex-start;width:100%;">
                    <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:#a78bfa;border-radius:50%;font-size:1.1rem;color:#fff;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.10);">C</span> {opcao_c}
                  </li>
                  <li style="display:flex;align-items:center;gap:10px;justify-content:flex-start;width:100%;">
                    <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:#f87171;border-radius:50%;font-size:1.1rem;color:#fff;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.10);">D</span> {opcao_d}
                  </li>
                </ul>
              </div>
              <style>
                @keyframes fadeInQ { from { opacity:0; transform:translateY(24px);} to { opacity:1; transform:none;}}
                @keyframes fadeInOpt { from { opacity:0; transform:translateY(32px);} to { opacity:1; transform:none;}}
              </style>
            </div>
            <div class="slide-footer">
              <div class="slide-number">11/12</div>
            </div>
          </div>

          <!-- Slide 12: Conclusão -->
          <div class="slide">
            <div class="slide-header">Slide 12/12</div>
            <h2>Conclusão</h2>
            <div class="content-section">
              <p>{conclusao_texto}</p>
            </div>
            <div class="conclusion-grid">
              <div class="conclusion-card">
                <h4>Pontos-Chave</h4>
                <p>{ponto_chave_1}</p>
                <p>{ponto_chave_2}</p>
              </div>
              <div class="conclusion-card">
                <h4>Próximos Passos</h4>
                <p>{proximo_passo_1}</p>
                <p>{proximo_passo_2}</p>
              </div>
            </div>
            <div class="next-steps">
              <h3>Para continuar estudando:</h3>
              <ul>
                <li>{proximo_passo_3}</li>
              </ul>
            </div>
            <div class="slide-footer">
              <div class="slide-number">12/12</div>
            </div>
          </div>
        </div>

        <div class="navigation">
          <button class="nav-btn" onclick="previousSlide()">← Anterior</button>
          <button class="nav-btn" onclick="nextSlide()">Próximo →</button>
        </div>

        <script>
          let currentSlideIndex = 0;
          const slides = document.querySelectorAll('.slide');
          const totalSlides = slides.length;

          function showSlide(index) {
            slides.forEach((slide, i) => {
              slide.classList.remove('active');
              if (i === index) {
                slide.classList.add('active');
              }
            });
            updateNavigation();
          }

          function nextSlide() {
            if (currentSlideIndex < totalSlides - 1) {
              currentSlideIndex++;
              showSlide(currentSlideIndex);
            }
          }

          function previousSlide() {
            if (currentSlideIndex > 0) {
              currentSlideIndex--;
              showSlide(currentSlideIndex);
            }
          }

          function updateNavigation() {
            const prevBtn = document.querySelector('.nav-btn');
            const nextBtn = document.querySelectorAll('.nav-btn')[1];
            
            prevBtn.disabled = currentSlideIndex === 0;
            nextBtn.disabled = currentSlideIndex === totalSlides - 1;
          }

          // Keyboard navigation
          document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
              nextSlide();
            } else if (e.key === 'ArrowLeft') {
              previousSlide();
            }
          });

          // Initialize
          showSlide(0);
        </script>
      </body>
      </html>
    `,

    '3': `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{titulo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background: #f8fafc;
            padding: 20px;
            color: #333;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header-section {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #10b981;
          }
          .header-section h1 {
            color: #065f46;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-section">
            <h1>{titulo}</h1>
            <table style="width:100%; border-collapse:separate; border-spacing:0; font-size:1rem; margin-bottom: 30px;">
              <tr>
                <th style="width:18%;text-transform:uppercase;background:#f3f4f6;text-align:left;padding:4px 10px;vertical-align:middle;">ESCOLA:</th>
                <td style="width:52%;border:1.5px solid #555;height:22px;text-align:left;vertical-align:middle;padding-left:12px;font-size:1rem;font-weight:400;">{escola}</td>
                <td rowspan="3" style="width:20%;border:1.5px solid #555;position:relative;vertical-align:bottom;padding:0;border-top-right-radius:12px;border-bottom-right-radius:12px;">
                  <div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);width:100%;text-align:center;font-size:1rem;font-weight:400;">
                    DATA:{data}
                  </div>
                </td>
              </tr>
              <tr>
                <th style="text-transform:uppercase;background:#f3f4f6;text-align:left;padding:4px 10px;vertical-align:middle;">PROFESSOR(A):</th>
                <td style="border:1.5px solid #555;height:22px;text-align:left;vertical-align:middle;padding-left:12px;font-size:1rem;font-weight:400;">{professor}</td>
              </tr>
              <tr>
                <th style="text-transform:uppercase;background:#f3f4f6;text-align:left;padding:4px 10px;vertical-align:middle;">ALUNO(A):</th>
                <td style="border:1.5px solid #555;height:22px;position:relative;text-align:center;vertical-align:middle;overflow:hidden;">
                  <span style="display:inline-block;max-width:98%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;position:absolute;right:12px;top:50%;transform:translateY(-50%);font-weight:400;text-transform:uppercase;font-size:0.92rem;">SÉRIE:{serie}</span>
                </td>
              </tr>
            </table>
          </div>
          <div class="instructions">
            <h3>Instruções</h3>
            <p><strong>{temaDisciplina}:</strong> <span style="font-size:0.92rem;">{instrucoes}</span></p>
          </div>
          {questoes}
        </div>
      </body>
      </html>
    `,

    '4': `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{titulo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
            padding: 20px;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .header-section {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #dc2626;
          }
          
          .header-section h1 {
            color: #991b1b;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .info-table {
            width: 100%;
            margin-bottom: 30px;
            border-collapse: collapse;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .info-table th {
            background: #dc2626;
            color: white;
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            font-size: 0.9rem;
          }
          
          .info-table td {
            background: #fef2f2;
            padding: 12px 15px;
            border-bottom: 1px solid #fecaca;
            font-size: 0.9rem;
          }
          
          .instructions {
            background: #fef3c7;
            padding: 20px;
            border-left: 4px solid #f59e0b;
            margin-bottom: 30px;
            border-radius: 6px;
          }
          
          .instructions h3 {
            color: #92400e;
            margin-bottom: 10px;
            font-size: 1.2rem;
          }
          
          .questao-container {
            margin-bottom: 30px;
            padding: 25px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: #fafafa;
            page-break-inside: avoid;
            position: relative;
          }
          
          .questao-container:hover {
            border-color: #dc2626;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
          }
          
          .questao-numero {
            font-weight: 600;
            color: #991b1b;
            margin-bottom: 15px;
            font-size: 1.1rem;
            padding: 8px 15px;
            background: #fecaca;
            border-radius: 6px;
            display: inline-block;
          }
          
          .questao-enunciado {
            margin-bottom: 20px;
            font-size: 1rem;
            line-height: 1.6;
            text-align: justify;
            color: #374151;
            font-weight: 500;
          }
          
          .questao-opcoes {
            margin-left: 0;
          }
          
          .opcao {
            margin-bottom: 12px;
            padding: 15px 18px;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            display: flex;
            align-items: flex-start;
            transition: all 0.2s ease;
            cursor: pointer;
          }
          
          .opcao:hover {
            background: #fef2f2;
            border-color: #dc2626;
            transform: translateX(3px);
          }
          
          .opcao-letra {
            color: black !important;
            text-shadow: none !important;
            background: none;
            padding: 0;
            border-radius: 0;
            font-size: 0.9rem;
            text-align: center;
          }
          
          .opcao-texto {
            flex: 1;
            font-size: 0.95rem;
            line-height: 1.4;
          }
          
          .answer-lines {
            border-bottom: 2px solid #dc2626;
            margin-bottom: 15px;
            height: 30px;
            width: 100%;
            display: block;
          }
          
          .pontuacao {
            position: absolute;
            top: 15px;
            right: 20px;
            background: #dc2626;
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
          }
          
          .matching-section {
            display: flex;
            gap: 30px;
            margin: 20px 0;
          }
          
          .matching-column {
            flex: 1;
          }
          
          .matching-column h4 {
            color: #991b1b;
            margin-bottom: 15px;
            font-size: 1rem;
            font-weight: 600;
          }
          
          .matching-item {
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            margin-bottom: 8px;
            border-radius: 4px;
            background: none;
            font-size: 0.92rem;
          }
          
          .matching-item:hover {
            background: #fef2f2;
            border-color: #dc2626;
          }
          
          .fill-blank {
            display: inline-block !important;
            border-bottom: 2px solid #4338ca !important;
            min-width: 180px !important;
            width: 300px !important;
            max-width: 600px !important;
            height: 1.2em !important;
            vertical-align: middle !important;
            margin: 0 4px !important;
            background: none !important;
          }
          
          .image-space {
            border: 2px dashed #dc2626;
            min-height: 150px;
            margin: 20px 0;
            padding: 20px;
            border-radius: 8px;
            background: #fef2f2;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #991b1b;
            font-size: 0.9rem;
            font-weight: 500;
          }
          
          .math-space {
            border: 2px solid #dc2626;
            min-height: 100px;
            margin: 15px 0;
            padding: 15px;
            border-radius: 6px;
            background: #fef2f2;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #991b1b;
            font-size: 0.85rem;
          }
          
          .criteria-section {
            margin-top: 40px;
            padding: 20px;
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            border-radius: 6px;
          }
          
          .criteria-section h3 {
            color: #0c4a6e;
            margin-bottom: 15px;
            font-size: 1.1rem;
          }
          
          .criteria-section ul {
            list-style: none;
            padding: 0;
          }
          
          .criteria-section li {
            margin-bottom: 8px;
            padding: 8px 12px;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #0ea5e9;
            font-size: 0.9rem;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .container {
              box-shadow: none;
              padding: 20px;
            }
            
            .questao-container {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-section">
            <h1>{titulo}</h1>
            
            <table class="info-table">
              <tr>
                <th style="background:#f3f4f6;text-align:left;padding:8px 12px;">ESCOLA:</th>
                <td style="border:1.5px solid #555;height:28px;text-align:left;padding-left:12px;font-size:1rem;font-weight:400;"> </td>
                <th style="background:#f3f4f6;text-align:left;padding:8px 12px;">PROFESSOR(A):</th>
                <td style="border:1.5px solid #555;height:28px;text-align:left;padding-left:12px;font-size:1rem;font-weight:400;">{professor}</td>
                <td rowspan="3" style="width:22%;border:1.5px solid #555;position:relative;vertical-align:top;padding:0;border-top-right-radius:12px;border-bottom-right-radius:12px;">
                  <div style="display:flex;flex-direction:column;justify-content:flex-start;align-items:flex-end;height:100%;padding:10px 12px 0 0;">
                    <div style="font-weight:700;font-size:1.1rem;color:#222;margin-bottom:8px;">NOTA:</div>
                    <div style="font-size:1rem;font-weight:400;margin-top:24px;">DATA:__/__/__</div>
                  </div>
                </td>
              </tr>
              <tr>
                <th style="background:#f3f4f6;text-align:left;padding:8px 12px;">ALUNO(A):</th>
                <td style="border:1.5px solid #555;height:28px;text-align:left;padding-left:12px;font-size:1rem;font-weight:400;"> </td>
                <th style="background:#f3f4f6;text-align:left;padding:8px 12px;">SÉRIE/ANO:</th>
                <td style="border:1.5px solid #555;height:28px;text-align:left;padding-left:12px;font-size:1rem;font-weight:400;">{serie}</td>
              </tr>
              <tr>
                <th style="background:#f3f4f6;text-align:left;padding:8px 12px;">TEMA:</th>
                <td style="border:1.5px solid #555;height:28px;text-align:left;padding-left:12px;font-size:1rem;font-weight:400;">{tema}</td>
                <th style="background:#f3f4f6;text-align:left;padding:8px 12px;">DURAÇÃO:</th>
                <td style="border:1.5px solid #555;height:28px;text-align:left;padding-left:12px;font-size:1rem;font-weight:400;">{duracao}</td>
              </tr>
              <tr>
                <th style="background:#f3f4f6;text-align:left;padding:8px 12px;">BNCC:</th>
                <td colspan="4" style="border:1.5px solid #555;height:28px;text-align:left;padding-left:12px;font-size:1rem;font-weight:400;">{bncc}</td>
              </tr>
            </table>
          </div>
          
          <div class="instructions">
            <h3>Instruções da Avaliação</h3>
            <p>{instrucoes}</p>
          </div>
          
          {questoes}
          
          <div class="criteria-section">
            <h3>Critérios de Avaliação</h3>
            <ul>
              {criterios_avaliacao}
            </ul>
          </div>
        </div>
      </body>
      </html>
    `,
    '5': `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{titulo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            margin: 0;
            padding: 0;
            background: #f0f4f8;
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            color: #222;
          }
          .page {
            max-width: 900px;
            margin: 32px auto;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            padding: 0 0 32px 0;
            position: relative;
          }
          .header {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 32px 40px 0 40px;
          }
          .logo {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo svg {
            width: 28px;
            height: 28px;
            stroke: #fff;
            fill: none;
            stroke-width: 2;
          }
          .brand-text {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .brand-text h1 {
            font-size: 1.5rem;
            color: #0ea5e9;
            margin: 0;
            font-weight: 700;
            letter-spacing: -0.2px;
          }
          .brand-text p {
            font-size: 0.95rem;
            color: #6b7280;
            margin: 0;
            font-weight: 400;
          }
          .support-title {
            font-size: 2rem;
            color: #4338ca;
            font-weight: 800;
            text-align: center;
            margin: 32px 0 8px 0;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .support-meta {
            font-size: 1.1rem;
            color: #555;
            text-align: center;
            margin-bottom: 24px;
          }
          .support-content {
            font-size: 1.13rem;
            color: #222;
            background: #f8fafc;
            border-radius: 8px;
            padding: 32px 40px;
            margin: 0 40px 24px 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            text-align: justify;
            line-height: 1.7;
            min-height: 300px;
            word-break: break-word;
          }
          .footer {
            text-align: center;
            font-size: 0.9rem;
            color: #6b7280;
            margin-top: 32px;
            padding-bottom: 8px;
          }
          @media (max-width: 700px) {
            .page { padding: 0 0 24px 0; }
            .header, .support-content { padding: 16px 12px; margin: 0 0 16px 0; }
            .support-title { font-size: 1.2rem; margin: 18px 0 8px 0; }
            .support-content { font-size: 1rem; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
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
          <div class="support-title">Conteúdo de Apoio ao Professor</div>
          <div class="support-meta">
            <b>Tema:</b> {tema} &nbsp;|&nbsp; <b>Disciplina:</b> {disciplina} &nbsp;|&nbsp; <b>Série:</b> {serie} &nbsp;|&nbsp; <b>Data:</b> {data}
          </div>
          <div class="support-content">{conteudo}</div>
          <div class="footer">
            Conteúdo de Apoio gerado pela AulagIA - Sua aula com toque mágico • aulagia.com.br
          </div>
        </div>
      </body>
      </html>
    `
  };

  renderTemplate(templateId: string, data: any): string {
    const template = this.templates[templateId];
    if (!template) {
      throw new Error(`Template ${templateId} não encontrado`);
    }

    let rendered = template;

    // Handle different data structures
    if (typeof data === 'string') {
      return data;
    }

    // Adiciona o campo temaDisciplina para uso no template
    const tema = data.tema || data.topic || '';
    const disciplina = data.subject || data.disciplina || '';
    let temaDisciplina = '';
    if (tema && disciplina) {
      temaDisciplina = `${tema} - ${disciplina}`;
    } else if (tema) {
      temaDisciplina = tema;
    } else if (disciplina) {
      temaDisciplina = disciplina;
    }
    data.temaDisciplina = temaDisciplina;

    // Replace all placeholders with actual data
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      let value = data[key];

      // Handle arrays (like objectives, skills, resources, etc.)
      if (Array.isArray(value)) {
        if (key === 'habilidades') {
          value = value.map(item =>
            typeof item === 'object' && item !== null
              ? `<li>${item.codigo ? `<b>${item.codigo}</b>: ` : ''}${item.descricao || JSON.stringify(item)}</li>`
              : `<li>${item}</li>`
          ).join('');
        } else if (key === 'objetivos' || key === 'recursos' || key === 'conteudosProgramaticos' || key === 'referencias') {
          value = value.map(item => `<li>${typeof item === 'object' ? (item.descricao || JSON.stringify(item)) : item}</li>`).join('');
        } else if (key === 'desenvolvimento') {
          value = value.map(etapa => `
            <tr>
              <td><strong>${etapa.etapa}</strong></td>
              <td>${etapa.tempo}</td>
              <td>${etapa.atividade}</td>
              <td>${etapa.recursos}</td>
            </tr>
          `).join('');
        } else if (key === 'questoes') {
          value = this.renderQuestions(value);
        } else if (key === 'criterios_avaliacao') {
          value = value.map(criterio => `<li>${criterio}</li>`).join('');
        } else {
          value = value.join(', ');
        }
      }

      // Corrigir parse de metodologia e avaliacao se vierem como objeto
      if ((key === 'metodologia' || key === 'avaliacao') && typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          value = value.map(item => (typeof item === 'object' ? (item.descricao || JSON.stringify(item)) : item)).join('<br>');
        } else {
          value = value.descricao || JSON.stringify(value);
        }
      }

      // Ensure value is a string
      if (typeof value !== 'string') {
        value = String(value || '');
      }

      rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
    });

    // Clean up any remaining placeholders
    rendered = rendered.replace(/\{[^}]+\}/g, '');

    return rendered;
  }

  private renderQuestions(questoes: any[]): string {
    return questoes.map((questao, index) => {
      let questionHtml = `
        <div class="questao-container">
          <div class="questao-numero">Questão ${questao.numero || index + 1}</div>
          <div class="questao-enunciado">${questao.pergunta || questao.enunciado || ''}</div>
      `;

      // Add visual elements if present
      if (questao.imagem) {
        questionHtml += `<div class="image-space">${questao.imagem}</div>`;
      }

      if (questao.grafico) {
        questionHtml += `<div class="image-space">Gráfico: ${JSON.stringify(questao.grafico)}</div>`;
      }

      if (questao.figuraGeometrica) {
        questionHtml += `<div class="math-space">Figura Geométrica: ${JSON.stringify(questao.figuraGeometrica)}</div>`;
      }

      if (questao.icones && questao.icones.length > 0) {
        questionHtml += `<div class="image-space">Ícones: ${questao.icones.join(', ')}</div>`;
      }

      // Handle different question types
      switch (questao.tipo) {
        case 'multipla_escolha':
          if (questao.opcoes && questao.opcoes.length > 0) {
            questionHtml += '<div class="questao-opcoes">';
            questao.opcoes.forEach((opcao: string, i: number) => {
              const letra = String.fromCharCode(65 + i); // A, B, C, D
              questionHtml += `
                <div class="opcao">
                  <span class="opcao-letra" style="color:black !important;">${letra})</span>&nbsp;<span class="opcao-texto">${opcao}</span>
                </div>
              `;
            });
            questionHtml += '</div>';
          }
          break;

        case 'verdadeiro_falso':
          if (questao.opcoes && questao.opcoes.length >= 2) {
            questionHtml += '<div class="questao-opcoes">';
            questao.opcoes.forEach((opcao: string, i: number) => {
              questionHtml += `
                <div class="opcao">
                  <span class="opcao-letra" style="color:black !important;">( )</span>
                  <span class="opcao-texto">${opcao}</span>
                </div>
              `;
            });
            questionHtml += '</div>';
          }
          break;

        case 'ligar':
          if ((questao.colunaA || questao.coluna_a) && (questao.colunaB || questao.coluna_b)) {
            // Suporte a ambos formatos de campo
            const colunaA = questao.colunaA || questao.coluna_a;
            const colunaB = questao.colunaB || questao.coluna_b;
            // Função para remover prefixos como 'A1)', 'B1)', '(1)', '(A)', etc.
            function limparPrefixo(texto) {
              return texto.replace(/^\(?[A-Za-z0-9]+\)?\s*\)?\s*/, '').trim();
            }
            questionHtml += `
              <div class="matching-section">
                <div class="matching-column">
                  <h4>Coluna A</h4>
                  ${colunaA.map((item, i) => `<div class="matching-item">(${i + 1}) ${limparPrefixo(item)}</div>`).join('')}
                </div>
                <div class="matching-column">
                  <h4>Coluna B</h4>
                  ${colunaB.map((item, i) => `<div class="matching-item">(${String.fromCharCode(65 + i)}) ${limparPrefixo(item)}</div>`).join('')}
                </div>
              </div>
            `;
          }
          break;

        case 'completar':
          if (questao.textoComLacunas) {
            // Substitui todos os grupos de underlines por uma lacuna bem grande
            const textoComEspacos = (questao.textoComLacunas || '').replace(/_+/g, '<span class="fill-blank" style="width:500px !important;display:inline-block !important;border-bottom:2px solid #222 !important;min-width:300px !important;max-width:700px !important;height:1.2em !important;vertical-align:middle !important;margin:0 4px !important;background:none !important;"></span>');
            questionHtml += `<div class="questao-opcoes">${textoComEspacos}</div>`;
          }
          break;

        case 'dissertativa':
        case 'desenho':
          const linhas = questao.linhasResposta || 5;
          questionHtml += '<div class="questao-opcoes">';
          for (let i = 0; i < linhas; i++) {
            questionHtml += '<div class="answer-lines"></div>';
          }
          questionHtml += '</div>';
          break;
      }

      // Add scoring for assessments
      if (questao.pontuacao) {
        questionHtml += `<div class="pontuacao">${questao.pontuacao} pts</div>`;
      }

      questionHtml += '</div>';
      return questionHtml;
    }).join('');
  }

  getAvailableTemplates(): { id: string; name: string; description: string }[] {
    return [
      {
        id: '1',
        name: 'Plano de Aula Clássico',
        description: 'Template tradicional para planos de aula com seções bem definidas'
      },
      {
        id: '2',
        name: 'Apresentação de Slides',
        description: 'Template moderno para apresentações educativas'
      },
      {
        id: '3',
        name: 'Atividade Educacional',
        description: 'Template para atividades e exercícios'
      },
      {
        id: '4',
        name: 'Avaliação Formal',
        description: 'Template para provas e avaliações'
      }
    ];
  }

  // Permite atualizar dinamicamente o HTML do template em tempo real
  setTemplate(templateId: string, html: string) {
    this.templates[templateId] = html;
  }

  // Permite acessar o HTML do template de forma segura
  getTemplate(templateId: string): string {
    return this.templates[templateId] || '';
  }
}

export const templateService = new TemplateService();
