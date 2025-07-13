

// Função para renderizar questões em templates HTML
export function renderQuestions(questoes: any[]): string {
  if (!Array.isArray(questoes) || questoes.length === 0) {
    return '<div class="text-center text-gray-500 p-4">Nenhuma questão disponível</div>';
  }

  return questoes.map((questao, index) => {
    // Garantir que temos um enunciado válido
    const enunciado = questao.enunciado || questao.pergunta || `Questão ${index + 1}`;
    const numero = questao.numero || (index + 1);
    const tipo = questao.tipo || 'multipla_escolha';

    let questionHtml = `
      <div class="question-item mb-6 p-4 border border-gray-200 rounded-lg">
        <div class="question-header mb-3">
          <h3 class="font-semibold text-lg text-gray-800">Questão ${numero}</h3>
          <span class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">${tipo.replace('_', ' ')}</span>
        </div>
        <div class="question-content">
          <p class="question-text mb-3 text-gray-700">${enunciado}</p>`;

    // Renderizar conteúdo específico por tipo de questão
    switch (tipo) {
      case 'multipla_escolha':
        if (questao.opcoes && Array.isArray(questao.opcoes)) {
          questionHtml += '<div class="options-list ml-4">';
          questao.opcoes.forEach((opcao: string, idx: number) => {
            const letra = String.fromCharCode(97 + idx).toUpperCase();
            questionHtml += `<div class="option-item mb-2">
              <span class="font-medium">${letra})</span> ${opcao}
            </div>`;
          });
          questionHtml += '</div>';
        }
        break;

      case 'verdadeiro_falso':
        questionHtml += `
          <div class="tf-options ml-4">
            <div class="option-item mb-2">( ) Verdadeiro</div>
            <div class="option-item mb-2">( ) Falso</div>
          </div>`;
        break;

      case 'ligar':
        if (questao.coluna_a && questao.coluna_b) {
          questionHtml += '<div class="columns-container grid grid-cols-2 gap-4 ml-4">';
          questionHtml += '<div class="column-a"><h4 class="font-medium mb-2">Coluna A:</h4>';
          questao.coluna_a.forEach((item: string, idx: number) => {
            questionHtml += `<div class="column-item mb-1">${idx + 1}. ${item}</div>`;
          });
          questionHtml += '</div>';
          questionHtml += '<div class="column-b"><h4 class="font-medium mb-2">Coluna B:</h4>';
          questao.coluna_b.forEach((item: string, idx: number) => {
            const letra = String.fromCharCode(97 + idx);
            questionHtml += `<div class="column-item mb-1">${letra}. ${item}</div>`;
          });
          questionHtml += '</div></div>';
        }
        break;

      case 'completar':
        if (questao.textoComLacunas) {
          questionHtml += `<div class="completion-text ml-4">${questao.textoComLacunas}</div>`;
        } else {
          questionHtml += '<div class="completion-space ml-4 border-b border-gray-400" style="min-height: 20px; width: 200px;"></div>';
        }
        break;

      case 'dissertativa':
        const linhas = questao.linhasResposta || 5;
        questionHtml += '<div class="essay-space ml-4">';
        for (let i = 0; i < linhas; i++) {
          questionHtml += '<div class="answer-line border-b border-gray-300 mb-2" style="height: 24px;"></div>';
        }
        questionHtml += '</div>';
        break;

      case 'desenho':
        questionHtml += '<div class="drawing-space ml-4 border-2 border-dashed border-gray-300 rounded" style="height: 150px; display: flex; align-items: center; justify-content: center; color: #9CA3AF;">Espaço para desenho</div>';
        break;

      default:
        questionHtml += '<div class="unknown-question-type ml-4 text-red-500">Tipo de questão não reconhecido</div>';
    }

    // Adicionar resposta correta se disponível
    if (questao.resposta_correta) {
      questionHtml += `
        <div class="answer-section mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
          <strong>Resposta:</strong> ${questao.resposta_correta}
        </div>`;
    }

    // Adicionar explicação se disponível
    if (questao.explicacao) {
      questionHtml += `
        <div class="explanation-section mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
          <strong>Explicação:</strong> ${questao.explicacao}
        </div>`;
    }

    questionHtml += '</div></div>';
    return questionHtml;
  }).join('');
}

// Função auxiliar para validar estrutura de questão
export function validateQuestionStructure(questao: any): boolean {
  if (!questao || typeof questao !== 'object') return false;
  
  // Deve ter pelo menos um enunciado
  if (!questao.enunciado && !questao.pergunta) return false;
  
  // Validações específicas por tipo
  switch (questao.tipo) {
    case 'multipla_escolha':
      return Array.isArray(questao.opcoes) && questao.opcoes.length >= 2;
    case 'ligar':
      return Array.isArray(questao.coluna_a) && Array.isArray(questao.coluna_b) &&
             questao.coluna_a.length > 0 && questao.coluna_b.length > 0;
    case 'verdadeiro_falso':
    case 'completar':
    case 'dissertativa':
    case 'desenho':
      return true;
    default:
      return false;
  }
}

