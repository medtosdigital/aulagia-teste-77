import { userMaterialsService, UserMaterial } from './userMaterialsService';

export interface GeneratedMaterial {
  id: string;
  title: string;
  type: 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao';
  subject: string;
  grade: string;
  createdAt: string;
  content: any;
  formData?: any;
}

export interface MaterialFormData {
  tema?: string;
  topic?: string;
  disciplina?: string;
  subject?: string;
  serie?: string;
  grade?: string;
  assuntos?: string[];
  subjects?: string[];
  tipoQuestoes?: string;
  tiposQuestoes?: string[];
  numeroQuestoes?: number;
  quantidadeQuestoes?: number;
  professor?: string;
  data?: string;
  duracao?: string;
  bncc?: string;
}

// Type exports for backward compatibility
export interface LessonPlan {
  titulo?: string;
  professor: string;
  disciplina: string;
  serie: string;
  tema: string;
  data: string;
  duracao: string;
  bncc: string;
  objetivos: string[];
  habilidades: string[];
  desenvolvimento: Array<{
    etapa: string;
    atividade: string;
    tempo: string;
    recursos: string;
  }>;
  recursos: string[];
  avaliacao: string;
}

export interface Activity {
  titulo?: string;
  instrucoes: string;
  questoes: Array<{
    numero: number;
    tipo: string;
    pergunta: string;
    opcoes?: string[];
    resposta?: string;
  }>;
}

export interface Slide {
  numero: number;
  titulo: string;
  conteudo: string[] | string;
  tipo?: string;
}

export interface Assessment {
  titulo?: string;
  instrucoes: string;
  tempoLimite?: string;
  questoes: Array<{
    numero: number;
    tipo: string;
    pergunta: string;
    opcoes?: string[];
    pontuacao?: number;
  }>;
  htmlContent?: string;
}

class MaterialService {
  async generateMaterial(type: string, formData: MaterialFormData): Promise<GeneratedMaterial> {
    console.log('🚀 Starting material generation:', { type, formData });
    
    try {
      // Simulate material generation (replace with actual generation logic)
      const generatedContent = await this.generateContentForType(type, formData);
      console.log('✅ Content generated successfully');
      
      // Map form data to UserMaterial format
      const materialData = this.mapToUserMaterial(type, formData, generatedContent);
      console.log('📝 Material data mapped:', materialData);
      
      // Save to Supabase
      console.log('💾 Saving material to Supabase...');
      const savedMaterial = await userMaterialsService.addMaterial(materialData);
      
      if (!savedMaterial) {
        console.error('❌ Failed to save material to Supabase');
        throw new Error('Falha ao salvar material no banco de dados');
      }
      
      console.log('✅ Material saved successfully to Supabase:', savedMaterial.id);
      
      // Convert back to GeneratedMaterial format for UI compatibility
      const result = this.convertToGeneratedMaterial(savedMaterial, generatedContent, formData);
      console.log('🔄 Material converted for UI:', result.id);
      
      return result;
    } catch (error) {
      console.error('❌ Error in generateMaterial:', error);
      throw error;
    }
  }

  // Backward compatibility methods
  async getMaterials(): Promise<GeneratedMaterial[]> {
    console.log('📋 Getting all materials from Supabase...');
    try {
      const userMaterials = await userMaterialsService.getAllMaterials();
      console.log('✅ Loaded materials from Supabase:', userMaterials.length);
      
      return userMaterials.map(material => this.convertUserMaterialToGenerated(material));
    } catch (error) {
      console.error('❌ Error getting materials:', error);
      return [];
    }
  }

  async getMaterialById(id: string): Promise<GeneratedMaterial | null> {
    console.log('🔍 Getting material by ID:', id);
    try {
      const userMaterials = await userMaterialsService.getAllMaterials();
      const material = userMaterials.find(m => m.id === id);
      
      if (!material) {
        console.log('❌ Material not found:', id);
        return null;
      }
      
      console.log('✅ Material found:', material.title);
      return this.convertUserMaterialToGenerated(material);
    } catch (error) {
      console.error('❌ Error getting material by ID:', error);
      return null;
    }
  }

  async deleteMaterial(id: string): Promise<boolean> {
    console.log('🗑️ Deleting material:', id);
    try {
      const success = await userMaterialsService.deleteMaterial(id);
      if (success) {
        console.log('✅ Material deleted successfully');
      } else {
        console.log('❌ Failed to delete material');
      }
      return success;
    } catch (error) {
      console.error('❌ Error deleting material:', error);
      return false;
    }
  }

