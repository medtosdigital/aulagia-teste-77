import { LessonPlan, Activity, Slide, Assessment } from './materialService';

export interface Template {
  id: string;
  name: string;
  type: string;
  content: string;
}

class TemplateService {
  private templates: Template[] = [
    {
      id: '1',
      name: 'Plano de Aula Padrão',
      type: 'plano-de-aula',
      content: `
        <div class="lesson-plan">
          <div class="header-section">
            <h2>{{title}}</h2>
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
                <th>Modalidade:</th>
                <td>{{modalidade}}</td>
              </tr>
            </table>
          </div>
          
          {{#if objetivos}}
          <div class="section">
            <div class="section-title">🎯 Objetivos de Aprendizagem</div>
            <div class="section-content">
              {{#each objetivos}}
              <div class="objective-item">• {{this}}</div>
              {{/each}}
            </div>
          </div>
          {{/if}}
          
          {{#if conteudos}}
          <div class="section">
            <div class="section-title">📚 Conteúdos</div>
            <div class="section-content">
              {{#each conteudos}}
              <div class="content-item">• {{this}}</div>
              {{/each}}
            </div>
          </div>
          {{/if}}
          
          {{#if metodologia}}
          <div class="section">
            <div class="section-title">🔄 Metodologia</div>
            <div class="section-content">{{metodologia}}</div>
          </div>
          {{/if}}
          
          {{#if desenvolvimento}}
          <div class="section">
            <div class="section-title">⚡ Desenvolvimento</div>
            <div class="section-content">
              {{#each desenvolvimento}}
              <div class="development-step">
                {{#if this.etapa}}<strong>{{this.etapa}}:</strong>{{/if}}
                {{#if this.atividade}}{{this.atividade}}{{/if}}
                {{#if this.tempo}}<em>({{this.tempo}})</em>{{/if}}
              </div>
              {{/each}}
            </div>
          </div>
          {{/if}}
          
          {{#if recursos}}
          <div class="section">
            <div class="section-title">🛠️ Recursos</div>
            <div class="section-content">
              {{#each recursos}}
              <div class="resource-item">• {{this}}</div>
              {{/each}}
            </div>
          </div>
          {{/if}}
          
          {{#if avaliacao}}
          <div class="section">
            <div class="section-title">📊 Avaliação</div>
            <div class="section-content">{{avaliacao}}</div>
          </div>
          {{/if}}
          
          {{#if referencias}}
          <div class="section">
            <div class="section-title">📖 Referências</div>
            <div class="section-content">
              {{#each referencias}}
              <div class="reference-item">• {{this}}</div>
              {{/each}}
            </div>
          </div>
          {{/if}}
          
          <div class="footer">
            Plano de aula gerado pela AulagIA - Sua aula com toque mágico em {{currentDate}} • aulagia.com.br
          </div>
        </div>
      `
    },
    {
      id: '2',
      name: 'Template de Slides',
      type: 'slides',
      content: `
        <div class="slides-container">
          {{#each slides}}
          <div class="slide" data-slide="{{@index}}">
            <div class="slide-number">{{numero}}</div>
            <div class="text-content">
              <div class="title">{{titulo}}</div>
              <div class="content">
                {{#each conteudo}}
                <div class="content-item">{{this}}</div>
                {{/each}}
              </div>
            </div>
          </div>
          {{/each}}
        </div>
      `
    },
    {
      id: '3',
      name: 'Template de Atividade',
      type: 'atividade',
      content: `
        <div class="activity">
          <div class="header-section">
            <h2>ATIVIDADE</h2>
            <table>
              <tr>
                <th>Escola:</th>
                <td>_________________________________</td>
                <th>Data:</th>
                <td>{{currentDate}}</td>
              </tr>
              <tr>
                <th>Disciplina:</th>
                <td>{{disciplina}}</td>
                <th>Série/Ano:</th>
                <td>{{serie}}</td>
              </tr>
              <tr>
                <th>Aluno(a):</th>
                <td class="student-info-cell">____________________________________________</td>
                <th>BNCC:</th>
                <td class="student-info-cell">{{bncc}}</td>
              </tr>
            </table>
          </div>
          
          {{#if instrucoes}}
          <div class="instructions-section">
            <div class="instructions">
              <strong>{{title}}:</strong><br>
              {{instrucoes}}
            </div>
          </div>
          {{/if}}
          
          <div class="questions-section">
            {{#each questoes}}
            <div class="questao-container">
              <div class="questao-numero">{{numero}}.</div>
              <div class="questao-enunciado">{{pergunta}}</div>
              {{#if opcoes}}
              <div class="questao-opcoes">
                {{#each opcoes}}
                <div class="opcao">
                  <span class="opcao-letra">{{getLetter @index}})</span>
                  <span class="opcao-texto">{{this}}</span>
                </div>
                {{/each}}
              </div>
              {{/if}}
            </div>
            {{/each}}
          </div>
        </div>
      `
    },
    {
      id: '4',
      name: 'Template de Avaliação',
      type: 'avaliacao',
      content: `
        <div class="assessment">
          <div class="header-section">
            <h2>AVALIAÇÃO</h2>
            <table>
              <tr>
                <th>Escola:</th>
                <td>_________________________________</td>
                <th>Data:</th>
                <td>{{currentDate}}</td>
              </tr>
              <tr>
                <th>Disciplina:</th>
                <td>{{disciplina}}</td>
                <th>Série/Ano:</th>
                <td>{{serie}}</td>
              </tr>
              <tr>
                <th>Aluno(a):</th>
                <td class="student-info-cell">____________________________________________</td>
                <th>NOTA:</th>
                <td class="student-info-cell nota-highlight-cell"></td>
              </tr>
            </table>
          </div>
          
          {{#if instrucoes}}
          <div class="instructions-section">
            <div class="instructions">
              <strong>{{title}}:</strong><br>
              {{instrucoes}}
            </div>
          </div>
          {{/if}}
          
          <div class="questions-section">
            {{#each questoes}}
            <div class="questao-container">
              <div class="questao-numero">{{numero}}.</div>
              <div class="questao-enunciado">{{pergunta}}</div>
              {{#if opcoes}}
              <div class="questao-opcoes">
                {{#each opcoes}}
                <div class="opcao">
                  <span class="opcao-letra">{{getLetter @index}})</span>
                  <span class="opcao-texto">{{this}}</span>
                </div>
                {{/each}}
              </div>
              {{/if}}
            </div>
            {{/each}}
          </div>
        </div>
      `
    }
  ];

