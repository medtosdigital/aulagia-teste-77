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
  htmlContent?: string; 
}

// Template HTML para avaliações
const ASSESSMENT_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Avaliação – AulagIA</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    /* Define página A4 para impressão e visualização */
    @page {
      size: A4;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      background: #f0f4f8;
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      min-height: 100vh;
      padding: 20px 0;
    }
    .page {
      position: relative;
      width: 210mm;
      min-height: 297mm;
      background: white;
      overflow: hidden;
      margin: 0 auto 20px auto;
      box-sizing: border-box;
      padding: 0;
      display: flex;
      flex-direction: column;
      border-radius: 6px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      page-break-after: always;
    }
    .page:last-of-type {
      page-break-after: auto;
      margin-bottom: 0;
    }
    
    .shape-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.25;
      pointer-events: none;
      z-index: 0;
    }
    .shape-circle.purple {
      width: 180px; 
      height: 180px;
      background: #a78bfa;
      top: -60px; 
      left: -40px;
    }
    .shape-circle.blue {
      width: 240px; 
      height: 240px;
      background: #60a5fa;
      bottom: -80px; 
      right: -60px;
    }
    
    .header {
      position: absolute;
      top: 6mm;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      z-index: 999;
      height: 15mm;
      background: transparent;
      padding: 0 12mm;
      flex-shrink: 0;
    }
    .header .logo-container {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .header .logo {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
      box-shadow: 0 3px 8px rgba(14, 165, 233, 0.3);
    }
    .header .logo svg {
      width: 20px;
      height: 20px;
      stroke: white;
      fill: none;
      stroke-width: 2;
    }
    .header .brand-text {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .header .brand-text h1 {
      font-size: 24px;
      color: #0ea5e9;
      margin: 0;
      font-family: 'Inter', sans-serif;
      line-height: 1;
      font-weight: 700;
      letter-spacing: -0.5px;
      text-transform: none;
    }
    .header .brand-text p {
      font-size: 9px;
      color: #6b7280;
      margin: 1px 0 0 0;
      font-family: 'Inter', sans-serif;
      line-height: 1;
      font-weight: 400;
    }
    
    .content {
      margin-top: 25mm;
      margin-bottom: 12mm;
      padding: 0 15mm;
      position: relative;
      flex: 1;
      overflow: visible;
      z-index: 1;
    }
    .content.subsequent-page {
      margin-top: 40mm;
    }

    h2 {
      text-align: center;
      margin: 10px 0 18px 0;
      font-size: 1.5rem;
      color: #4f46e5;
      position: relative;
      font-family: 'Inter', sans-serif;
      font-weight: 700;
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
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    th, td {
      padding: 8px 12px;
      font-size: 0.85rem;
      border: none;
      font-family: 'Inter', sans-serif;
      vertical-align: top;
    }
    th {
      background: #f3f4f6;
      color: #1f2937;
      font-weight: 600;
      text-align: left;
      width: 18%;
    }
    td {
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
    }
    td:last-child {
      border-bottom: none;
    }
    table .student-info-cell {
        width: 32%; 
    }
    .nota-highlight-cell {
        background-color: #fef3c7;
        color: #000000;
        font-weight: 600;
        border: 2px solid #f59e0b;
    }
    
    .instructions {
      background: #eff6ff;
      padding: 15px;
      border-left: 4px solid #0ea5e9;
      margin-bottom: 30px;
      font-family: 'Inter', sans-serif;
      border-radius: 6px;
    }
    
    .question {
      margin-bottom: 30px;
      page-break-inside: avoid; 
    }
    .question-header {
      font-weight: 600;
      color: #4338ca;
      margin-bottom: 10px;
      font-size: 1.0rem;
      font-family: 'Inter', sans-serif;
    }
    .question-text {
      margin-bottom: 15px;
      text-align: justify;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      line-height: 1.4;
    }
    .options {
      margin-left: 20px;
    }
    .option {
      margin-bottom: 8px;
      display: flex;
      align-items: flex-start;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
    }
    .option-letter {
      font-weight: bold;
      margin-right: 10px;
      color: #4338ca;
      min-width: 25px;
    }
    .answer-lines {
      border-bottom: 1px solid #d1d5db;
      margin-bottom: 8px;
      height: 20px;
      padding: 0;
      background: none;
      border-radius: 0;
      min-height: 20px; 
    }
    .answer-lines:last-child {
      margin-bottom: 0;
    }
    .math-space, .image-space {
      border: 1px solid #e5e7eb;
      min-height: 80px;
      margin: 10px 0;
      padding: 15px;
      border-radius: 4px;
      background: #fafafa;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 0.8rem;
    }
    .image-space {
        min-height: 120px;
        border: 2px dashed #d1d5db;
    }
    .matching-section {
      display: flex;
      gap: 30px;
      margin: 15px 0;
    }
    .matching-column {
      flex: 1;
    }
    .matching-item {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      margin-bottom: 8px;
      border-radius: 4px;
      background: #f9fafb;
    }
    .fill-blank {
      display: inline-block;
      border-bottom: 2px solid #4338ca;
      min-width: 100px;
      height: 20px;
      margin: 0 5px;
    }
    
    .formula-display {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
      text-align: center;
      font-family: 'Times New Roman', serif;
      font-size: 1.1rem;
      border: 1px solid #e2e8f0;
    }
    
    .footer {
      position: absolute; 
      bottom: 6mm;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 0.7rem;
      color: #6b7280;
      z-index: 999;
      height: 6mm;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      padding: 0 15mm;
      font-family: 'Inter', sans-serif;
      flex-shrink: 0;
    }
    
    @media print {
      body { 
        margin: 0; 
        padding: 0; 
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page { 
        box-shadow: none; 
        margin: 0; 
        border-radius: 0;
        width: 100%;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .shape-circle {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .header, .footer {
        position: fixed; 
        background: transparent; 
      }
      .header .logo {
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .header .brand-text h1 {
        text-transform: none !important;
      }
      h2 {
        color: #4f46e5 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      h2::after {
        background: #a78bfa !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .question-header {
        color: #4338ca !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      th {
        background: #f3f4f6 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .nota-highlight-cell {
        background-color: #fef3c7 !important;
        border: 2px solid #f59e0b !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  {{CONTENT}}
</body>
</html>`;

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
    const numQuestoes = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
    const tipoQuestoes = formData.tipoQuestoes || formData.tiposQuestoes || 'mistas';
    const dificuldade = formData.dificuldade || 'medio';
    
    console.log('Generating activity with:', { numQuestoes, tipoQuestoes, dificuldade });
    
    // Generate proper structured questions
    const questoes = this.generateStructuredQuestions(
      numQuestoes, 
      tipoQuestoes, 
      formData.tema, 
      formData.disciplina, 
      'atividade', 
      dificuldade
    );
    
    return {
      titulo: `Atividade sobre ${formData.tema}`,
      disciplina: formData.disciplina,
      serie: formData.serie,
      instrucoes: `Leia atentamente cada questão e responda de acordo com seus conhecimentos sobre ${formData.tema}.`,
      questoes: questoes
    };
  }

  private generateEvaluation(formData: any): Assessment {
    const numQuestoes = formData.numeroQuestoes || formData.quantidadeQuestoes || 4;
    const tipoQuestoes = formData.tipoQuestoes || formData.tiposQuestoes || 'mistas';
    const dificuldade = formData.dificuldade || 'medio';
    const pontuacaoTotal = 10;
    const pontuacaoPorQuestao = pontuacaoTotal / numQuestoes;
    
    // Obter múltiplos assuntos se fornecidos
    const assuntos = formData.assuntos || formData.subjects || [formData.tema];
    const assuntosLimpos = assuntos.filter((assunto: string) => assunto && assunto.trim() !== '');
    
    console.log('Generating evaluation with multiple subjects:', { numQuestoes, tipoQuestoes, dificuldade, assuntos: assuntosLimpos });
    
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
    
    // Gerar questões com múltiplos assuntos e tipos aleatórios
    const questoes = this.generateMultiSubjectQuestions(
      numQuestoes, 
      tiposQuestoesArray, 
      assuntosLimpos, 
      formData.disciplina, 
      dificuldade, 
      pontuacaoPorQuestao
    );
    
    const htmlContent = this.generateAssessmentHTML(formData, questoes);
    
    const tituloAvaliacao = assuntosLimpos.length > 1 
      ? `Avaliação de ${assuntosLimpos.slice(0, 2).join(' e ')}${assuntosLimpos.length > 2 ? ' e outros' : ''}`
      : `Avaliação de ${formData.tema}`;
    
    return {
      titulo: tituloAvaliacao,
      instrucoes: 'Leia com atenção cada questão e escolha a alternativa correta ou responda de forma completa.',
      tempoLimite: formData.tempoLimite || '50 minutos',
      questoes,
      htmlContent
    };
  }

  // Novo método para gerar questões com múltiplos assuntos
  private generateMultiSubjectQuestions(
    numQuestoes: number, 
    tiposQuestoes: string[], 
    assuntos: string[], 
    disciplina: string, 
    dificuldade: string,
    pontuacao: number
  ): any[] {
    const questoes = [];
    
    // Embaralhar tipos de questões para garantir aleatoriedade
    const shuffleArray = (array: string[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Distribuir questões entre os assuntos de forma equilibrada
    for (let i = 0; i < numQuestoes; i++) {
      const assuntoIndex = i % assuntos.length;
      const assuntoAtual = assuntos[assuntoIndex];
      
      // Embaralhar tipos para cada questão
      const tiposEmbaralhados = shuffleArray(tiposQuestoes);
      const tipoQuestao = tiposEmbaralhados[i % tiposEmbaralhados.length];
      const numeroQuestao = i + 1;
      
      let questao: any = {
        numero: numeroQuestao,
        tipo: tipoQuestao,
        pontuacao: Math.round(pontuacao * 10) / 10,
        assunto: assuntoAtual // Adicionar assunto específico para esta questão
      };

      switch (tipoQuestao) {
        case 'multipla_escolha':
          questao.pergunta = this.generateMultipleChoiceQuestionForSubject(assuntoAtual, disciplina, numeroQuestao, dificuldade);
          questao.opcoes = this.generateMultipleChoiceOptionsForSubject(assuntoAtual, disciplina, dificuldade);
          break;
        
        case 'dissertativa':
          questao.pergunta = this.generateOpenQuestionForSubject(assuntoAtual, disciplina, numeroQuestao, dificuldade);
          questao.linhasResposta = this.getResponseLines(dificuldade);
          break;
        
        case 'verdadeiro_falso':
          questao.pergunta = this.generateTrueFalseQuestionForSubject(assuntoAtual, disciplina, numeroQuestao);
          break;
        
        case 'ligar':
          const matching = this.generateMatchingQuestionForSubject(assuntoAtual, disciplina);
          questao.pergunta = `Ligue os itens da Coluna A com os da Coluna B relacionados a ${assuntoAtual}: `;
          questao.colunaA = matching.colunaA;
          questao.colunaB = matching.colunaB;
          break;
        
        case 'completar':
          questao.pergunta = 'Complete as lacunas:';
          questao.textoComLacunas = this.generateFillBlankQuestionForSubject(assuntoAtual, disciplina, numeroQuestao);
          break;
      }
      
      questoes.push(questao);
    }
    
    // Embaralhar a ordem final das questões para máxima aleatoriedade
    return this.shuffleQuestions(questoes);
  }

  // Embaralhar questões mantendo numeração sequencial
  private shuffleQuestions(questoes: any[]): any[] {
    const shuffled = [...questoes];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Renumerar após embaralhar
    return shuffled.map((questao, index) => ({
      ...questao,
      numero: index + 1
    }));
  }

  // Métodos específicos para gerar questões por assunto
  private generateMultipleChoiceQuestionForSubject(assunto: string, disciplina: string, numero: number, dificuldade: string): string {
    const questions = [
      `Sobre ${assunto}, qual das alternativas está correta?`,
      `Em relação a ${assunto}, podemos afirmar que:`,
      `${assunto} pode ser caracterizado como:`,
      `A principal importância de ${assunto} está em:`,
      `Qual é a definição mais adequada para ${assunto}?`,
      `Como ${assunto} se manifesta em ${disciplina}?`,
      `Qual das seguintes características pertence a ${assunto}?`,
      `${assunto} é fundamental porque:`,
      `No contexto de ${disciplina}, ${assunto} representa:`
    ];
    
    return questions[numero % questions.length];
  }

  private generateMultipleChoiceOptionsForSubject(assunto: string, disciplina: string, dificuldade: string): string[] {
    return [
      `É um conceito fundamental em ${disciplina}`,
      `Tem aplicação prática no estudo de ${assunto}`,
      `Requer compreensão teórica e análise crítica`,
      `Todas as alternativas anteriores estão corretas`
    ];
  }

  private generateOpenQuestionForSubject(assunto: string, disciplina: string, numero: number, dificuldade: string): string {
    const questions = [
      `Defina ${assunto} e explique sua importância em ${disciplina}.`,
      `Como ${assunto} pode ser aplicado em situações do dia a dia?`,
      `Analise os principais aspectos de ${assunto}.`,
      `Descreva as características mais importantes de ${assunto}.`,
      `Explique como ${assunto} se relaciona com outros conceitos em ${disciplina}.`,
      `Dê exemplos práticos de ${assunto} no cotidiano.`,
      `Por que é importante estudar ${assunto} em ${disciplina}?`,
      `Compare ${assunto} com outros conceitos similares.`,
      `Discuta as implicações de ${assunto} na área de ${disciplina}.`
    ];
    
    return questions[numero % questions.length];
  }

  private generateTrueFalseQuestionForSubject(assunto: string, disciplina: string, numero: number): string {
    const statements = [
      `${assunto} é considerado um conceito básico em ${disciplina}.`,
      `O estudo de ${assunto} é fundamental para compreender ${disciplina}.`,
      `${assunto} pode ser observado apenas em situações específicas.`,
      `Existem diferentes formas de abordar ${assunto} em ${disciplina}.`,
      `${assunto} tem aplicação prática no cotidiano.`,
      `Todos os aspectos de ${assunto} são fáceis de compreender.`,
      `${assunto} se relaciona diretamente com os princípios de ${disciplina}.`
    ];
    
    return statements[numero % statements.length];
  }

  private generateMatchingQuestionForSubject(assunto: string, disciplina: string): { colunaA: string[], colunaB: string[] } {
    return {
      colunaA: [
        `Conceito de ${assunto}`,
        `Aplicação prática`,
        `Característica principal`,
        `Exemplo comum`
      ],
      colunaB: [
        `Situação do cotidiano`,
        `Definição específica`,
        `Aspecto relevante`,
        `Caso prático em ${disciplina}`
      ]
    };
  }

  private generateFillBlankQuestionForSubject(assunto: string, disciplina: string, numero: number): string {
    const texts = [
      `O conceito de ${assunto} é fundamental para compreender _______. Sua aplicação permite _______ de forma mais eficiente.`,
      `Em ${disciplina}, ${assunto} representa _______. Por isso, é importante _______ para obter melhores resultados.`,
      `Quando estudamos ${assunto}, observamos que _______. Isso nos ajuda a _______ adequadamente.`,
      `${assunto} pode ser definido como _______. Esta definição nos permite _______ melhor o assunto.`,
      `A importância de ${assunto} em ${disciplina} está no fato de que _______. Assim, podemos _______ com maior precisão.`
    ];
    
    return texts[numero % texts.length];
  }

  private generateStructuredQuestions(
    numQuestoes: number,
    tipoQuestoes: string,
    tema: string,
    disciplina: string,
    materialType: 'atividade' | 'avaliacao',
    dificuldade: string
  ): any[] {
    // Define available question types for random mixing
    const allQuestionTypes = ['multipla_escolha', 'aberta', 'verdadeiro_falso', 'completar', 'ligar', 'desenho'];
    
    // Map user selection to question types array
    let availableTypes: string[] = [];
    switch (tipoQuestoes) {
      case 'abertas':
        availableTypes = ['aberta'];
        break;
      case 'fechadas':
        availableTypes = ['multipla_escolha', 'verdadeiro_falso'];
        break;
      case 'mistas':
      default:
        availableTypes = allQuestionTypes;
        break;
    }

    // Shuffle array to ensure random distribution
    const shuffleArray = (array: string[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const questoes = [];
    
    for (let i = 0; i < numQuestoes; i++) {
      // Randomly select question type for true mixing
      const shuffledTypes = shuffleArray(availableTypes);
      const tipoQuestao = shuffledTypes[i % shuffledTypes.length];
      const numeroQuestao = i + 1;
      
      let questao: any = {
        numero: numeroQuestao,
        tipo: tipoQuestao,
        pergunta: this.generateQuestionByType(tipoQuestao, tema, disciplina, numeroQuestao, dificuldade)
      };

      // Add specific properties based on question type
      switch (tipoQuestao) {
        case 'multipla_escolha':
          questao.opcoes = this.generateMultipleChoiceOptions(tema, disciplina, dificuldade);
          break;
        
        case 'aberta':
          questao.linhasResposta = this.getResponseLines(dificuldade);
          break;
        
        case 'verdadeiro_falso':
          // No additional properties needed
          break;
        
        case 'ligar':
          const matching = this.generateMatchingQuestion(tema, disciplina);
          questao.colunaA = matching.colunaA;
          questao.colunaB = matching.colunaB;
          break;
        
        case 'completar':
          questao.textoComLacunas = this.generateFillBlankText(tema, disciplina, numeroQuestao);
          break;

        case 'desenho':
          // No additional properties needed
          break;
      }
      
      questoes.push(questao);
    }
    
    console.log('Generated structured questions:', questoes);
    return questoes;
  }

  private generateQuestionByType(
    tipo: string, 
    tema: string, 
    disciplina: string, 
    numero: number, 
    dificuldade: string
  ): string {
    const questionBanks = {
      multipla_escolha: [
        `Sobre ${tema}, qual das alternativas está correta?`,
        `Em relação a ${tema}, podemos afirmar que:`,
        `${tema} pode ser caracterizado como:`,
        `A principal importância de ${tema} está em:`,
        `Qual é a definição mais adequada para ${tema}?`,
        `Como ${tema} se manifesta em ${disciplina}?`,
        `Qual das seguintes características pertence a ${tema}?`
      ],
      aberta: [
        `Defina ${tema} e explique sua importância em ${disciplina}.`,
        `Como ${tema} pode ser aplicado em situações do dia a dia?`,
        `Analise os principais aspectos de ${tema}.`,
        `Descreva as características mais importantes de ${tema}.`,
        `Explique como ${tema} se relaciona com outros conceitos em ${disciplina}.`,
        `Dê exemplos práticos de ${tema} no cotidiano.`,
        `Por que é importante estudar ${tema} em ${disciplina}?`
      ],
      verdadeiro_falso: [
        `${tema} é considerado um conceito básico em ${disciplina}.`,
        `O estudo de ${tema} é fundamental para compreender ${disciplina}.`,
        `${tema} pode ser observado apenas em situações específicas.`,
        `Existem diferentes formas de abordar ${tema} em ${disciplina}.`,
        `${tema} tem aplicação prática no cotidiano.`,
        `Todos os aspectos de ${tema} são fáceis de compreender.`
      ],
      completar: [
        `Complete as lacunas sobre ${tema}:`,
        `Preencha os espaços em branco relacionados a ${tema}:`,
        `Complete a frase sobre ${tema}:`
      ],
      ligar: [
        `Ligue os itens da Coluna A com os da Coluna B relacionados a ${tema}:`,
        `Relacione os conceitos da primeira coluna com suas definições na segunda coluna sobre ${tema}:`,
        `Faça a correspondência entre os elementos relacionados a ${tema}:`
      ],
      desenho: [
        `Desenhe ou represente graficamente ${tema}.`,
        `Ilustre como ${tema} pode ser observado no seu dia a dia.`,
        `Crie uma representação visual de ${tema}.`,
        `Desenhe um exemplo prático de ${tema}.`,
        `Faça um esquema que represente ${tema}.`
      ]
    };

    const questions = questionBanks[tipo as keyof typeof questionBanks] || questionBanks.aberta;
    return questions[numero % questions.length];
  }

  private generateFillBlankText(tema: string, disciplina: string, numero: number): string {
    const texts = [
      `O conceito de ${tema} é fundamental para compreender _______. Sua aplicação permite _______ de forma mais eficiente.`,
      `Em ${disciplina}, ${tema} representa _______. Por isso, é importante _______ para obter melhores resultados.`,
      `Quando estudamos ${tema}, observamos que _______. Isso nos ajuda a _______ adequadamente.`,
      `${tema} pode ser definido como _______. Esta definição nos permite _______ melhor o assunto.`,
      `A importância de ${tema} em ${disciplina} está no fato de que _______. Assim, podemos _______ com maior precisão.`
    ];
    
    return texts[numero % texts.length];
  }

  private generateAdvancedQuestions(
    numQuestoes: number, 
    tiposQuestoes: string[], 
    tema: string, 
    disciplina: string, 
    dificuldade: string,
    pontuacao: number
  ): any[] {
    const questoes = [];
    
    for (let i = 0; i < numQuestoes; i++) {
      const tipoQuestao = tiposQuestoes[i % tiposQuestoes.length];
      const numeroQuestao = i + 1;
      
      let questao: any = {
        numero: numeroQuestao,
        tipo: tipoQuestao,
        pontuacao: Math.round(pontuacao * 10) / 10
      };

      switch (tipoQuestao) {
        case 'multipla_escolha':
          questao.pergunta = this.generateMultipleChoiceQuestion(tema, disciplina, numeroQuestao, dificuldade);
          questao.opcoes = this.generateMultipleChoiceOptions(tema, disciplina, dificuldade);
          break;
        
        case 'dissertativa':
          questao.pergunta = this.generateOpenQuestion(tema, disciplina, numeroQuestao, dificuldade);
          questao.linhasResposta = this.getResponseLines(dificuldade);
          break;
        
        case 'verdadeiro_falso':
          questao.pergunta = this.generateTrueFalseQuestion(tema, disciplina, numeroQuestao);
          break;
        
        case 'ligar':
          const matching = this.generateMatchingQuestion(tema, disciplina);
          questao.pergunta = `Ligue os itens da Coluna A com os da Coluna B relacionados a ${tema}:`;
          questao.colunaA = matching.colunaA;
          questao.colunaB = matching.colunaB;
          break;
        
        case 'completar':
          questao.pergunta = 'Complete as lacunas:';
          questao.textoComLacunas = this.generateFillBlankQuestion(tema, disciplina, numeroQuestao);
          break;
      }
      
      questoes.push(questao);
    }
    
    return questoes;
  }

  private generateAssessmentHTML(formData: any, questoes: any[]): string {
    const today = new Date().toLocaleDateString('pt-BR');
    
    let pagesContent = '';
    const questoesPorPagina = 4;
    const totalPaginas = Math.ceil(questoes.length / questoesPorPagina);
    
    for (let pagina = 0; pagina < totalPaginas; pagina++) {
      const isFirstPage = pagina === 0;
      const inicioQuestoes = pagina * questoesPorPagina;
      const fimQuestoes = Math.min(inicioQuestoes + questoesPorPagina, questoes.length);
      const questoesPagina = questoes.slice(inicioQuestoes, fimQuestoes);
      
      pagesContent += `
  <div class="page ${isFirstPage ? 'first-page-content' : 'subsequent-page-content'}">
    <!-- Formas decorativas -->
    <div class="shape-circle purple"></div>
    <div class="shape-circle blue"></div>

    <!-- Cabeçalho AulagIA -->
    <div class="header">
      <div class="logo-container">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <div class="brand-text">
          <h1>AulagIA</h1>
          <p>Sua aula com toque mágico</p>
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="footer">
      Avaliação gerada pela AulagIA - Sua aula com toque mágico em ${today} • aulagia.com.br
    </div>

    <div class="content ${isFirstPage ? '' : 'subsequent-page'}">`;

      if (isFirstPage) {
        pagesContent += `
      <!-- Título da Avaliação -->
      <h2>AVALIAÇÃO</h2>

      <!-- Informações básicas da Avaliação -->
      <table>
        <tr>
          <th>Escola:</th>
          <td>_________________________________</td>
          <th>Data:</th>
          <td>${today}</td>
        </tr>
        <tr>
          <th>Disciplina:</th>
          <td>${formData.disciplina}</td>
          <th>Série/Ano:</th>
          <td>${formData.serie}</td>
        </tr>
        <tr>
          <th>Aluno(a):</th>
          <td class="student-info-cell">____________________________________________</td>
          <th>NOTA:</th>
          <td class="student-info-cell nota-highlight-cell"></td>
        </tr>
      </table>

      <!-- Instruções da Avaliação -->
      <div class="instructions">
        <strong>Avaliação de ${formData.tema}:</strong><br>
        Leia com atenção cada questão e escolha a alternativa correta ou responda de forma completa.
      </div>`;
      }

      // Adicionar questões da página
      questoesPagina.forEach(questao => {
        pagesContent += this.generateQuestionHTML(questao);
      });

      pagesContent += `
    </div>
  </div>`;
    }
    
    return ASSESSMENT_HTML_TEMPLATE.replace('{{CONTENT}}', pagesContent);
  }

  private generateQuestionHTML(questao: any): string {
    let html = `
      <div class="question">
        <div class="question-header">Questão ${questao.numero}</div>
        <div class="question-text">${questao.pergunta}</div>`;

    switch (questao.tipo) {
      case 'multipla_escolha':
        html += `
        <div class="options">
          ${questao.opcoes.map((opcao: string, index: number) => 
            `<div class="option"><span class="option-letter">${String.fromCharCode(65 + index)})</span> ${opcao}</div>`
          ).join('')}
        </div>`;
        break;

      case 'dissertativa':
        for (let i = 0; i < (questao.linhasResposta || 3); i++) {
          html += '<div class="answer-lines"></div>';
        }
        break;

      case 'verdadeiro_falso':
        html += `
        <div class="options">
          <div class="option"><span class="option-letter">V)</span> Verdadeiro</div>
          <div class="option"><span class="option-letter">F)</span> Falso</div>
        </div>`;
        break;

      case 'ligar':
        html += `
        <div class="matching-section">
          <div class="matching-column">
            ${questao.colunaA.map((item: string, index: number) => 
              `<div class="matching-item">(${index + 1}) ${item}</div>`
            ).join('')}
          </div>
          <div class="matching-column">
            ${questao.colunaB.map((item: string) => 
              `<div class="matching-item">( ) ${item}</div>`
            ).join('')}
          </div>
        </div>
        <div class="answer-lines"></div>`;
        break;

      case 'completar':
        html += `
        <div class="fill-blank"></div>
        <div class="fill-blank"></div>`;
        break;
    }

    html += `
      </div>`;

    return html;
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
        const mcQuestion = this.generateQuestionByType('multipla_escolha', tema, disciplina, numeroQuestao, dificuldade);
        const mcOptions = this.generateMultipleChoiceOptions(tema, disciplina, dificuldade);
        html += `
          <div class="question-text">${mcQuestion}</div>
          <div class="options">
            <div class="option"><span class="option-letter">A)</span> ${mcOptions[0]}</div>
            <div class="option"><span class="option-letter">B)</span> ${mcOptions[1]}</div>
            <div class="option"><span class="option-letter">C)</span> ${mcOptions[2]}</div>
            <div class="option"><span class="option-letter">D)</span> ${mcOptions[3]}</div>
          </div>
        `;
        break;

      case 'aberta':
      case 'dissertativa':
        const openQuestion = this.generateQuestionByType('aberta', tema, disciplina, numeroQuestao, dificuldade);
        const isCalculation = disciplina.toLowerCase().includes('matemática') && Math.random() > 0.6;
        html += `<div class="question-text">${openQuestion}</div>`;
        
        if (isCalculation && disciplina.toLowerCase().includes('matemática')) {
          html += `<div class="math-space">[Fórmula Matemática: ${this.generateMathFormula(tema)}]</div>`;
        }
        
        const numLines = this.getResponseLines(dificuldade);
        for (let i = 0; i < numLines; i++) {
          html += '<div class="answer-lines"></div>';
        }
        break;

      case 'verdadeiro_falso':
        const tfQuestion = this.generateQuestionByType('verdadeiro_falso', tema, disciplina, numeroQuestao, dificuldade);
        html += `
          <div class="question-text">${tfQuestion}</div>
          <div class="options">
              <div class="option"><span class="option-letter">V)</span> Verdadeiro</div>
              <div class="option"><span class="option-letter">F)</span> Falso</div>
          </div>
        `;
        break;

      case 'ligar':
        const matching = this.generateMatchingQuestion(tema, disciplina);
        const ligarQuestion = this.generateQuestionByType('ligar', tema, disciplina, numeroQuestao, dificuldade);
        html += `
          <div class="question-text">${ligarQuestion}</div>
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
        const completarQuestion = this.generateQuestionByType('completar', tema, disciplina, numeroQuestao, dificuldade);
        const fillBlankText = this.generateFillBlankText(tema, disciplina, numeroQuestao);
        html += `
          <div class="question-text">${completarQuestion}</div>
          <div class="question-text">${fillBlankText}</div>
        `;
        break;

      case 'desenho':
        const desenhoQuestion = this.generateQuestionByType('desenho', tema, disciplina, numeroQuestao, dificuldade);
        html += `
          <div class="question-text">${desenhoQuestion}</div>
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