  async updateMaterial(id: string, updates: Partial<GeneratedMaterial>): Promise<boolean> {
    console.log('📝 Updating material:', id, updates);
    try {
      const userMaterialUpdates: Partial<UserMaterial> = {};
      
      if (updates.title) userMaterialUpdates.title = updates.title;
      if (updates.subject) userMaterialUpdates.subject = updates.subject;
      if (updates.grade) userMaterialUpdates.grade = updates.grade;
      if (updates.content) userMaterialUpdates.content = JSON.stringify(updates.content);
      
      const success = await userMaterialsService.updateMaterial(id, userMaterialUpdates);
      if (success) {
        console.log('✅ Material updated successfully');
      } else {
        console.log('❌ Failed to update material');
      }
      return success;
    } catch (error) {
      console.error('❌ Error updating material:', error);
      return false;
    }
  }

  private convertUserMaterialToGenerated(userMaterial: UserMaterial): GeneratedMaterial {
    let content;
    try {
      content = userMaterial.content ? JSON.parse(userMaterial.content) : {};
    } catch (error) {
      console.error('Error parsing content:', error);
      content = {};
    }

    return {
      id: userMaterial.id,
      title: userMaterial.title,
      type: userMaterial.type === 'plano-aula' ? 'plano-de-aula' : userMaterial.type,
      subject: userMaterial.subject,
      grade: userMaterial.grade,
      createdAt: userMaterial.createdAt,
      content
    };
  }

  private mapToUserMaterial(type: string, formData: MaterialFormData, content: any): Omit<UserMaterial, 'id' | 'createdAt' | 'status'> {
    // Get topic/title - handle both single topic and multiple subjects for evaluations
    const title = this.generateTitle(type, formData);
    
    // Map type correctly
    const materialType = type === 'plano-de-aula' ? 'plano-aula' : type as 'plano-aula' | 'atividade' | 'slides' | 'avaliacao';
    
    return {
      title,
      type: materialType,
      subject: formData.disciplina || formData.subject || 'Não informado',
      grade: formData.serie || formData.grade || 'Não informado',
      userId: '', // This will be set by userMaterialsService using authenticated user
      content: JSON.stringify(content)
    };
  }

  private generateTitle(type: string, formData: MaterialFormData): string {
    const typeLabels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    
    const typeLabel = typeLabels[type as keyof typeof typeLabels] || 'Material';
    
    // For evaluations with multiple subjects, join them
    if (type === 'avaliacao' && formData.assuntos && formData.assuntos.length > 0) {
      const topics = formData.assuntos.filter(s => s.trim() !== '').slice(0, 2); // Take first 2 topics
      const topicText = topics.length > 1 ? `${topics[0]} e mais` : topics[0];
      return `${typeLabel} - ${topicText}`;
    }
    
    // For other types, use the main topic
    const topic = formData.tema || formData.topic || 'Conteúdo Personalizado';
    return `${typeLabel} - ${topic}`;
  }

  private convertToGeneratedMaterial(userMaterial: UserMaterial, content: any, formData: MaterialFormData): GeneratedMaterial {
    return {
      id: userMaterial.id,
      title: userMaterial.title,
      type: userMaterial.type === 'plano-aula' ? 'plano-de-aula' : userMaterial.type,
      subject: userMaterial.subject,
      grade: userMaterial.grade,
      createdAt: userMaterial.createdAt,
      content,
      formData
    };
  }

  private async generateContentForType(type: string, formData: MaterialFormData): Promise<any> {
    console.log(`🎯 Generating ${type} content...`);
    
    // Simulate content generation based on type
    switch (type) {
      case 'plano-de-aula':
        return this.generateLessonPlanContent(formData);
      case 'slides':
        return this.generateSlidesContent(formData);
      case 'atividade':
        return this.generateActivityContent(formData);
      case 'avaliacao':
        return this.generateAssessmentContent(formData);
      default:
        throw new Error(`Tipo de material não suportado: ${type}`);
    }
  }

