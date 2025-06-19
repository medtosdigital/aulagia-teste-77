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
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: #f0f4f8;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .page {
              position: relative;
              width: 210mm;
              height: 297mm;
              background: white;
              border-radius: 6px;
              overflow: hidden;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
              margin: 20px 0;
            }
            .shape-circle {
              position: absolute;
              border-radius: 50%;
              opacity: 0.25;
              pointer-events: none;
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
            .container {
              position: relative;
              width: 100%;
              height: 100%;
              padding: 20mm 15mm;
              box-sizing: border-box;
              z-index: 1;
            }
            .header {
              margin-bottom: 15px;
            }
            .header .texts h1 {
              font-size: 1.4rem;
              color: #6b21a8;
            }
            .header .texts p {
              font-size: 0.8rem;
              color: #374151;
            }
            h2 {
              text-align: center;
              margin: 10px 0 18px;
              font-size: 1.5rem;
              color: #4f46e5;
              position: relative;
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
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 18px;
            }
            th, td {
              padding: 6px 10px;
              font-size: 0.85rem;
            }
            th {
              background: #f3f4f6;
              color: #1f2937;
              font-weight: 600;
            }
            td {
              background: #ffffff;
              border-bottom: 1px solid #e5e7eb;
            }
            .section-title {
              font-weight: 600;
              margin-top: 18px;
              margin-bottom: 8px;
              font-size: 1.0rem;
              color: #4338ca;
            }
            ul {
              list-style: disc inside;
              margin-bottom: 16px;
              line-height: 1.4;
              font-size: 0.9rem;
            }
            .section-content {
              margin-bottom: 16px;
              line-height: 1.4;
              font-size: 0.9rem;
            }
            footer {
              position: absolute;
              bottom: 15mm;
              left: 15mm;
              right: 15mm;
              text-align: center;
              font-size: 0.7rem;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              padding-top: 4px;
            }
            @media print {
              body {
                background: white;
              }
              .page {
                box-shadow: none;
                border-radius: 0;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="shape-circle purple"></div>
            <div class="shape-circle blue"></div>

            <div class="container">
              <!-- Cabeçalho -->
              <div class="header">
                <div class="texts">
                  <h1>Aula Mágica</h1>
                  <p>Desenvolvido por Ditadinho KIDS</p>
                </div>
              </div>

              <h2>PLANO DE AULA</h2>

              <table>
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

              <div class="section-title">OBJETIVOS DE APRENDIZAGEM</div>
              <ul>
                {{#each objetivos}}
                <li>{{this}}</li>
                {{/each}}
              </ul>

              <div class="section-title">DESENVOLVIMENTO METODOLÓGICO</div>
              <table>
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

              <div class="section-title">RECURSOS DIDÁTICOS</div>
              <div class="section-content">
                {{#each recursos}}
                • {{this}}<br>
                {{/each}}
              </div>

              <div class="section-title">AVALIAÇÃO</div>
              <div class="section-content">{{avaliacao}}</div>
            </div>

            <footer>
              Plano de aula gerado pela AulagIA em {{dataGeracao}}
            </footer>
          </div>
        </body>
        </html>
      `,
      variables: ['tema', 'professor', 'disciplina', 'serie', 'data', 'duracao', 'bncc', 'objetivos', 'desenvolvimento', 'recursos', 'avaliacao', 'dataGeracao'],
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
