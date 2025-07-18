
export interface ParsedQuestion {
  numero: number;
  tipo: 'multipla_escolha' | 'verdadeiro_falso' | 'completar' | 'ligar' | 'dissertativa' | 'desenho';
  enunciado: string;
  opcoes: string[];
  coluna_a?: string[];
  coluna_b?: string[];
  resposta_correta: string;
  explicacao?: string;
  dica_pedagogica?: string;
  valor?: string;
  criterios_correcao?: string;
  habilidade_avaliada?: string;
}

export interface QuestionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class QuestionParserService {
  /**
   * Validates and fixes question structure
   */
  static validateAndFixQuestion(question: any, index: number): ParsedQuestion {
    const validTypes = ['multipla_escolha', 'verdadeiro_falso', 'completar', 'ligar', 'dissertativa', 'desenho'];
    
    const parsedQuestion: ParsedQuestion = {
      numero: question.numero || (index + 1),
      tipo: validTypes.includes(question.tipo) ? question.tipo : 'multipla_escolha',
      enunciado: question.enunciado || `Questão ${index + 1} - aguardando conteúdo`,
      opcoes: [],
      resposta_correta: question.resposta_correta || '',
      explicacao: question.explicacao || '',
      dica_pedagogica: question.dica_pedagogica || ''
    };

    // Type-specific validation and fixes
    switch (parsedQuestion.tipo) {
      case 'multipla_escolha': {
        parsedQuestion.opcoes = this.validateMultipleChoice(question.opcoes);
        break;
      }
        
      case 'ligar':
        const { coluna_a, coluna_b } = this.validateMatching(question.coluna_a, question.coluna_b);
        parsedQuestion.coluna_a = coluna_a;
        parsedQuestion.coluna_b = coluna_b;
        parsedQuestion.opcoes = []; // Clear opcoes for matching
        break;
        
      case 'verdadeiro_falso':
        parsedQuestion.opcoes = Array.isArray(question.opcoes) ? question.opcoes : ['Verdadeiro', 'Falso'];
        break;
      case 'completar':
      case 'dissertativa':
      case 'desenho':
        parsedQuestion.opcoes = []; // These types don't use opcoes
        break;
    }

    // Add assessment-specific fields if present
    if (question.valor) parsedQuestion.valor = question.valor;
    if (question.criterios_correcao) parsedQuestion.criterios_correcao = question.criterios_correcao;
    if (question.habilidade_avaliada) parsedQuestion.habilidade_avaliada = question.habilidade_avaliada;

    return parsedQuestion;
  }

  /**
   * Validates multiple choice options
   */
  static validateMultipleChoice(opcoes: any): string[] {
    if (!Array.isArray(opcoes) || opcoes.length !== 4) {
      return [
        'Opção A - aguardando conteúdo',
        'Opção B - aguardando conteúdo',
        'Opção C - aguardando conteúdo',
        'Opção D - aguardando conteúdo'
      ];
    }
    
    return opcoes.map((opcao) => {
      // Remove prefixos como 'a)', 'b)', 'A)', 'B)', etc.
      let text = opcao?.toString().trim() || '';
      text = text.replace(/^([a-dA-D][\)\.\-])\s*/, '');
      return text;
    });
  }

  /**
   * Validates matching question columns
   */
  static validateMatching(coluna_a: any, coluna_b: any): { coluna_a: string[], coluna_b: string[] } {
    const defaultA = ['Item A1', 'Item A2', 'Item A3', 'Item A4'];
    const defaultB = ['Item B1', 'Item B2', 'Item B3', 'Item B4'];

    const validatedA = Array.isArray(coluna_a) && coluna_a.length === 4 
      ? coluna_a.map(item => item?.toString().trim() || 'Item - aguardando conteúdo')
      : defaultA;

    const validatedB = Array.isArray(coluna_b) && coluna_b.length === 4
      ? coluna_b.map(item => item?.toString().trim() || 'Item - aguardando conteúdo')
      : defaultB;

    return { coluna_a: validatedA, coluna_b: validatedB };
  }

  /**
   * Validates entire question set
   */
  static validateQuestionSet(questions: any[]): QuestionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(questions) || questions.length === 0) {
      errors.push('Nenhuma questão encontrada no material');
      return { isValid: false, errors, warnings };
    }

    // Check question distribution
    const typeCount = questions.reduce((acc, q) => {
      const tipo = q.tipo || 'multipla_escolha';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    // Validate individual questions
    questions.forEach((question, index) => {
      if (!question.enunciado || question.enunciado.trim() === '') {
        warnings.push(`Questão ${index + 1}: Enunciado vazio`);
      }

      if (question.tipo === 'multipla_escolha') {
        if (!Array.isArray(question.opcoes) || question.opcoes.length !== 4) {
          warnings.push(`Questão ${index + 1}: Múltipla escolha deve ter exatamente 4 alternativas`);
        }
      }

      if (question.tipo === 'ligar') {
        if (!Array.isArray(question.coluna_a) || question.coluna_a.length !== 4) {
          warnings.push(`Questão ${index + 1}: Questão de ligar deve ter 4 itens na coluna A`);
        }
        if (!Array.isArray(question.coluna_b) || question.coluna_b.length !== 4) {
          warnings.push(`Questão ${index + 1}: Questão de ligar deve ter 4 itens na coluna B`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generates balanced question types based on preferences
   */
  static generateBalancedQuestionTypes(totalQuestions: number, preferredTypes: string[]): string[] {
    const validTypes = ['multipla_escolha', 'verdadeiro_falso', 'completar', 'ligar', 'dissertativa', 'desenho'];
    const types = preferredTypes.filter(type => validTypes.includes(type));
    
    if (types.length === 0) {
      types.push('multipla_escolha', 'verdadeiro_falso', 'completar');
    }

    const result: string[] = [];
    const questionsPerType = Math.floor(totalQuestions / types.length);
    const remainder = totalQuestions % types.length;

    // Distribute questions evenly
    types.forEach((type, index) => {
      const count = questionsPerType + (index < remainder ? 1 : 0);
      for (let i = 0; i < count; i++) {
        result.push(type);
      }
    });

    // Shuffle the array to mix question types
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }
}