  private generateLessonPlanContent(formData: MaterialFormData) {
    const topic = formData.tema || formData.topic || 'Conteúdo';
    const subject = formData.disciplina || formData.subject || 'Disciplina';
    const grade = formData.serie || formData.grade || 'Série';
    const professor = formData.professor || 'Professor';
    const data = formData.data || new Date().toLocaleDateString('pt-BR');
    const duracao = formData.duracao || '50 minutos';
    const bncc = formData.bncc || 'Habilidade(s) da BNCC relacionada(s) ao tema';
    // Desenvolvimento metodológico dinâmico com variáveis
    const desenvolvimento = [
      {
        etapa: 'Introdução',
        atividade: `Apresentação do tema "${topic}" contextualizando sua importância para a disciplina de ${subject}. Pergunta disparadora para engajar os alunos e levantamento de conhecimentos prévios.`,
        tempo: '10 min',
        recursos: 'Quadro/Lousa, Projetor multimídia'
      },
      {
        etapa: 'Desenvolvimento',
        atividade: `Exposição dialogada dos principais conceitos de ${topic}, exemplos práticos, discussão em grupo e resolução de exercícios guiados.`,
        tempo: '25 min',
        recursos: 'Material impresso, Projetor multimídia'
      },
      {
        etapa: 'Prática',
        atividade: `Atividade prática: os alunos aplicam os conceitos de ${topic} em situações-problema, produção de texto, experimentos ou resolução de desafios.`,
        tempo: '10 min',
        recursos: 'Material impresso, Recursos digitais'
      },
      {
        etapa: 'Fechamento',
        atividade: `Revisão dos pontos principais sobre ${topic}, socialização das produções dos alunos, feedback coletivo e breve avaliação diagnóstica.`,
        tempo: '5 min',
        recursos: 'Quadro/Lousa, Recursos digitais'
      }
    ];
    // Gerar lista única de recursos usados em todas as etapas
    const recursosSet = new Set<string>();
    desenvolvimento.forEach(etapa => {
      etapa.recursos.split(',').map(r => r.trim()).forEach(r => recursosSet.add(r));
    });
    const recursos = Array.from(recursosSet).join(', ');
    return {
      titulo: `Plano de Aula - ${topic}`,
      cabecalho: {
        professor,
        data,
        disciplina: subject,
        serie: grade,
        tema: topic,
        duracao,
        bncc
      },
      professor,
      data,
      disciplina: subject,
      serie: grade,
      tema: topic,
      duracao,
      bncc,
      objetivos: [
        `Compreender os conceitos fundamentais sobre ${topic}`,
        `Aplicar conhecimentos de ${topic} em situações práticas`,
        `Desenvolver habilidades de análise crítica sobre o tema`
      ],
      desenvolvimento,
      recursos,
      conteudos: [
        `Introdução ao ${topic}`,
        `Conceitos principais e definições`,
        `Aplicações práticas e exemplos`,
        `Exercícios e atividades de fixação`
      ],
      metodologia: `Aula expositiva dialogada com uso de recursos visuais, seguida de atividades práticas em grupo para consolidação do aprendizado sobre ${topic}.`,
      avaliacao: `Avaliação formativa através da participação nas discussões e atividades práticas. Avaliação somativa através de exercícios sobre ${topic}.`,
      referencias: [
        'Referência bibliográfica 1',
        'Referência bibliográfica 2',
        'Recursos online complementares'
      ]
    };
  }

  private generateSlidesContent(formData: MaterialFormData) {
    const topic = formData.tema || formData.topic || 'Conteúdo';
    const subject = formData.disciplina || formData.subject || 'Disciplina';
    const grade = formData.serie || formData.grade || 'Série';
    const professor = formData.professor || 'Professor';
    const data = formData.data || new Date().toLocaleDateString('pt-BR');
    const duracao = formData.duracao || '50 minutos';
    const bncc = formData.bncc || 'Habilidade(s) da BNCC relacionada(s) ao tema';
    return {
      titulo: `Slides - ${topic}`,
      cabecalho: {
        professor,
        data,
        disciplina: subject,
        serie: grade,
        tema: topic,
        duracao,
        bncc
      },
      professor,
      data,
      disciplina: subject,
      serie: grade,
      tema: topic,
      duracao,
      bncc,
      slides: [
        {
          numero: 1,
          titulo: `${topic}`,
          conteudo: `Apresentação sobre ${topic} em ${subject}`,
          tipo: 'capa'
        },
        {
          numero: 2,
          titulo: 'Objetivos',
          conteudo: `• Compreender ${topic}\n• Aplicar conceitos na prática\n• Desenvolver pensamento crítico`,
          tipo: 'lista'
        },
        {
          numero: 3,
          titulo: 'Introdução',
          conteudo: `Conceitos fundamentais sobre ${topic} e sua importância em ${subject}.`,
          tipo: 'texto'
        },
        {
          numero: 4,
          titulo: 'Desenvolvimento',
          conteudo: `Principais aspectos e características de ${topic}.`,
          tipo: 'texto'
        },
        {
          numero: 5,
          titulo: 'Conclusão',
          conteudo: `Síntese dos principais pontos abordados sobre ${topic}.`,
          tipo: 'texto'
        }
      ]
    };
  }

