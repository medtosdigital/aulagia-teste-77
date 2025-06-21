import { templateService } from './templateService';
import { GrammarService } from './grammarService';

export interface GeneratedMaterial {
  id: string;
  type: 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao';
  title: string;
  content: any;
  createdAt: string;
  formData: any;
  subject: string;
  grade: string;
}

export interface LessonPlan {
  professor: string;
  disciplina: string;
  tema: string;
  duracao: string;
  data: string;
  serie: string;
  bncc: string;
  objetivos: string[];
  habilidades: string[];
  desenvolvimento: {
    etapa: string;
    atividade: string;
    tempo: string;
    recursos: string;
  }[];
  recursos: string[];
  avaliacao: string;
}

export interface Activity {
  titulo: string;
  instrucoes: string;
  questoes: {
    numero: number;
    pergunta: string;
    tipo: 'multipla_escolha' | 'aberta' | 'verdadeiro_falso' | 'ligar' | 'completar' | 'desenho';
    opcoes?: string[];
    resposta?: string;
    colunaA?: string[];
    colunaB?: string[];
    textoComLacunas?: string;
    textoInterpretacao?: string;
    formula?: string;
    isCalculo?: boolean;
    linhasResposta?: number;
  }[];
}

export interface Slide {
  numero: number;
  titulo: string;
  conteudo: string[];
  imagem?: string;
}

export interface Assessment {
  titulo: string;
  instrucoes: string;
  questoes: {
    numero: number;
    pergunta: string;
    tipo: 'multipla_escolha' | 'dissertativa' | 'verdadeiro_falso' | 'ligar' | 'completar' | 'desenho';
    opcoes?: string[];
    pontuacao: number;
    colunaA?: string[];
    colunaB?: string[];
    textoComLacunas?: string;
    textoInterpretacao?: string;
    formula?: string;
    isCalculo?: boolean;
    linhasResposta?: number;
  }[];
  tempoLimite: string;
}

class MaterialService {
  private materials: GeneratedMaterial[] = [];

