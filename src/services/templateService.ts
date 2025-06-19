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
          <title>Plano de Aula</title>
          <style>
            @page {
              size: A4;
              margin: 3cm 2cm 2cm 3cm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.5;
              color: #000;
              background: white;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              background: white;
              padding: 3cm 2cm 2cm 3cm;
              box-sizing: border-box;
              position: relative;
            }
            .shape-circle {
              position: absolute;
              border-radius: 50%;
              opacity: 0.15;
              pointer-events: none;
            }
            .shape-circle.purple {
              width: 120px; height: 120px;
              background: #a78bfa;
              top: 20px; left: 20px;
            }
            .shape-circle.blue {
              width: 150px; height: 150px;
              background: #60a5fa;
              bottom: 20px; right: 20px;
            }
            h1 {
              text-align: center;
              margin: 0 0 30px 0;
              font-size: 18pt;
              font-weight: bold;
              color: #4f46e5;
              text-transform: uppercase;
            }
            h1::after {
              content: '';
              width: 80px;
              height: 3px;
              background: #a78bfa;
              display: block;
              margin: 10px auto 0;
              border-radius: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 11pt;
            }
            th, td {
              padding: 8px 12px;
              border: 1px solid #333;
              text-align: left;
              vertical-align: top;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #1f2937;
            }
            .section-title {
              font-weight: bold;
              margin: 25px 0 15px 0;
              font-size: 14pt;
              color: #4338ca;
              text-transform: uppercase;
            }
            ul {
              margin: 0 0 20px 20px;
              padding: 0;
            }
            li {
              margin-bottom: 8px;
              text-align: justify;
            }
            p {
              text-align: justify;
              margin-bottom: 12px;
            }
            .page-break {
              page-break-before: always;
            }
            @media print {
              body { margin: 0; padding: 0; background: white; }
              .page { box-shadow: none; margin: 0; padding: 3cm 2cm 2cm 3cm; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="shape-circle purple"></div>
            <div class="shape-circle blue"></div>

            <h1>Plano de Aula</h1>

            <table>
              <tr>
                <th style="width: 15%;">Professor(a):</th>
                <td style="width: 35%;">{{professor}}</td>
                <th style="width: 15%;">Data:</th>
                <td style="width: 35%;">{{data}}</td>
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

            <div class="section-title">Objetivos de Aprendizagem</div>
            <ul>
              {{#each objetivos}}
              <li>{{this}}</li>
              {{/each}}
            </ul>

            <div class="section-title">Habilidades BNCC</div>
            <ul>
              {{#each habilidades}}
              <li>{{this}}</li>
              {{/each}}
            </ul>

            <div class="section-title">Desenvolvimento Metodológico</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 20%;">Etapa</th>
                  <th style="width: 45%;">Atividade</th>
                  <th style="width: 15%;">Tempo</th>
                  <th style="width: 20%;">Recursos</th>
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

            <div class="section-title">Recursos Didáticos</div>
            <ul>
              {{#each recursos}}
              <li>{{this}}</li>
              {{/each}}
            </ul>

            <div class="section-title">Avaliação</div>
            <p>{{avaliacao}}</p>
          </div>
        </body>
        </html>
      `,
      variables: ['tema', 'professor', 'disciplina', 'serie', 'data', 'duracao', 'bncc', 'objetivos', 'habilidades', 'desenvolvimento', 'recursos', 'avaliacao'],
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
      name: 'Atividade ABNT',
      type: 'atividade',
      htmlContent: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Atividade</title>
          <style>
            @page {
              size: A4;
              margin: 3cm 2cm 2cm 3cm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.5;
              color: #000;
              background: white;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              background: white;
              padding: 3cm 2cm 2cm 3cm;
              box-sizing: border-box;
              position: relative;
            }
            .shape-circle {
              position: absolute;
              border-radius: 50%;
              opacity: 0.15;
              pointer-events: none;
            }
            .shape-circle.green {
              width: 120px; height: 120px;
              background: #10b981;
              top: 20px; left: 20px;
            }
            h1 {
              text-align: center;
              margin: 0 0 30px 0;
              font-size: 18pt;
              font-weight: bold;
              color: #059669;
              text-transform: uppercase;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .header-table th {
              background: #10b981;
              color: white;
              padding: 10px;
              font-weight: bold;
              text-align: center;
            }
            .header-table td {
              padding: 8px 12px;
              border: 1px solid #333;
            }
            .student-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .instructions {
              background: #f0fdf4;
              padding: 15px;
              border-left: 4px solid #10b981;
              margin-bottom: 30px;
              font-style: italic;
            }
            .question {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .question-header {
              font-weight: bold;
              color: #059669;
              margin-bottom: 10px;
              font-size: 13pt;
            }
            .question-text {
              margin-bottom: 15px;
              text-align: justify;
            }
            .options {
              margin-left: 20px;
            }
            .option {
              margin-bottom: 8px;
              display: flex;
              align-items: flex-start;
            }
            .option-letter {
              font-weight: bold;
              margin-right: 10px;
              color: #059669;
              min-width: 25px;
            }
            .answer-space {
              border-bottom: 1px solid #333;
              height: 40px;
              margin: 10px 0;
            }
            @media print {
              body { margin: 0; padding: 0; background: white; }
              .page { box-shadow: none; margin: 0; padding: 3cm 2cm 2cm 3cm; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="shape-circle green"></div>

            <h1>Atividade</h1>

            <table class="header-table">
              <tr>
                <th>Escola</th>
                <th>Disciplina</th>
                <th>Série/Ano</th>
              </tr>
              <tr>
                <td>_________________________________</td>
                <td style="text-align: center;">{{disciplina}}</td>
                <td style="text-align: center;">{{serie}}</td>
              </tr>
            </table>

            <div style="margin-bottom: 20px;">
              <p><strong>Nome do Aluno(a):</strong> ____________________________________________</p>
            </div>

            <div class="instructions">
              <strong>{{titulo}}</strong><br>
              {{instrucoes}}
            </div>

            {{#each questoes}}
            <div class="question">
              <div class="question-header">Questão {{numero}}</div>
              <div class="question-text">{{pergunta}}</div>
              
              {{#if opcoes}}
              <div class="options">
                {{#each opcoes}}
                <div class="option">
                  <span class="option-letter">{{@letter}}</span>
                  <span>{{this}}</span>
                </div>
                {{/each}}
              </div>
              {{else}}
              <div class="answer-space"></div>
              <div class="answer-space"></div>
              {{/if}}
            </div>
            {{/each}}
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
          <title>Avaliação</title>
          <style>
            @page {
              size: A4;
              margin: 3cm 2cm 2cm 3cm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.5;
              color: #000;
              background: white;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              background: white;
              padding: 3cm 2cm 2cm 3cm;
              box-sizing: border-box;
              position: relative;
            }
            h1 {
              text-align: center;
              margin: 0 0 30px 0;
              font-size: 18pt;
              font-weight: bold;
              color: #dc2626;
              text-transform: uppercase;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .header-table th {
              background: #dc2626;
              color: white;
              padding: 10px;
              font-weight: bold;
              text-align: center;
            }
            .header-table td {
              padding: 8px 12px;
              border: 1px solid #333;
            }
            .evaluation-info {
              background: #fef2f2;
              padding: 15px;
              border-left: 4px solid #dc2626;
              margin-bottom: 30px;
            }
            .question {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .question-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-weight: bold;
              color: #dc2626;
              margin-bottom: 10px;
              font-size: 13pt;
            }
            .points {
              background: #fef2f2;
              color: #dc2626;
              padding: 4px 8px;
              border: 1px solid #dc2626;
              border-radius: 4px;
              font-size: 10pt;
            }
            .question-text {
              margin-bottom: 15px;
              text-align: justify;
            }
            .options {
              margin-left: 20px;
            }
            .option {
              margin-bottom: 8px;
              display: flex;
              align-items: flex-start;
            }
            .option-letter {
              font-weight: bold;
              margin-right: 10px;
              color: #dc2626;
              min-width: 25px;
            }
            .answer-space {
              border: 1px solid #333;
              min-height: 60px;
              margin: 10px 0;
              padding: 10px;
            }
            @media print {
              body { margin: 0; padding: 0; background: white; }
              .page { box-shadow: none; margin: 0; padding: 3cm 2cm 2cm 3cm; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <h1>Avaliação</h1>

            <table class="header-table">
              <tr>
                <th colspan="3">{{titulo}}</th>
              </tr>
              <tr>
                <td><strong>Nome:</strong> _________________________________</td>
                <td><strong>Turma:</strong> _____________</td>
                <td><strong>Data:</strong> _____________</td>
              </tr>
            </table>

            <div class="evaluation-info">
              <p><strong>Instruções:</strong> {{instrucoes}}</p>
              <p><strong>Tempo Limite:</strong> {{tempoLimite}}</p>
            </div>

            {{#each questoes}}
            <div class="question">
              <div class="question-header">
                <span>Questão {{numero}}</span>
                <span class="points">({{pontuacao}} pontos)</span>
              </div>
              <div class="question-text">{{pergunta}}</div>
              
              {{#if opcoes}}
              <div class="options">
                {{#each opcoes}}
                <div class="option">
                  <span class="option-letter">{{@letter}}</span>
                  <span>{{this}}</span>
                </div>
                {{/each}}
              </div>
              {{else}}
              <div class="answer-space"></div>
              {{/if}}
            </div>
            {{/each}}
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

    // Simple template engine (substitui {{variavel}} pelo valor)
    let html = template.htmlContent;
    
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