  private generateActivityContent(formData: MaterialFormData) {
    const topic = formData.tema || formData.topic || 'Conteúdo';
    const subject = formData.disciplina || formData.subject || 'Disciplina';
    const grade = formData.serie || formData.grade || 'Série';
    const professor = formData.professor || 'Professor';
    const data = formData.data || new Date().toLocaleDateString('pt-BR');
    const duracao = formData.duracao || '50 minutos';
    const bncc = formData.bncc || 'Habilidade(s) da BNCC relacionada(s) ao tema';
    const questionCount = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
    const questionType = formData.tipoQuestoes || 'mistas';
    const questions = [];
    for (let i = 1; i <= questionCount; i++) {
      if (questionType === 'abertas' || (questionType === 'mistas' && i % 2 === 1)) {
        questions.push({
          numero: i,
          tipo: 'aberta',
          pergunta: `Explique os principais conceitos relacionados a ${topic}. (Questão ${i})`,
          resposta: `Esta é uma questão aberta que permite ao aluno expressar seu entendimento sobre ${topic}.`
        });
      } else {
        questions.push({
          numero: i,
          tipo: 'multipla_escolha',
          pergunta: `Qual das alternativas melhor define ${topic}? (Questão ${i})`,
          alternativas: [
            'Primeira alternativa sobre o conceito',
            'Segunda alternativa sobre o conceito',
            'Terceira alternativa sobre o conceito',
            'Quarta alternativa sobre o conceito'
          ],
          resposta_correta: 0,
          explicacao: `A resposta correta é a primeira alternativa, pois define corretamente ${topic}.`
        });
      }
    }
    return {
      titulo: `Atividade - ${topic}`,
      cabecalho: {
        professor,
        data,
        disciplina: subject,
        serie: grade,
        tema: topic,
        duracao,
        bncc
      },
      professor,
      data,
      disciplina: subject,
      serie: grade,
      tema: topic,
      duracao,
      bncc,
      instrucoes: `Complete as questões abaixo sobre ${topic}. Leia atentamente cada enunciado antes de responder.`,
      questoes: questions,
      criterios_avaliacao: [
        'Compreensão dos conceitos',
        'Clareza na expressão das ideias',
        'Aplicação correta do conhecimento'
      ]
    };
  }

  private generateAssessmentContent(formData: MaterialFormData) {
    const topic = formData.tema || formData.topic || 'Conteúdo';
    const subject = formData.disciplina || formData.subject || 'Disciplina';
    const grade = formData.serie || formData.grade || 'Série';
    const professor = formData.professor || 'Professor';
    const data = formData.data || new Date().toLocaleDateString('pt-BR');
    const duracao = formData.duracao || '50 minutos';
    const bncc = formData.bncc || 'Habilidade(s) da BNCC relacionada(s) ao tema';
    const questionCount = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
    const questionType = formData.tipoQuestoes || 'mistas';
    const questions = [];
    for (let i = 1; i <= questionCount; i++) {
      if (questionType === 'abertas' || (questionType === 'mistas' && i % 2 === 1)) {
        questions.push({
          numero: i,
          tipo: 'aberta',
          pergunta: `Explique os principais conceitos relacionados a ${topic}. (Questão ${i})`,
          resposta: `Esta é uma questão aberta que permite ao aluno expressar seu entendimento sobre ${topic}.`
        });
      } else {
        questions.push({
          numero: i,
          tipo: 'multipla_escolha',
          pergunta: `Qual das alternativas melhor define ${topic}? (Questão ${i})`,
          alternativas: [
            'Primeira alternativa sobre o conceito',
            'Segunda alternativa sobre o conceito',
            'Terceira alternativa sobre o conceito',
            'Quarta alternativa sobre o conceito'
          ],
          resposta_correta: 0,
          explicacao: `A resposta correta é a primeira alternativa, pois define corretamente ${topic}.`
        });
      }
    }
    return {
      titulo: `Avaliação - ${topic}`,
      cabecalho: {
        professor,
        data,
        disciplina: subject,
        serie: grade,
        tema: topic,
        duracao,
        bncc
      },
      professor,
      data,
      disciplina: subject,
      serie: grade,
      tema: topic,
      duracao,
      bncc,
      instrucoes: `Responda às questões abaixo sobre ${topic}.`,
      questoes: questions,
      criterios_avaliacao: [
        'Compreensão dos conceitos',
        'Clareza na expressão das ideias',
        'Aplicação correta do conhecimento'
      ]
    };
  }
}

export const materialService = new MaterialService();
