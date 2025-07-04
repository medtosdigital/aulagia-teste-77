import { userMaterialsService, UserMaterial } from './userMaterialsService';
import { supabase } from '@/integrations/supabase/client';

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
      // Generate content using OpenAI Edge Function
      console.log('🤖 Calling OpenAI Edge Function...');
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('generate-material-content', {
        body: { type, formData }
      });

      if (aiError) {
        console.error('❌ OpenAI Edge Function error:', aiError);
        throw new Error(`Erro na geração de conteúdo: ${aiError.message}`);
      }

      if (!aiResponse?.success) {
        console.error('❌ OpenAI generation failed:', aiResponse?.error);
        throw new Error(`Erro na geração de conteúdo: ${aiResponse?.error || 'Resposta inválida da IA'}`);
      }

      console.log('✅ AI content generated successfully');
      
      // Process the AI-generated content into structured format
      const generatedContent = await this.processAIContent(type, aiResponse.content, formData);
      console.log('📝 Content processed successfully');
      
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

  private async processAIContent(type: string, aiContent: string, formData: MaterialFormData): Promise<any> {
    console.log('🔄 Processing AI content for type:', type);
    
    // For now, we'll structure the AI content with basic template structure
    // This can be enhanced to parse and structure the AI content more intelligently
    
    const topic = formData.tema || formData.topic || 'Conteúdo';
    const subject = formData.disciplina || formData.subject || 'Disciplina';
    const grade = formData.serie || formData.grade || 'Série';
    const professor = formData.professor || 'Professor';
    const data = formData.data || new Date().toLocaleDateString('pt-BR');
    const duracao = formData.duracao || '50 minutos';
    const bncc = formData.bncc || 'Habilidade(s) da BNCC relacionada(s) ao tema';

    // Common header for all materials
    const cabecalho = {
      professor,
      data,
      disciplina: subject,
      serie: grade,
      tema: topic,
      duracao,
      bncc
    };

    switch (type) {
      case 'plano-de-aula':
        return {
          titulo: `Plano de Aula - ${topic}`,
          cabecalho,
          professor,
          data,
          disciplina: subject,
          serie: grade,
          tema: topic,
          duracao,
          bncc,
          conteudo_ia: aiContent, // Store the AI-generated content
          // Keep basic structure for compatibility
          objetivos: [
            `Compreender os conceitos fundamentais sobre ${topic}`,
            `Aplicar conhecimentos de ${topic} em situações práticas`,
            `Desenvolver habilidades de análise crítica sobre o tema`
          ],
          desenvolvimento: [
            {
              etapa: 'Introdução',
              atividade: `Apresentação do tema "${topic}" baseada no conteúdo gerado por IA`,
              tempo: '10 min',
              recursos: 'Quadro/Lousa, Projetor multimídia'
            },
            {
              etapa: 'Desenvolvimento',
              atividade: `Desenvolvimento do conteúdo conforme orientações da IA`,
              tempo: '25 min',
              recursos: 'Material impresso, Projetor multimídia'
            },
            {
              etapa: 'Prática',
              atividade: `Atividades práticas sugeridas pela IA`,
              tempo: '10 min',
              recursos: 'Material impresso, Recursos digitais'
            },
            {
              etapa: 'Fechamento',
              atividade: `Revisão e avaliação conforme sugestões da IA`,
              tempo: '5 min',
              recursos: 'Quadro/Lousa, Recursos digitais'
            }
          ],
          recursos: 'Quadro/Lousa, Projetor multimídia, Material impresso, Recursos digitais',
          metodologia: `Metodologia baseada nas sugestões da IA para ${topic}`,
          avaliacao: `Avaliação formativa e somativa conforme orientações da IA`,
          referencias: [
            'Referências sugeridas pela IA',
            'Base Nacional Comum Curricular (BNCC)',
            'Recursos online complementares'
          ]
        };

      case 'slides':
        return {
          titulo: `Slides - ${topic}`,
          cabecalho,
          professor,
          data,
          disciplina: subject,
          serie: grade,
          tema: topic,
          duracao,
          bncc,
          conteudo_ia: aiContent,
          slides: [
            {
              numero: 1,
              titulo: `${topic}`,
              conteudo: `Apresentação sobre ${topic} em ${subject}`,
              tipo: 'capa'
            },
            {
              numero: 2,
              titulo: 'Conteúdo Gerado por IA',
              conteudo: aiContent.substring(0, 200) + '...', // Preview of AI content
              tipo: 'texto'
            }
          ]
        };

      case 'atividade':
        return {
          titulo: `Atividade - ${topic}`,
          cabecalho,
          professor,
          data,
          disciplina: subject,
          serie: grade,
          tema: topic,
          duracao,
          bncc,
          conteudo_ia: aiContent,
          instrucoes: `Atividade gerada por IA sobre ${topic}`,
          questoes: [], // Will be populated from AI content parsing
          criterios_avaliacao: [
            'Compreensão dos conceitos',
            'Clareza na expressão das ideias',
            'Aplicação correta do conhecimento'
          ]
        };

      case 'avaliacao':
        return {
          titulo: `Avaliação - ${topic}`,
          cabecalho,
          professor,
          data,
          disciplina: subject,
          serie: grade,
          tema: topic,
          duracao,
          bncc,
          conteudo_ia: aiContent,
          instrucoes: `Avaliação gerada por IA sobre ${topic}`,
          questoes: [], // Will be populated from AI content parsing
          criterios_avaliacao: [
            'Compreensão dos conceitos',
            'Clareza na expressão das ideias',
            'Aplicação correta do conhecimento'
          ]
        };

      default:
        return {
          titulo: `Material - ${topic}`,
          cabecalho,
          conteudo_ia: aiContent
        };
    }
  }
}

export const materialService = new MaterialService();
