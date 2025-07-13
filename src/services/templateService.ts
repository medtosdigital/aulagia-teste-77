
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
      <div class="mb-6">
        <div class="mb-2">
          <span class="font-bold text-gray-800">Questão ${numero}</span>
        </div>
        <div class="mb-3">
          <p class="text-gray-700">${enunciado}</p>
        </div>`;

    // Renderizar conteúdo específico por tipo de questão
    switch (tipo) {
      case 'multipla_escolha':
        if (questao.opcoes && Array.isArray(questao.opcoes)) {
          questionHtml += '<div class="ml-4 space-y-1">';
          questao.opcoes.forEach((opcao: string, idx: number) => {
            const letra = String.fromCharCode(97 + idx).toUpperCase();
            questionHtml += `<div class="flex items-start">
              <span class="font-medium mr-2">${letra})</span>
              <span>${opcao}</span>
            </div>`;
          });
          questionHtml += '</div>';
        }
        break;

      case 'verdadeiro_falso':
        questionHtml += `
          <div class="ml-4 space-y-2">
            <div class="flex items-center">
              <span class="mr-2">( )</span>
              <span>Verdadeiro</span>
            </div>
            <div class="flex items-center">
              <span class="mr-2">( )</span>
              <span>Falso</span>
            </div>
          </div>`;
        break;

      case 'ligar':
        if (questao.coluna_a && questao.coluna_b) {
          questionHtml += '<div class="ml-4 grid grid-cols-2 gap-8">';
          questionHtml += '<div><h4 class="font-medium mb-2">Coluna A:</h4>';
          questao.coluna_a.forEach((item: string, idx: number) => {
            questionHtml += `<div class="mb-1">${idx + 1}. ${item}</div>`;
          });
          questionHtml += '</div>';
          questionHtml += '<div><h4 class="font-medium mb-2">Coluna B:</h4>';
          questao.coluna_b.forEach((item: string, idx: number) => {
            const letra = String.fromCharCode(97 + idx);
            questionHtml += `<div class="mb-1">${letra}. ${item}</div>`;
          });
          questionHtml += '</div></div>';
        }
        break;

      case 'completar':
        if (questao.textoComLacunas) {
          questionHtml += `<div class="ml-4">${questao.textoComLacunas}</div>`;
        } else {
          questionHtml += '<div class="ml-4"><div class="border-b border-gray-400 inline-block" style="min-width: 200px; height: 20px;"></div></div>';
        }
        break;

      case 'dissertativa':
        const linhas = questao.linhasResposta || 5;
        questionHtml += '<div class="ml-4">';
        for (let i = 0; i < linhas; i++) {
          questionHtml += '<div class="border-b border-gray-300 mb-3" style="height: 24px;"></div>';
        }
        questionHtml += '</div>';
        break;

      case 'desenho':
        questionHtml += '<div class="ml-4"><div class="border-2 border-dashed border-gray-300 rounded p-8 text-center text-gray-500" style="height: 150px; display: flex; align-items: center; justify-content: center;">Espaço para desenho</div></div>';
        break;

      default:
        questionHtml += '<div class="ml-4 text-red-500">Tipo de questão não reconhecido</div>';
    }

    questionHtml += '</div>';
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
  return {
    numero: questao.numero || (index + 1),
    tipo: questao.tipo || 'multipla_escolha',
    enunciado: questao.enunciado || questao.pergunta || `Questão ${index + 1}`,
    pergunta: questao.pergunta || questao.enunciado || `Questão ${index + 1}`,
    opcoes: questao.opcoes || [],
    coluna_a: questao.coluna_a || [],
    coluna_b: questao.coluna_b || [],
    textoComLacunas: questao.textoComLacunas || '',
    linhasResposta: questao.linhasResposta || 5
  };
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
  
  let html = `
    <div class="max-w-4xl mx-auto p-8 bg-white">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">${content.titulo || 'Plano de Aula'}</h1>
        <div class="text-sm text-gray-600">
          <span>Professor: ${content.professor || ''}</span> | 
          <span>Disciplina: ${content.disciplina || ''}</span> | 
          <span>Série: ${content.serie || ''}</span>
        </div>
      </div>`;
  
  if (content.objetivos) {
    html += `
      <div class="mb-6">
        <h2 class="text-xl font-bold text-blue-600 mb-3">OBJETIVOS</h2>
        <ul class="list-disc list-inside space-y-1">`;
    
    if (Array.isArray(content.objetivos)) {
      content.objetivos.forEach((objetivo: string) => {
        html += `<li class="text-gray-700">${objetivo}</li>`;
      });
    } else {
      html += `<li class="text-gray-700">${content.objetivos}</li>`;
    }
    
    html += '</ul></div>';
  }
  
  if (content.desenvolvimento) {
    html += `
      <div class="mb-6">
        <h2 class="text-xl font-bold text-blue-600 mb-3">DESENVOLVIMENTO</h2>`;
    
    if (Array.isArray(content.desenvolvimento)) {
      content.desenvolvimento.forEach((etapa: any) => {
        if (typeof etapa === 'string') {
          html += `<p class="mb-2 text-gray-700">${etapa}</p>`;
        } else if (etapa.etapa) {
          html += `
            <div class="mb-4 p-3 border-l-4 border-blue-300 bg-blue-50">
              <h3 class="font-bold text-gray-800">${etapa.etapa}</h3>
              ${etapa.atividade ? `<p class="text-gray-700 mt-1">${etapa.atividade}</p>` : ''}
              ${etapa.tempo ? `<p class="text-sm text-blue-600 mt-1"><strong>Tempo:</strong> ${etapa.tempo}</p>` : ''}
            </div>`;
        }
      });
    } else {
      html += `<p class="text-gray-700">${content.desenvolvimento}</p>`;
    }
    
    html += '</div>';
  }
  
  if (content.recursos) {
    html += `
      <div class="mb-6">
        <h2 class="text-xl font-bold text-blue-600 mb-3">RECURSOS NECESSÁRIOS</h2>
        <ul class="list-disc list-inside space-y-1">`;
    
    if (Array.isArray(content.recursos)) {
      content.recursos.forEach((recurso: string) => {
        html += `<li class="text-gray-700">${recurso}</li>`;
      });
    } else {
      html += `<li class="text-gray-700">${content.recursos}</li>`;
    }
    
    html += '</ul></div>';
  }
  
  if (content.avaliacao) {
    html += `
      <div class="mb-6">
        <h2 class="text-xl font-bold text-blue-600 mb-3">AVALIAÇÃO</h2>
        <p class="text-gray-700">${content.avaliacao}</p>
      </div>`;
  }
  
  html += '</div>';
  return html;
};

// Função para renderizar slides
const renderSlides = (content: any): string => {
  if (!content || !Array.isArray(content)) return '<div>Slides não disponíveis</div>';
  
  let html = '<div class="space-y-8">';
  content.forEach((slide: any, index: number) => {
    html += `
      <div class="bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
        <div class="text-center mb-6">
          <div class="text-sm text-gray-500 mb-2">Slide ${index + 1}</div>
          <h2 class="text-2xl font-bold text-gray-800">${slide.titulo || `Slide ${index + 1}`}</h2>
        </div>`;
    
    if (slide.conteudo) {
      if (Array.isArray(slide.conteudo)) {
        html += '<ul class="space-y-2 text-lg">';
        slide.conteudo.forEach((item: string) => {
          html += `<li class="flex items-start"><span class="text-blue-500 mr-2">•</span><span>${item}</span></li>`;
        });
        html += '</ul>';
      } else {
        html += `<p class="text-lg text-gray-700">${slide.conteudo}</p>`;
      }
    }
    
    html += '</div>';
  });
  html += '</div>';
  return html;
};

// Função para renderizar atividade (SEM respostas e explicações)
const renderActivity = (content: any): string => {
  if (!content) return '<div>Atividade não disponível</div>';
  
  let html = `
    <div class="max-w-4xl mx-auto p-8 bg-white">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">${content.titulo || 'Atividade Prática'}</h1>
      </div>`;
  
  if (content.instrucoes) {
    html += `
      <div class="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400">
        <p class="text-gray-700">${content.instrucoes}</p>
      </div>`;
  }
  
  if (content.questoes && Array.isArray(content.questoes)) {
    html += renderQuestions(content.questoes);
  }
  
  html += '</div>';
  return html;
};

// Função para renderizar avaliação (COM respostas apenas se especificado)
const renderAssessment = (content: any): string => {
  if (!content) return '<div>Avaliação não disponível</div>';
  
  let html = `
    <div class="max-w-4xl mx-auto p-8 bg-white">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">${content.titulo || 'Avaliação'}</h1>
      </div>`;
  
  if (content.instrucoes) {
    html += `
      <div class="mb-8 p-4 bg-purple-50 border-l-4 border-purple-400">
        <p class="text-gray-700">${content.instrucoes}</p>
      </div>`;
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
