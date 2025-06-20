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
    tipo: 'multipla_escolha' | 'aberta' | 'verdadeiro_falso';
    opcoes?: string[];
    resposta?: string;
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
    tipo: 'multipla_escolha' | 'dissertativa';
    opcoes?: string[];
    pontuacao: number;
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
    const questoes = this.generateQuestions(formData, 'atividade');
    
    return {
      titulo: `Atividade sobre ${formData.tema}`,
      disciplina: formData.disciplina,
      serie: formData.serie,
      instrucoes: `Leia atentamente cada questão e responda de acordo com seus conhecimentos sobre ${formData.tema}.`,
      questoes: questoes
    };
  }

  private generateEvaluation(formData: any): any {
    const questoes = this.generateQuestions(formData, 'avaliacao');
    
    return {
      titulo: `Avaliação de ${formData.tema}`,
      instrucoes: 'Leia com atenção cada questão e escolha a alternativa correta ou responda de forma completa.',
      tempoLimite: '50 minutos',
      questoes: questoes
    };
  }

  private generateQuestions(formData: any, tipo: 'atividade' | 'avaliacao'): any[] {
    const quantidade = formData.quantidadeQuestoes || 5;
    const tipoQuestoes = formData.tipoQuestoes || 'mistas';
    const tema = formData.tema;
    const questoes = [];

    const questoesModelos = [
      {
        tipo: 'aberta',
        pergunta: `O que você entende por ${tema}? Explique com suas palavras.`,
        opcoes: null
      },
      {
        tipo: 'aberta',
        pergunta: `Resolva a multiplicação abaixo com a ajuda da figura:`,
        descricao: `João tem <strong>4 caixas</strong> com <strong>3 bolas</strong> em cada. Quantas bolas ele tem ao todo?`,
        promptImagem: 'criança organizando bolas em caixas para aprender multiplicação, fundo escolar',
        opcoes: null
      },
      {
        tipo: 'tabela',
        pergunta: `Complete a tabela com os resultados das multiplicações:`,
        tabela: [
          { operacao: '2 × 1', resultado: '___' },
          { operacao: '2 × 2', resultado: '___' },
          { operacao: '2 × 3', resultado: '___' }
        ],
        opcoes: null
      },
      {
        tipo: 'aberta',
        pergunta: `Calcule e escreva a fração representada:`,
        descricao: `Uma pizza foi dividida em 8 pedaços. Maria comeu 3. Qual fração representa o que ela comeu?`,
        promptImagem: 'desenho de pizza cortada em 8 partes com 3 coloridas, estilo educativo',
        opcoes: null
      },
      {
        tipo: 'lista',
        pergunta: `Preencha os quadrinhos abaixo com os resultados das adições:`,
        descricao: 'Use seus conhecimentos e preencha:',
        lista: ['12 + 8 = ___', '20 + 5 = ___', '9 + 13 = ___'],
        opcoes: null
      },
      {
        tipo: 'aberta',
        pergunta: `Resolva o gráfico:`,
        descricao: `Observe o gráfico de frutas favoritas da turma e responda: Quantas crianças preferem maçã?`,
        promptImagem: 'gráfico de barras simples mostrando frutas favoritas em uma sala de aula',
        opcoes: null
      },
      {
        tipo: 'fechada',
        pergunta: `Qual a importância de ${tema} em nosso dia a dia?`,
        opcoes: [
          'É muito importante para o desenvolvimento',
          'Ajuda a compreender melhor o mundo',
          'Facilita a resolução de problemas',
          'Todas as alternativas anteriores'
        ]
      },
      {
        tipo: 'fechada',
        pergunta: `Sobre ${tema}, é correto afirmar que:`,
        opcoes: [
          'É um conceito fundamental na disciplina',
          'Pode ser aplicado em diversas situações',
          'Requer compreensão teórica e prática',
          'Todas as alternativas estão corretas'
        ]
      },
      {
        tipo: 'aberta',
        pergunta: `Transforme a fração em número decimal:`,
        descricao: `Transforme <strong>3/4</strong> em número decimal. Mostre o cálculo.`,
        opcoes: null
      },
      {
        tipo: 'aberta',
        pergunta: `Problema final:`,
        descricao: `Pedro juntou <strong>2 moedas de R$ 1,00</strong> por dia durante <strong>5 dias</strong>. Quanto ele conseguiu ao todo?`,
        opcoes: null
      }
    ];

    // Filtrar questões baseado no tipo solicitado
    let questoesFiltradas = questoesModelos;
    if (tipoQuestoes === 'abertas') {
      questoesFiltradas = questoesModelos.filter(q => q.tipo === 'aberta' || q.tipo === 'tabela' || q.tipo === 'lista');
    } else if (tipoQuestoes === 'fechadas') {
      questoesFiltradas = questoesModelos.filter(q => q.tipo === 'fechada');
    }

    // Selecionar questões aleatoriamente até atingir a quantidade
    for (let i = 0; i < quantidade; i++) {
      const questaoModelo = questoesFiltradas[i % questoesFiltradas.length];
      const questao: any = {
        numero: i + 1,
        pergunta: questaoModelo.pergunta,
        opcoes: questaoModelo.opcoes,
        ...(questaoModelo.descricao && { descricao: questaoModelo.descricao }),
        ...(questaoModelo.promptImagem && { promptImagem: questaoModelo.promptImagem }),
        ...(questaoModelo.tabela && { tabela: questaoModelo.tabela }),
        ...(questaoModelo.lista && { lista: questaoModelo.lista })
      };

      if (tipo === 'avaliacao') {
        questao.pontuacao = parseFloat((10 / quantidade).toFixed(1));
      }

      questoes.push(questao);
    }

    return questoes;
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