// Função para normalizar questões
export function normalizeQuestion(questao: any, index: number): any {
  const normalized = {
    numero: questao.numero || (index + 1),
    tipo: questao.tipo || 'multipla_escolha',
    enunciado: questao.enunciado || questao.pergunta || `Questão ${index + 1}`,
    pergunta: questao.pergunta || questao.enunciado || `Questão ${index + 1}`,
    resposta_correta: questao.resposta_correta || '',
    explicacao: questao.explicacao || '',
    opcoes: [],
    coluna_a: [],
    coluna_b: [],
    textoComLacunas: '',
    linhasResposta: 5
  };

  // Configurar campos específicos por tipo
  switch (normalized.tipo) {
    case 'multipla_escolha':
      normalized.opcoes = Array.isArray(questao.opcoes) ? questao.opcoes : [
        'Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'
      ];
      break;
    case 'ligar':
      normalized.coluna_a = Array.isArray(questao.coluna_a) ? questao.coluna_a : ['Item A1', 'Item A2', 'Item A3', 'Item A4'];
      normalized.coluna_b = Array.isArray(questao.coluna_b) ? questao.coluna_b : ['Item B1', 'Item B2', 'Item B3', 'Item B4'];
      break;
    case 'completar':
      normalized.textoComLacunas = questao.textoComLacunas || questao.enunciado || '';
      break;
    case 'dissertativa':
    case 'desenho':
      normalized.linhasResposta = questao.linhasResposta || 5;
      break;
    case 'verdadeiro_falso':
      normalized.opcoes = ['Verdadeiro', 'Falso'];
      break;
  }

  return normalized;
}

// Template básico para renderização de materiais
const renderTemplate = (templateId: string, content: any): string => {
  console.log('renderTemplate called with:', { templateId, content });
  
  try {
    switch (templateId) {
      case '1': // Plano de aula
        return renderLessonPlan(content);
      case '2': // Slides
        return renderSlides(content);
      case '3': // Atividade
        return renderActivity(content);
      case '4': // Avaliação
        return renderAssessment(content);
      default:
        return '<div>Template não encontrado</div>';
    }
  } catch (error) {
    console.error('Erro na renderização do template:', error);
    return '<div>Erro ao renderizar conteúdo</div>';
  }
};

// Função para renderizar plano de aula
const renderLessonPlan = (content: any): string => {
  if (!content) return '<div>Conteúdo não disponível</div>';
  
  let html = '<div class="lesson-plan">';
  
  if (content.titulo) {
    html += `<h1>${content.titulo}</h1>`;
  }
  
  if (content.objetivos) {
    html += '<h2>Objetivos</h2>';
    if (Array.isArray(content.objetivos)) {
      html += '<ul>';
      content.objetivos.forEach((objetivo: string) => {
        html += `<li>${objetivo}</li>`;
      });
      html += '</ul>';
    } else {
      html += `<p>${content.objetivos}</p>`;
    }
  }
  
  if (content.desenvolvimento) {
    html += '<h2>Desenvolvimento</h2>';
    if (Array.isArray(content.desenvolvimento)) {
      content.desenvolvimento.forEach((etapa: any) => {
        if (typeof etapa === 'string') {
          html += `<p>${etapa}</p>`;
        } else if (etapa.etapa) {
          html += `<h3>${etapa.etapa}</h3>`;
          if (etapa.atividade) html += `<p>${etapa.atividade}</p>`;
          if (etapa.tempo) html += `<p><strong>Tempo:</strong> ${etapa.tempo}</p>`;
        }
      });
    } else {
      html += `<p>${content.desenvolvimento}</p>`;
    }
  }
  
  if (content.recursos) {
    html += '<h2>Recursos</h2>';
    if (Array.isArray(content.recursos)) {
      html += '<ul>';
      content.recursos.forEach((recurso: string) => {
        html += `<li>${recurso}</li>`;
      });
      html += '</ul>';
    } else {
      html += `<p>${content.recursos}</p>`;
    }
  }
  
  if (content.avaliacao) {
    html += '<h2>Avaliação</h2>';
    html += `<p>${content.avaliacao}</p>`;
  }
  
  html += '</div>';
  return html;
};

// Função para renderizar slides
const renderSlides = (content: any): string => {
  if (!content || !Array.isArray(content)) return '<div>Slides não disponíveis</div>';
  
  let html = '<div class="slides">';
  content.forEach((slide: any, index: number) => {
    html += `<div class="slide" data-slide="${index + 1}">`;
    if (slide.titulo) {
      html += `<h2>${slide.titulo}</h2>`;
    }
    if (slide.conteudo) {
      if (Array.isArray(slide.conteudo)) {
        html += '<ul>';
        slide.conteudo.forEach((item: string) => {
          html += `<li>${item}</li>`;
        });
        html += '</ul>';
      } else {
        html += `<p>${slide.conteudo}</p>`;
      }
    }
    html += '</div>';
  });
  html += '</div>';
  return html;
};

// Função para renderizar atividade
const renderActivity = (content: any): string => {
  if (!content) return '<div>Atividade não disponível</div>';
  
  let html = '<div class="activity">';
  
  if (content.titulo) {
    html += `<h1>${content.titulo}</h1>`;
  }
  
  if (content.instrucoes) {
    html += `<div class="instructions">${content.instrucoes}</div>`;
  }
  
  if (content.questoes && Array.isArray(content.questoes)) {
    html += renderQuestions(content.questoes);
  }
  
  html += '</div>';
  return html;
};

// Função para renderizar avaliação
const renderAssessment = (content: any): string => {
  if (!content) return '<div>Avaliação não disponível</div>';
  
  let html = '<div class="assessment">';
  
  if (content.titulo) {
    html += `<h1>${content.titulo}</h1>`;
  }
  
  if (content.instrucoes) {
    html += `<div class="instructions">${content.instrucoes}</div>`;
  }
  
  if (content.questoes && Array.isArray(content.questoes)) {
    html += renderQuestions(content.questoes);
  }
  
  html += '</div>';
  return html;
};

// Função para obter template
const getTemplate = (templateId: string): any => {
  return {
    id: templateId,
    name: `Template ${templateId}`,
    render: (content: any) => renderTemplate(templateId, content)
  };
};

// Exportar o objeto templateService
export const templateService = {
  renderTemplate,
  getTemplate,
  renderQuestions,
  validateQuestionStructure,
  normalizeQuestion
};

// Exportação padrão
export default templateService;