  getTemplate(id: string): Template | undefined {
    return this.templates.find(template => template.id === id);
  }

  getAllTemplates(): Template[] {
    return this.templates;
  }

  getTemplates(): Template[] {
    return this.getAllTemplates();
  }

  generateSlidesData(formData: any): any {
    const slides = [
      {
        numero: 1,
        titulo: `Introdução a ${formData.tema}`,
        conteudo: [
          `Bem-vindos à aula sobre ${formData.tema}`,
          `Objetivos da aula`,
          `O que vamos aprender hoje`
        ]
      },
      {
        numero: 2,
        titulo: `Conceitos Fundamentais`,
        conteudo: [
          `Definição de ${formData.tema}`,
          `Principais características`,
          `Importância no contexto de ${formData.disciplina}`
        ]
      },
      {
        numero: 3,
        titulo: `Aplicações Práticas`,
        conteudo: [
          `Como ${formData.tema} é usado no dia a dia`,
          `Exemplos práticos`,
          `Exercícios e atividades`
        ]
      },
      {
        numero: 4,
        titulo: `Conclusão`,
        conteudo: [
          `Resumo dos pontos principais`,
          `Próximos passos`,
          `Perguntas e discussão`
        ]
      }
    ];

    return {
      titulo: `Slides sobre ${formData.tema}`,
      serie: formData.serie,
      disciplina: formData.disciplina,
      slides: slides
    };
  }

