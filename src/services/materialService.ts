export interface GeneratedMaterial {
  id: string;
  title: string;
  type: 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao';
  subject: string;
  grade: string;
  content: any;
  createdAt: string;
}

export interface LessonPlan {
  professor: string;
  disciplina: string;
  tema: string;
  duracao: string;
  data: string;
  serie: string;
  bncc: string;
  dataGeracao: string;
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

  async generateMaterial(
    type: string,
    topic: string,
    subject: string,
    grade: string
  ): Promise<GeneratedMaterial> {
    // Simular geração com IA (aqui você integraria com OpenAI ou outro serviço)
    await new Promise(resolve => setTimeout(resolve, 2000));

    let content: any;
    let title = topic;

    switch (type) {
      case 'plano-de-aula':
        content = this.generateLessonPlan(topic, subject, grade);
        break;
      case 'slides':
        content = this.generateSlides(topic, subject, grade);
        break;
      case 'atividade':
        content = this.generateActivity(topic, subject, grade);
        break;
      case 'avaliacao':
        content = this.generateAssessment(topic, subject, grade);
        break;
      default:
        throw new Error('Tipo de material não suportado');
    }

    const material: GeneratedMaterial = {
      id: Date.now().toString(),
      title,
      type: type as any,
      subject,
      grade,
      content,
      createdAt: new Date().toISOString()
    };

    this.materials.push(material);
    return material;
  }

  private generateLessonPlan(topic: string, subject: string, grade: string): LessonPlan {
    return {
      professor: '[Nome do Professor]',
      disciplina: subject,
      tema: topic,
      duracao: '120 minutos',
      data: new Date().toLocaleDateString('pt-BR'),
      serie: grade,
      bncc: 'EF03MA07',
      dataGeracao: new Date().toISOString(),
      objetivos: [
        `Compreender o conceito de ${topic.toLowerCase()} como conceito fundamental.`,
        `Desenvolver estratégias para resolver problemas de ${topic.toLowerCase()}.`,
        `Utilizar materiais manipuláveis para representar situações de ${topic.toLowerCase()}.`
      ],
      habilidades: [
        `Resolver e elaborar problemas de ${topic.toLowerCase()}, utilizando estratégias e registros próprios, com o suporte de materiais manipuláveis e recursos tecnológicos.`
      ],
      desenvolvimento: [
        {
          etapa: 'Introdução',
          atividade: `Atividade de introdução adaptada para fundamental sobre ${topic.toLowerCase()}`,
          tempo: '20 min',
          recursos: 'Material visual e concreto'
        },
        {
          etapa: 'Desenvolvimento',
          atividade: `Atividade principal baseada nas habilidades. Resolver e elaborar problemas utilizando estratégias e registros próprios, com suporte de materiais manipuláveis e recursos tecnológicos.`,
          tempo: '70 min',
          recursos: 'Recursos didáticos apropriados'
        },
        {
          etapa: 'Aplicação',
          atividade: 'Prática dos objetivos. Compreender o conceito como adição repetida.',
          tempo: '20 min',
          recursos: 'Atividade prática'
        },
        {
          etapa: 'Avaliação',
          atividade: 'Verificação das habilidades desenvolvidas',
          tempo: '10 min',
          recursos: 'Instrumentos de avaliação'
        }
      ],
      recursos: [
        'Material concreto',
        'Quadro e giz',
        'Folhas de atividades',
        'Recursos tecnológicos'
      ],
      avaliacao: `Métodos de avaliação baseados nas habilidades BNCC (EF03MA07)\n\nPara a avaliação baseada em BNCC EF03MA07: Identificar posições de objetos segundo referenciais próximos, internos, externos à própria pessoa e representar posições de objetos no plano.`
    };
  }

  private generateSlides(topic: string, subject: string, grade: string): Slide[] {
    return [
      {
        numero: 1,
        titulo: topic,
        conteudo: [
          `Disciplina: ${subject}`,
          `Série/Ano: ${grade}`,
          'Apresentação do tema'
        ]
      },
      {
        numero: 2,
        titulo: 'Objetivos de Aprendizagem',
        conteudo: [
          `• Compreender o conceito de ${topic.toLowerCase()}`,
          `• Desenvolver estratégias para ${topic.toLowerCase()}`,
          `• Aplicar conhecimentos em situações práticas`
        ]
      },
      {
        numero: 3,
        titulo: 'Conteúdo Principal',
        conteudo: [
          `Conceitos fundamentais sobre ${topic.toLowerCase()}`,
          'Exemplos práticos',
          'Aplicações no cotidiano'
        ]
      },
      {
        numero: 4,
        titulo: 'Atividade Prática',
        conteudo: [
          'Vamos praticar!',
          `Exercícios sobre ${topic.toLowerCase()}`,
          'Resolução em grupo'
        ]
      },
      {
        numero: 5,
        titulo: 'Conclusão',
        conteudo: [
          'Recapitulação dos pontos principais',
          'Próximos passos',
          'Dúvidas e perguntas'
        ]
      }
    ];
  }

  private generateActivity(topic: string, subject: string, grade: string): Activity {
    return {
      titulo: `Atividade - ${topic}`,
      instrucoes: `Nesta atividade, vamos praticar ${topic.toLowerCase()} usando situações do dia a dia.\nResponda às perguntas abaixo e divirta-se aprendendo!`,
      questoes: [
        {
          numero: 1,
          pergunta: `Maria tem 4 caixas de lápis. Cada caixa tem 6 lápis. Quantos lápis Maria tem ao todo?`,
          tipo: 'aberta'
        },
        {
          numero: 2,
          pergunta: `Se um ônibus escolar leva 5 crianças e há 7 ônibus, quantas crianças são transportadas ao todo?`,
          tipo: 'aberta'
        },
        {
          numero: 3,
          pergunta: `Em uma horta há 8 fileiras de plantas. Cada fileira tem 9 plantas. Quantas plantas há na horta?`,
          tipo: 'multipla_escolha',
          opcoes: ['64 plantas', '72 plantas', '81 plantas', '90 plantas'],
          resposta: '72 plantas'
        }
      ]
    };
  }

  private generateAssessment(topic: string, subject: string, grade: string): Assessment {
    return {
      titulo: `Avaliação - ${topic}`,
      instrucoes: 'Leia com atenção cada questão e responda de forma clara e completa.',
      questoes: [
        {
          numero: 1,
          pergunta: `Explique o conceito de ${topic.toLowerCase()} com suas próprias palavras.`,
          tipo: 'dissertativa',
          pontuacao: 2.5
        },
        {
          numero: 2,
          pergunta: `Resolva: 7 × 8 = ?`,
          tipo: 'multipla_escolha',
          opcoes: ['54', '56', '63', '64'],
          pontuacao: 2.5
        },
        {
          numero: 3,
          pergunta: `Crie um problema que envolva ${topic.toLowerCase()} e resolva-o.`,
          tipo: 'dissertativa',
          pontuacao: 5.0
        }
      ],
      tempoLimite: '60 minutos'
    };
  }

  getMaterials(): GeneratedMaterial[] {
    return this.materials;
  }

  getMaterialById(id: string): GeneratedMaterial | undefined {
    return this.materials.find(m => m.id === id);
  }

  updateMaterial(id: string, updates: Partial<GeneratedMaterial>): GeneratedMaterial | undefined {
    const index = this.materials.findIndex(m => m.id === id);
    if (index !== -1) {
      this.materials[index] = { ...this.materials[index], ...updates };
      return this.materials[index];
    }
    return undefined;
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