  async generateMaterial(type: string, formData: any): Promise<GeneratedMaterial> {
    // Simula chamada para API de IA
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Corrigir automaticamente o tema antes de gerar o material
    const correctedTopic = await GrammarService.correctText(formData.tema || formData.topic);

    // Atualizar formData com o tema corrigido
    const correctedFormData = {
      ...formData,
      tema: correctedTopic,
      topic: correctedTopic
    };

    console.log('Generating material with form data:', correctedFormData);

    let content: any;

    switch (type) {
      case 'plano-de-aula':
        content = this.generateLessonPlan(correctedFormData);
        break;
      case 'slides':
        content = this.generateSlides(correctedFormData);
        break;
      case 'atividade':
        content = this.generateActivity(correctedFormData);
        break;
      case 'avaliacao':
        content = this.generateEvaluation(correctedFormData);
        break;
      default:
        throw new Error('Tipo de material não suportado');
    }

    const material: GeneratedMaterial = {
      id: Date.now().toString(),
      type: type as any,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${correctedFormData.tema || correctedFormData.topic}`,
      content,
      createdAt: new Date().toISOString(),
      formData: correctedFormData,
      subject: correctedFormData.disciplina || correctedFormData.subject,
      grade: correctedFormData.serie || correctedFormData.grade
    };

    this.materials.push(material);
    return material;
  }

  private generateSlides(formData: any): any {
    // Gera dados estruturados para o template de slides educativos
    const slidesData = templateService.generateSlidesData(formData);
    
    return {
      titulo: slidesData.titulo,
      serie: slidesData.serie,
      disciplina: formData.disciplina,
      professor: formData.professor,
      tema: formData.tema,
      slides: slidesData.slides
    };
  }

  private generateLessonPlan(formData: any): any {
    return {
      tema: formData.tema,
      professor: formData.professor || 'Professor(a)',
      disciplina: formData.disciplina,
      serie: formData.serie,
      data: new Date().toLocaleDateString('pt-BR'),
      duracao: formData.duracao || '50 minutos',
      bncc: formData.bncc || 'EF03MA01, EF03MA02',
      objetivos: formData.objetivos || [
        `Compreender os conceitos fundamentais de ${formData.tema}`,
        `Aplicar conhecimentos sobre ${formData.tema} em situações práticas`,
        'Desenvolver habilidades de análise e síntese'
      ],
      habilidades: [
        `Identificar elementos relacionados a ${formData.tema}`,
        `Resolver problemas envolvendo ${formData.tema}`,
        'Trabalhar colaborativamente'
      ],
      desenvolvimento: [
        {
          etapa: 'Introdução',
          atividade: `Apresentação do tema ${formData.tema} com questionamentos iniciais`,
          tempo: '10 min',
          recursos: 'Quadro, apresentação'
        },
        {
          etapa: 'Desenvolvimento',
          atividade: `Explicação dos conceitos principais de ${formData.tema}`,
          tempo: '25 min',
          recursos: 'Material didático, exemplos práticos'
        },
        {
          etapa: 'Prática',
          atividade: `Exercícios e atividades sobre ${formData.tema}`,
          tempo: '10 min',
          recursos: 'Folhas de atividade'
        },
        {
          etapa: 'Fechamento',
          atividade: 'Síntese e esclarecimento de dúvidas',
          tempo: '5 min',
          recursos: 'Discussão em grupo'
        }
      ],
      recursos: [
        'Quadro branco',
        'Projetor',
        'Material impresso',
        'Computador'
      ],
      avaliacao: `A avaliação será realizada através da participação dos alunos durante as atividades, observação do desempenho nas tarefas práticas e verificação da compreensão dos conceitos relacionados a ${formData.tema}.`
    };
  }

  private generateActivity(formData: any): any {
    // Use the correct field names from form data
    const numQuestoes = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
    const tipoQuestoes = formData.tipoQuestoes || formData.tiposQuestoes || 'mistas';
    const dificuldade = formData.dificuldade || 'medio';
    
    console.log('Generating activity with:', { numQuestoes, tipoQuestoes, dificuldade });
    
    // Map question type to the types array
    let tiposQuestoesArray = [];
    switch (tipoQuestoes) {
      case 'abertas':
        tiposQuestoesArray = ['aberta'];
        break;
      case 'fechadas':
        tiposQuestoesArray = ['multipla_escolha', 'verdadeiro_falso'];
        break;
      case 'mistas':
      default:
        tiposQuestoesArray = ['multipla_escolha', 'aberta', 'verdadeiro_falso', 'completar', 'ligar', 'desenho'];
        break;
    }
    
    return {
      titulo: `Atividade sobre ${formData.tema}`,
      disciplina: formData.disciplina,
      serie: formData.serie,
      instrucoes: `Leia atentamente cada questão e responda de acordo com seus conhecimentos sobre ${formData.tema}.`,
      questoes: this.generateQuestionsWithNewTemplate(numQuestoes, tiposQuestoesArray, formData.tema, formData.disciplina, 'atividade', dificuldade)
    };
  }

  private generateEvaluation(formData: any): any {
    // Use the correct field names from form data
    const numQuestoes = formData.numeroQuestoes || formData.quantidadeQuestoes || 4;
    const tipoQuestoes = formData.tipoQuestoes || formData.tiposQuestoes || 'mistas';
    const dificuldade = formData.dificuldade || 'medio';
    const pontuacaoTotal = 10;
    const pontuacaoPorQuestao = pontuacaoTotal / numQuestoes;
    
    console.log('Generating evaluation with:', { numQuestoes, tipoQuestoes, dificuldade });
    
    // Map question type to the types array for evaluations
    let tiposQuestoesArray = [];
    switch (tipoQuestoes) {
      case 'abertas':
        tiposQuestoesArray = ['dissertativa'];
        break;
      case 'fechadas':
        tiposQuestoesArray = ['multipla_escolha', 'verdadeiro_falso'];
        break;
      case 'mistas':
      default:
        tiposQuestoesArray = ['multipla_escolha', 'dissertativa', 'verdadeiro_falso', 'completar', 'ligar'];
        break;
    }
    
    return {
      titulo: `Avaliação de ${formData.tema}`,
      instrucoes: 'Leia com atenção cada questão e escolha a alternativa correta ou responda de forma completa.',
      tempoLimite: formData.tempoLimite || '50 minutos',
      questoes: this.generateQuestionsWithNewTemplate(numQuestoes, tiposQuestoesArray, formData.tema, formData.disciplina, 'avaliacao', dificuldade, pontuacaoPorQuestao)
    };
  }

  private generateQuestionsWithNewTemplate(
    numQuestoes: number, 
    tiposQuestoes: string[], 
    tema: string, 
    disciplina: string, 
    materialType: 'atividade' | 'avaliacao',
    dificuldade: string,
    pontuacao?: number
  ): any[] {
    const questoes = [];
    
    console.log('Generating questions with new template:', { numQuestoes, tiposQuestoes, tema, disciplina });
    
    for (let i = 0; i < numQuestoes; i++) {
      const tipoQuestao = tiposQuestoes[i % tiposQuestoes.length];
      const numeroQuestao = i + 1;
      
      let questao: any = {
        numero: numeroQuestao,
        tipo: tipoQuestao
      };

      if (materialType === 'avaliacao' && pontuacao) {
        questao.pontuacao = Math.round(pontuacao * 10) / 10;
      }

      const questionHtml = this.generateQuestionHtml(tipoQuestao, tema, disciplina, numeroQuestao, dificuldade);
      
      // Wrap question in container div with new template classes
      const wrappedHtml = `<div class="question">${questionHtml}</div>`;
      
      questoes.push({
        ...questao,
        html: wrappedHtml
      });
    }
    
    console.log('Generated questions with new template:', questoes);
    return questoes;
  }

  private generateQuestionHtml(tipoQuestao: string, tema: string, disciplina: string, numeroQuestao: number, dificuldade: string): string {
    let html = `<div class="question-header">Questão ${numeroQuestao}</div>`;
    
    switch (tipoQuestao) {
      case 'multipla_escolha':
        html += `
          <div class="question-text">${this.generateMultipleChoiceQuestion(tema, disciplina, numeroQuestao, dificuldade)}</div>
          <div class="options">
            <div class="option"><span class="option-letter">A)</span> ${this.generateMultipleChoiceOptions(tema, disciplina, dificuldade)[0]}</div>
            <div class="option"><span class="option-letter">B)</span> ${this.generateMultipleChoiceOptions(tema, disciplina, dificuldade)[1]}</div>
            <div class="option"><span class="option-letter">C)</span> ${this.generateMultipleChoiceOptions(tema, disciplina, dificuldade)[2]}</div>
            <div class="option"><span class="option-letter">D)</span> ${this.generateMultipleChoiceOptions(tema, disciplina, dificuldade)[3]}</div>
          </div>
        `;
        break;

      case 'aberta':
      case 'dissertativa':
        const isCalculation = disciplina.toLowerCase().includes('matemática') && Math.random() > 0.6;
        html += `<div class="question-text">${this.generateOpenQuestion(tema, disciplina, numeroQuestao, dificuldade)}</div>`;
        
        if (isCalculation && disciplina.toLowerCase().includes('matemática')) {
          html += `<div class="math-space">[Fórmula Matemática: ${this.generateMathFormula(tema)}]</div>`;
        }
        
        const numLines = this.getResponseLines(dificuldade);
        for (let i = 0; i < numLines; i++) {
          html += '<div class="answer-lines"></div>';
        }
        break;

      case 'verdadeiro_falso':
        html += `
          <div class="question-text">${this.generateTrueFalseQuestion(tema, disciplina, numeroQuestao)}</div>
          <div class="options">
              <div class="option"><span class="option-letter">V)</span> Verdadeiro</div>
              <div class="option"><span class="option-letter">F)</span> Falso</div>
          </div>
        `;
        break;

      case 'ligar':
        const matching = this.generateMatchingQuestion(tema, disciplina);
        html += `
          <div class="question-text">Ligue os itens da Coluna A com os da Coluna B relacionados a ${tema}:</div>
          <div class="matching-section">
            <div class="matching-column">
              <div class="matching-item">(1) ${matching.colunaA[0]}</div>
              <div class="matching-item">(2) ${matching.colunaA[1]}</div>
            </div>
            <div class="matching-column">
              <div class="matching-item">( ) ${matching.colunaB[0]}</div>
              <div class="matching-item">( ) ${matching.colunaB[1]}</div>
            </div>
          </div>
          <div class="answer-lines"></div>
        `;
        break;

      case 'completar':
        html += `
          <div class="question-text">Complete as lacunas:</div>
          <div class="fill-blank"></div>
          <div class="fill-blank"></div>
        `;
        break;

      case 'desenho':
        html += `
          <div class="question-text">${this.generateDrawingQuestion(tema, disciplina, numeroQuestao)}</div>
          <div class="image-space"></div>
          <div class="answer-lines"></div>
          <div class="answer-lines"></div>
        `;
        break;

      default:
        html += `
          <div class="question-text">Explique os principais conceitos relacionados a ${tema}.</div>
          <div class="answer-lines"></div>
          <div class="answer-lines"></div>
          <div class="answer-lines"></div>
        `;
    }

    return html;
  }

  private generateMultipleChoiceQuestion(tema: string, disciplina: string, numero: number, dificuldade: string): string {
    const questions = [
      `Sobre ${tema}, qual das alternativas está correta?`,
      `Em relação a ${tema}, podemos afirmar que:`,
      `${tema} pode ser caracterizado como:`,
      `A principal importância de ${tema} está em:`,
      `Qual é a definição mais adequada para ${tema}?`
    ];
    
    return questions[numero % questions.length];
  }

  private generateMultipleChoiceOptions(tema: string, disciplina: string, dificuldade: string): string[] {
    return [
      `É um conceito fundamental em ${disciplina}`,
      `Pode ser aplicado em diversas situações do cotidiano`,
      `Requer compreensão teórica e prática`,
      `Todas as alternativas anteriores estão corretas`
    ];
  }

  private generateOpenQuestion(tema: string, disciplina: string, numero: number, dificuldade: string): string {
    const questions = [
      `Defina ${tema} e explique sua importância em ${disciplina}.`,
      `Como ${tema} pode ser aplicado em situações do dia a dia?`,
      `Analise os principais aspectos de ${tema}.`,
      `Descreva as características mais importantes de ${tema}.`,
      `Explique como ${tema} se relaciona com outros conceitos em ${disciplina}.`
    ];
    
    return questions[numero % questions.length];
  }

  private generateTrueFalseQuestion(tema: string, disciplina: string, numero: number): string {
    const statements = [
      `${tema} é considerado um conceito básico em ${disciplina}.`,
      `O estudo de ${tema} é fundamental para compreender ${disciplina}.`,
      `${tema} pode ser observado apenas em situações específicas.`,
      `Existem diferentes formas de abordar ${tema} em ${disciplina}.`
    ];
    
    return statements[numero % statements.length];
  }

  private generateMatchingQuestion(tema: string, disciplina: string): { colunaA: string[], colunaB: string[] } {
    return {
      colunaA: [
        `Conceito principal`,
        `Aplicação prática`,
        `Característica importante`,
        `Exemplo comum`
      ],
      colunaB: [
        `Situação do cotidiano`,
        `Definição de ${tema}`,
        `Aspecto relevante`,
        `Caso prático`
      ]
    };
  }

  private generateFillBlankQuestion(tema: string, disciplina: string, numero: number): string {
    const texts = [
      `O conceito de _______ é fundamental para compreender _______. Sua aplicação permite _______ de forma mais eficiente.`,
      `Em ${disciplina}, _______ representa _______. Por isso, é importante _______ para obter melhores resultados.`,
      `Quando estudamos _______, observamos que _______. Isso nos ajuda a _______ adequadamente.`
    ];
    
    return texts[numero % texts.length].replace(/_______/g, '<span class="fill-blank"></span>');
  }

  private generateDrawingQuestion(tema: string, disciplina: string, numero: number): string {
    const questions = [
      `Desenhe ou cole uma imagen que represente ${tema}.`,
      `Ilustre como ${tema} pode ser observado no seu dia a dia.`,
      `Crie uma representação visual de ${tema}.`,
      `Desenhe um exemplo prático de ${tema}.`
    ];
    
    return questions[numero % questions.length];
  }

  private generateInterpretationText(tema: string): string {
    return `O ${tema} é um conceito que está presente em nossa vida cotidiana de diversas formas. 
    Compreender suas características e aplicações nos ajuda a desenvolver uma visão mais ampla 
    e crítica sobre o mundo que nos cerca. Através do estudo sistemático, podemos identificar 
    padrões e estabelecer conexões importantes para nosso aprendizado.`;
  }

  private generateMathFormula(tema: string): string {
    const formulas = [
      'A = b × h',
      'P = 2(b + h)',
      'V = l × w × h',
      'C = 2πr',
      'A = πr²'
    ];
    
    return formulas[Math.floor(Math.random() * formulas.length)];
  }

  private getResponseLines(dificuldade: string): number {
    switch (dificuldade) {
      case 'facil': return 2;
      case 'medio': return 3;
      case 'dificil': return 5;
      default: return 3;
    }
  }

  getMaterials(): GeneratedMaterial[] {
    return this.materials;
  }

  getMaterialById(id: string): GeneratedMaterial | undefined {
    return this.materials.find(m => m.id === id);
  }

  deleteMaterial(id: string): boolean {
    const index = this.materials.findIndex(m => m.id === id);
    if (index !== -1) {
      this.materials.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const materialService = new MaterialService();
