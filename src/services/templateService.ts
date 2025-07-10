export const templateService = {
  generateSlideHTML: (data: any): string => {
    const slideTemplate = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slides - ${data.tema}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Lato:wght@300;400;700&display=swap');
        
        body {
            margin: 0;
            padding: 0;
            font-family: 'Lato', sans-serif;
            background: #f0f2f5;
            color: #333;
        }
        
        .slide {
            width: 100%;
            max-width: 1024px;
            height: 768px;
            margin: 0 auto 20px auto;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        
        .slide-header {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .slide-content {
            flex: 1;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        
        h1 {
            font-family: 'Poppins', sans-serif;
            font-size: 3.5rem;
            font-weight: 900;
            margin: 0 0 30px 0;
            color: #333;
            line-height: 1.2;
            letter-spacing: -1px;
        }
        
        h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 2.5rem;
            font-weight: 800;
            margin: 0 0 25px 0;
            color: #333;
        }
        
        h3 {
            font-family: 'Poppins', sans-serif;
            font-size: 2rem;
            font-weight: 700;
            margin: 0 0 20px 0;
            color: #007bff;
        }
        
        p {
            font-size: 1.3rem;
            line-height: 1.6;
            margin-bottom: 20px;
            color: #555;
        }
        
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        li {
            font-size: 1.2rem;
            margin-bottom: 15px;
            position: relative;
            padding-left: 30px;
            color: #555;
        }
        
        li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #007bff;
            font-weight: bold;
            font-size: 1.4rem;
        }
        
        .professor-info {
            font-size: 1.4rem;
            color: white;
            margin-top: 20px;
        }
        
        .subtitle {
            font-size: 1.6rem;
            color: #ccc;
            margin-top: 10px;
            font-weight: 400;
        }
        
        .image-placeholder {
            width: 300px;
            height: 200px;
            background: #f8f9fa;
            border: 2px dashed #ddd;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888;
            font-size: 1.1rem;
            margin: 20px auto;
        }
    </style>
</head>
<body>

<!-- Slide 1: Capa -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h1>${data.tema}</h1>
        <p class="subtitle">Aula de ${data.disciplina} - ${data.serie}</p>
        <div class="professor-info" style="color: #333; margin-top: 40px;">
            <span style="color: #ffa500; font-weight: 600;">Apresentado por:</span><br>
            <strong style="font-size: 1.6rem;">Professor(a): ${data.professor}</strong>
        </div>
        <div class="image-placeholder">
            ${data.tema_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 2: Objetivos -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Objetivos da Aula</h2>
        <p style="font-weight: 600; font-size: 1.4rem; color: #333; margin-bottom: 30px;">Nossos objetivos para hoje:</p>
        <ul>
            ${(data.objetivos || []).map((objetivo: string) => `<li>${objetivo}</li>`).join('')}
        </ul>
    </div>
</div>

<!-- Slide 3: Introdução -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Introdução</h2>
        <p>${data.introducao}</p>
        <div class="image-placeholder">
            ${data.introducao_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 4: Conceitos -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Conceitos Fundamentais</h2>
        <p>${data.conceitos}</p>
        <div class="image-placeholder">
            ${data.conceitos_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 5: Exemplo -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Exemplo</h2>
        <p>${data.exemplo}</p>
        <div class="image-placeholder">
            ${data.exemplo_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 6: Desenvolvimento 1 -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Desenvolvimento - Parte 1</h2>
        <p>${data.desenvolvimento1}</p>
        <div class="image-placeholder">
            ${data.desenvolvimento1_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 7: Desenvolvimento 2 -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Desenvolvimento - Parte 2</h2>
        <p>${data.desenvolvimento2}</p>
        <div class="image-placeholder">
            ${data.desenvolvimento2_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 8: Desenvolvimento 3 -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Desenvolvimento - Parte 3</h2>
        <p>${data.desenvolvimento3}</p>
        <div class="image-placeholder">
            ${data.desenvolvimento3_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 9: Desenvolvimento 4 -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Desenvolvimento - Parte 4</h2>
        <p>${data.desenvolvimento4}</p>
        <div class="image-placeholder">
            ${data.desenvolvimento4_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 10: Exemplo Prático -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Exemplo Prático</h2>
        <p>${data.exemplo_pratico}</p>
        <div class="image-placeholder">
            ${data.imagem_principal || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 11: Revisão -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Revisão</h2>
        <p>Vamos revisar os principais pontos da aula:</p>
        <ul>
            ${(data.objetivos || []).slice(0, 3).map((objetivo: string) => `<li>${objetivo}</li>`).join('')}
        </ul>
    </div>
</div>

<!-- Slide 12: Obrigado -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h1 style="font-size: 4rem; color: #007bff;">Obrigado(a)!</h1>
        <p style="font-size: 1.4rem; margin-top: 30px;">Dúvidas?</p>
    </div>
</div>

</body>
</html>
    `;

    return slideTemplate;
  },

  renderTemplate: (templateId: string, content: any): string => {
    // Template ID mapping:
    // '1' = plano-de-aula
    // '2' = slides  
    // '3' = atividade
    // '4' = avaliacao

    switch (templateId) {
      case '2': // slides
        return templateService.generateSlideHTML(content);
      
      case '1': // plano-de-aula
        return templateService.renderLessonPlan(content);
      
      case '3': // atividade
        return templateService.renderActivity(content);
      
      case '4': // avaliacao
        return templateService.renderAssessment(content);
      
      default:
        console.warn(`Template ID ${templateId} not found, using default HTML rendering`);
        return templateService.renderGeneric(content);
    }
  },

  renderLessonPlan: (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }

    // Handle lesson plan structure
    let html = '';
    
    if (content.titulo || content.tema) {
      html += `<div class="header-section">
        <h1>${content.titulo || content.tema}</h1>
      </div>`;
    }

    if (content.professor) {
      html += `<div class="section">
        <div class="section-title">Professor(a)</div>
        <div class="section-content">${content.professor}</div>
      </div>`;
    }

    if (content.disciplina) {
      html += `<div class="section">
        <div class="section-title">Disciplina</div>
        <div class="section-content">${content.disciplina}</div>
      </div>`;
    }

    if (content.objetivos && Array.isArray(content.objetivos)) {
      html += `<div class="section">
        <div class="section-title">Objetivos</div>
        <div class="section-content">
          <ul>
            ${content.objetivos.map((obj: string) => `<li>${obj}</li>`).join('')}
          </ul>
        </div>
      </div>`;
    }

    if (content.desenvolvimento && Array.isArray(content.desenvolvimento)) {
      html += `<div class="section">
        <div class="section-title">Desenvolvimento</div>
        <div class="section-content">`;
      
      content.desenvolvimento.forEach((item: any, index: number) => {
        if (typeof item === 'string') {
          html += `<p>${item}</p>`;
        } else if (item && typeof item === 'object') {
          html += `<div class="development-step">
            <h4>${item.etapa || `Etapa ${index + 1}`}</h4>
            ${item.atividade ? `<p><strong>Atividade:</strong> ${item.atividade}</p>` : ''}
            ${item.tempo ? `<p><strong>Tempo:</strong> ${item.tempo}</p>` : ''}
          </div>`;
        }
      });
      
      html += `</div></div>`;
    }

    if (content.recursos && Array.isArray(content.recursos)) {
      html += `<div class="section">
        <div class="section-title">Recursos</div>
        <div class="section-content">
          <ul>
            ${content.recursos.map((recurso: string) => `<li>${recurso}</li>`).join('')}
          </ul>
        </div>
      </div>`;
    }

    if (content.avaliacao) {
      html += `<div class="section">
        <div class="section-title">Avaliação</div>
        <div class="section-content">${content.avaliacao}</div>
      </div>`;
    }

    return html;
  },

  renderActivity: (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }

    let html = '';
    
    if (content.titulo) {
      html += `<div class="header-section">
        <h1>${content.titulo}</h1>
      </div>`;
    }

    if (content.instrucoes) {
      html += `<div class="instructions-section">
        <div class="instructions">${content.instrucoes}</div>
      </div>`;
    }

    if (content.questoes && Array.isArray(content.questoes)) {
      content.questoes.forEach((questao: any, index: number) => {
        html += `<div class="questao-container">
          <div class="questao-numero">Questão ${questao.numero || index + 1}</div>
          <div class="questao-enunciado">${questao.pergunta || questao.enunciado}</div>`;

        if (questao.opcoes && Array.isArray(questao.opcoes)) {
          html += `<div class="questao-opcoes">`;
          questao.opcoes.forEach((opcao: string, optIndex: number) => {
            const letra = String.fromCharCode(65 + optIndex);
            html += `<div class="opcao">
              <span class="opcao-letra">${letra})</span>
              <span class="opcao-texto">${opcao}</span>
            </div>`;
          });
          html += `</div>`;
        }

        // Handle different question types
        if (questao.tipo === 'dissertativa' || questao.tipo === 'aberta') {
          const linhas = questao.linhas || 3;
          for (let i = 0; i < linhas; i++) {
            html += `<div class="answer-lines"></div>`;
          }
        }

        if (questao.tipo === 'calculo' || questao.tipo === 'matematica') {
          html += `<div class="math-space">Espaço para cálculos</div>`;
        }

        html += `</div>`;
      });
    }

    return html;
  },

  renderAssessment: (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }

    let html = '';
    
    if (content.titulo) {
      html += `<div class="header-section">
        <h1>${content.titulo}</h1>
      </div>`;
    }

    if (content.instrucoes) {
      html += `<div class="instructions-section">
        <div class="instructions">${content.instrucoes}</div>
      </div>`;
    }

    if (content.questoes && Array.isArray(content.questoes)) {
      content.questoes.forEach((questao: any, index: number) => {
        html += `<div class="questao-container">
          <div class="questao-numero">Questão ${questao.numero || index + 1} ${questao.pontuacao ? `(${questao.pontuacao} pts)` : ''}</div>
          <div class="questao-enunciado">${questao.pergunta || questao.enunciado}</div>`;

        if (questao.opcoes && Array.isArray(questao.opcoes)) {
          html += `<div class="questao-opcoes">`;
          questao.opcoes.forEach((opcao: string, optIndex: number) => {
            const letra = String.fromCharCode(65 + optIndex);
            html += `<div class="opcao">
              <span class="opcao-letra">${letra})</span>
              <span class="opcao-texto">${opcao}</span>
            </div>`;
          });
          html += `</div>`;
        }

        // Handle different question types
        if (questao.tipo === 'dissertativa' || questao.tipo === 'aberta') {
          const linhas = questao.linhas || 5;
          for (let i = 0; i < linhas; i++) {
            html += `<div class="answer-lines"></div>`;
          }
        }

        if (questao.tipo === 'calculo' || questao.tipo === 'matematica') {
          html += `<div class="math-space">Espaço para cálculos</div>`;
        }

        html += `</div>`;
      });
    }

    return html;
  },

  renderGeneric: (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }
    
    // Fallback for unknown content types
    return JSON.stringify(content, null, 2);
  }
};
