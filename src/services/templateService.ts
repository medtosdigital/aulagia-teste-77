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
      name: 'Plano de Aula Padrão',
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
              margin: 3cm 2cm 2cm 2cm;
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
            .container {
              width: 100%;
              max-width: 100%;
            }
            h1 {
              text-align: center;
              font-size: 16pt;
              font-weight: bold;
              margin: 0 0 20pt 0;
              text-transform: uppercase;
            }
            h2 {
              font-size: 14pt;
              font-weight: bold;
              margin: 18pt 0 12pt 0;
              text-transform: uppercase;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 18pt;
            }
            th, td {
              border: 1px solid #000;
              padding: 8pt;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #f0f0f0;
              font-weight: bold;
            }
            ul {
              margin: 0 0 18pt 0;
              padding-left: 20pt;
            }
            li {
              margin-bottom: 6pt;
            }
            .section {
              margin-bottom: 18pt;
              page-break-inside: avoid;
            }
            .development-table {
              page-break-inside: auto;
            }
            .development-table tr {
              page-break-inside: avoid;
            }
            .footer {
              position: fixed;
              bottom: 1cm;
              left: 2cm;
              right: 2cm;
              text-align: center;
              font-size: 10pt;
              border-top: 1px solid #000;
              padding-top: 6pt;
            }
            @media print {
              body {
                background: white;
              }
              .page-break {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>PLANO DE AULA</h1>

            <div class="section">
              <table>
                <tr>
                  <th width="20%">Professor(a):</th>
                  <td width="30%">{{professor}}</td>
                  <th width="15%">Data:</th>
                  <td width="35%">{{data}}</td>
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
            </div>

            <div class="section">
              <h2>OBJETIVOS DE APRENDIZAGEM</h2>
              <ul>
                {{#each objetivos}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>

            <div class="section">
              <h2>HABILIDADES BNCC</h2>
              <ul>
                {{#each habilidades}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>

            <div class="section">
              <h2>DESENVOLVIMENTO METODOLÓGICO</h2>
              <table class="development-table">
                <thead>
                  <tr>
                    <th width="20%">Etapa</th>
                    <th width="40%">Atividade</th>
                    <th width="15%">Tempo</th>
                    <th width="25%">Recursos</th>
                  </tr>
                </thead>
                <tbody>
                  {{#each desenvolvimento}}
                  <tr>
                    <td><strong>{{etapa}}</strong></td>
                    <td>{{atividade}}</td>
                    <td>{{tempo}}</td>
                    <td>{{recursos}}</td>
                  </tr>
                  {{/each}}
                </tbody>
              </table>
            </div>

            <div class="section">
              <h2>RECURSOS DIDÁTICOS</h2>
              <ul>
                {{#each recursos}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>

            <div class="section">
              <h2>AVALIAÇÃO</h2>
              <p>{{avaliacao}}</p>
            </div>

            <div class="footer">
              Plano de aula gerado em {{dataGeracao}}
            </div>
          </div>
        </body>
        </html>
      `,
      variables: ['tema', 'professor', 'disciplina', 'serie', 'data', 'duracao', 'bncc', 'objetivos', 'habilidades', 'desenvolvimento', 'recursos', 'avaliacao', 'dataGeracao'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Slides Padrão',
      type: 'slides',
      htmlContent: `
        <div class="slides-container">
          {{#each slides}}
          <div class="slide slide-4-3">
            <div class="slide-header">
              <h1>{{titulo}}</h1>
              <span class="slide-number">{{numero}}</span>
            </div>
            <div class="slide-content">
              {{#each conteudo}}
              <div class="slide-item">{{this}}</div>
              {{/each}}
            </div>
          </div>
          {{/each}}
        </div>
      `,
      variables: ['slides'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Atividade Padrão',
      type: 'atividade',
      htmlContent: `
        <div class="a4-page">
          <div class="header">
            <h1>{{titulo}}</h1>
            <div class="instructions">
              <p>{{instrucoes}}</p>
            </div>
          </div>
          
          <div class="questions">
            {{#each questoes}}
            <div class="question">
              <div class="question-header">
                <h3>Questão {{numero}}</h3>
                <span class="question-type">{{tipo}}</span>
              </div>
              <p class="question-text">{{pergunta}}</p>
              {{#if opcoes}}
              <div class="options">
                {{#each opcoes}}
                <div class="option">
                  <span class="option-letter">{{@letter}}</span>
                  <span class="option-text">{{this}}</span>
                </div>
                {{/each}}
              </div>
              {{/if}}
            </div>
            {{/each}}
          </div>
        </div>
      `,
      variables: ['titulo', 'instrucoes', 'questoes'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Avaliação Padrão',
      type: 'avaliacao',
      htmlContent: `
        <div class="a4-page">
          <div class="header">
            <h1>{{titulo}}</h1>
            <div class="evaluation-info">
              <p><strong>Instruções:</strong> {{instrucoes}}</p>
              <p><strong>Tempo Limite:</strong> {{tempoLimite}}</p>
            </div>
          </div>
          
          <div class="questions">
            {{#each questoes}}
            <div class="question">
              <div class="question-header">
                <h3>Questão {{numero}}</h3>
                <span class="points">({{pontuacao}} pontos)</span>
                <span class="question-type">{{tipo}}</span>
              </div>
              <p class="question-text">{{pergunta}}</p>
              {{#if opcoes}}
              <div class="options">
                {{#each opcoes}}
                <div class="option">
                  <span class="option-letter">{{@letter}}</span>
                  <span class="option-text">{{this}}</span>
                </div>
                {{/each}}
              </div>
              {{/if}}
            </div>
            {{/each}}
          </div>
        </div>
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
        
        return itemHtml;
      }).join('');
    });

    return html;
  }
}

export const templateService = new TemplateService();
