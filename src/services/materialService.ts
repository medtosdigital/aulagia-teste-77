import { templateService } from './templateService';

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

    let content: any;

    switch (type) {
      case 'plano-de-aula':
        content = this.generateLessonPlan(formData);
        break;
      case 'slides':
        content = this.generateSlides(formData);
        break;
      case 'atividade':
        content = this.generateActivity(formData);
        break;
      case 'avaliacao':
        content = this.generateEvaluation(formData);
        break;
      default:
        throw new Error('Tipo de material não suportado');
    }

    const material: GeneratedMaterial = {
      id: Date.now().toString(),
      type: type as any,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${formData.tema || formData.topic}`,
      content,
      createdAt: new Date().toISOString(),
      formData,
      subject: formData.disciplina || formData.subject,
      grade: formData.serie || formData.grade
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
    return {
      titulo: `Atividade sobre ${formData.tema}`,
      disciplina: formData.disciplina,
      serie: formData.serie,
      instrucoes: `Leia atentamente cada questão e responda de acordo com seus conhecimentos sobre ${formData.tema}.`,
      questoes: [
        {
          numero: 1,
          pergunta: `O que você entende por ${formData.tema}? Explique com suas palavras.`,
          opcoes: null
        },
        {
          numero: 2,
          pergunta: `Qual a importância de ${formData.tema} em nosso dia a dia?`,
          opcoes: [
            'É muito importante para o desenvolvimento',
            'Ajuda a compreender melhor o mundo',
            'Facilita a resolução de problemas',
            'Todas as alternativas anteriores'
          ]
        },
        {
          numero: 3,
          pergunta: `Cite dois exemplos práticos de ${formData.tema}.`,
          opcoes: null
        }
      ]
    };
  }

  private generateEvaluation(formData: any): any {
    return {
      titulo: `Avaliação de ${formData.tema}`,
      instrucoes: 'Leia com atenção cada questão e escolha a alternativa correta ou responda de forma completa.',
      tempoLimite: '50 minutos',
      questoes: [
        {
          numero: 1,
          pergunta: `Defina ${formData.tema} e explique sua importância.`,
          pontuacao: 2.5,
          opcoes: null
        },
        {
          numero: 2,
          pergunta: `Sobre ${formData.tema}, é correto afirmar que:`,
          pontuacao: 2.5,
          opcoes: [
            'É um conceito fundamental na disciplina',
            'Pode ser aplicado em diversas situações',
            'Requer compreensão teórica e prática',
            'Todas as alternativas estão corretas'
          ]
        },
        {
          numero: 3,
          pergunta: `Analise a seguinte situação relacionada a ${formData.tema} e apresente sua solução.`,
          pontuacao: 2.5,
          opcoes: null
        },
        {
          numero: 4,
          pergunta: `Compare e contraste diferentes aspectos de ${formData.tema}.`,
          pontuacao: 2.5,
          opcoes: null
        }
      ]
    };
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
