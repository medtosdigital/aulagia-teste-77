
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
    
    return {
      titulo: `Plano de Aula - ${topic}`,
      disciplina: subject,
      serie: grade,
      objetivos: [
        `Compreender os conceitos fundamentais sobre ${topic}`,
        `Aplicar conhecimentos de ${topic} em situações práticas`,
        `Desenvolver habilidades de análise crítica sobre o tema`
      ],
      conteudos: [
        `Introdução ao ${topic}`,
        `Conceitos principais e definições`,
        `Aplicações práticas e exemplos`,
        `Exercícios e atividades de fixação`
      ],
      metodologia: `Aula expositiva dialogada com uso de recursos visuais, seguida de atividades práticas em grupo para consolidação do aprendizado sobre ${topic}.`,
      recursos: [
        'Quadro/Lousa',
        'Projetor multimídia',
        'Material impresso',
        'Recursos digitais'
      ],
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
    
    return {
      titulo: `Slides - ${topic}`,
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
    const subjects = formData.assuntos || formData.subjects || ['Conteúdo'];
    const validSubjects = subjects.filter(s => s.trim() !== '');
    const questionCount = formData.numeroQuestoes || formData.quantidadeQuestoes || 5;
    const questionType = formData.tipoQuestoes || 'mistas';
    
    const questions = [];
    for (let i = 1; i <= questionCount; i++) {
      const currentSubject = validSubjects[(i - 1) % validSubjects.length];
      
      if (questionType === 'abertas' || (questionType === 'mistas' && i % 2 === 1)) {
        questions.push({
          numero: i,
          tipo: 'aberta',
          assunto: currentSubject,
          pergunta: `Analise e explique os principais aspectos de ${currentSubject}. (Questão ${i})`,
          criterios: [
            'Domínio do conteúdo',
            'Clareza na explicação',
            'Uso correto da terminologia'
          ],
          valor: Math.round(10 / questionCount * 10) / 10
        });
      } else {
        questions.push({
          numero: i,
          tipo: 'multipla_escolha',
          assunto: currentSubject,
          pergunta: `Em relação a ${currentSubject}, qual alternativa está correta? (Questão ${i})`,
          alternativas: [
            `Primera afirmação sobre ${currentSubject}`,
            `Segunda afirmação sobre ${currentSubject}`,
            `Terceira afirmação sobre ${currentSubject}`,
            `Quarta afirmação sobre ${currentSubject}`
          ],
          resposta_correta: 0,
          valor: Math.round(10 / questionCount * 10) / 10
        });
      }
    }
    
    return {
      titulo: `Avaliação - ${validSubjects.join(', ')}`,
      instrucoes: 'Leia atentamente cada questão antes de responder. Esta avaliação tem como objetivo verificar sua compreensão dos conteúdos estudados.',
      questoes: questions,
      tempo_estimado: '50 minutos',
      valor_total: 10,
      criterios_avaliacao: [
        'Domínio do conteúdo (40%)',
        'Clareza e organização (30%)',
        'Aplicação prática (30%)'
      ]
    };
  }
}

export const materialService = new MaterialService();
