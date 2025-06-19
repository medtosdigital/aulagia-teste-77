
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
        <div class="a4-page">
          <div class="header">
            <h1>{{tema}}</h1>
            <div class="info-grid">
              <div class="info-item">
                <strong>Professor(a):</strong> {{professor}}
              </div>
              <div class="info-item">
                <strong>Disciplina:</strong> {{disciplina}}
              </div>
              <div class="info-item">
                <strong>Série/Ano:</strong> {{serie}}
              </div>
              <div class="info-item">
                <strong>Data:</strong> {{data}}
              </div>
              <div class="info-item">
                <strong>Duração:</strong> {{duracao}}
              </div>
              <div class="info-item">
                <strong>BNCC:</strong> {{bncc}}
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Objetivos de Aprendizagem</h2>
            <ul>
              {{#each objetivos}}
              <li>{{this}}</li>
              {{/each}}
            </ul>
          </div>
          
          <div class="section">
            <h2>Habilidades BNCC</h2>
            <ul>
              {{#each habilidades}}
              <li>{{this}}</li>
              {{/each}}
            </ul>
          </div>
          
          <div class="section">
            <h2>Desenvolvimento da Aula</h2>
            {{#each desenvolvimento}}
            <div class="etapa">
              <h3>{{etapa}} ({{tempo}})</h3>
              <p>{{atividade}}</p>
              <p><strong>Recursos:</strong> {{recursos}}</p>
            </div>
            {{/each}}
          </div>
          
          <div class="section">
            <h2>Recursos Necessários</h2>
            <ul>
              {{#each recursos}}
              <li>{{this}}</li>
              {{/each}}
            </ul>
          </div>
          
          <div class="section">
            <h2>Avaliação</h2>
            <p>{{avaliacao}}</p>
          </div>
        </div>
      `,
      variables: ['tema', 'professor', 'disciplina', 'serie', 'data', 'duracao', 'bncc', 'objetivos', 'habilidades', 'desenvolvimento', 'recursos', 'avaliacao'],
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