  renderTemplate(templateId: string, data: any): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template com ID ${templateId} não encontrado`);
    }

    let rendered = template.content;
    const currentDate = new Date().toLocaleDateString('pt-BR');

    // Substituir variáveis simples
    rendered = rendered.replace(/\{\{currentDate\}\}/g, currentDate);
    rendered = rendered.replace(/\{\{title\}\}/g, data.title || '');
    rendered = rendered.replace(/\{\{professor\}\}/g, data.professor || '');
    rendered = rendered.replace(/\{\{data\}\}/g, data.data || currentDate);
    rendered = rendered.replace(/\{\{disciplina\}\}/g, data.disciplina || data.subject || '');
    rendered = rendered.replace(/\{\{serie\}\}/g, data.serie || data.grade || '');
    rendered = rendered.replace(/\{\{tema\}\}/g, data.tema || '');
    rendered = rendered.replace(/\{\{duracao\}\}/g, data.duracao || '');
    rendered = rendered.replace(/\{\{modalidade\}\}/g, data.modalidade || '');
    rendered = rendered.replace(/\{\{metodologia\}\}/g, data.metodologia || '');
    rendered = rendered.replace(/\{\{avaliacao\}\}/g, data.avaliacao || '');
    rendered = rendered.replace(/\{\{instrucoes\}\}/g, data.instrucoes || '');
    rendered = rendered.replace(/\{\{tempoLimite\}\}/g, data.tempoLimite || '');
    rendered = rendered.replace(/\{\{bncc\}\}/g, data.bncc || '{{Código da BNCC}}');

    // Processar condicionais e loops
    rendered = this.processConditionals(rendered, data);
    rendered = this.processLoops(rendered, data);

    return rendered;
  }

  private processConditionals(template: string, data: any): string {
    // Processar {{#if condition}}...{{/if}}
    const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    return template.replace(ifRegex, (match, condition, content) => {
      const value = data[condition];
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        return content;
      }
      return '';
    });
  }

  private processLoops(template: string, data: any): string {
    // Processar {{#each array}}...{{/each}}
    const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    return template.replace(eachRegex, (match, arrayName, content) => {
      const array = data[arrayName];
      if (!Array.isArray(array)) return '';

      return array.map((item, index) => {
        let itemContent = content;
        
        // Substituir {{this}} pelo item atual
        itemContent = itemContent.replace(/\{\{this\}\}/g, typeof item === 'string' ? item : '');
        
        // Substituir {{@index}} pelo índice
        itemContent = itemContent.replace(/\{\{@index\}\}/g, index.toString());
        
        // Substituir propriedades do objeto
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => {
            const regex = new RegExp(`\\{\\{this\\.${key}\\}\\}`, 'g');
            itemContent = itemContent.replace(regex, item[key] || '');
            
            // Também substituir sem o 'this.'
            const simpleRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            itemContent = itemContent.replace(simpleRegex, item[key] || '');
          });
        }
        
        // Função auxiliar para letras (A, B, C, D...)
        itemContent = itemContent.replace(/\{\{getLetter\s+@index\}\}/g, String.fromCharCode(65 + index));
        
        return itemContent;
      }).join('');
    });
  }

  updateTemplate(id: string, updatedTemplate: Partial<Template>): void {
    const index = this.templates.findIndex(template => template.id === id);
    if (index !== -1) {
      this.templates[index] = { ...this.templates[index], ...updatedTemplate };
    }
  }

  createTemplate(template: Omit<Template, 'id'>): string {
    const id = Date.now().toString();
    this.templates.push({ ...template, id });
    return id;
  }

  deleteTemplate(id: string): boolean {
    const initialLength = this.templates.length;
    this.templates = this.templates.filter(template => template.id !== id);
    return this.templates.length < initialLength;
  }
}

export const templateService = new TemplateService();
