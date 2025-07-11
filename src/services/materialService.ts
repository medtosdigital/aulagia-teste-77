
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

// Updated LessonPlan interface to match what components expect
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
  conteudosProgramaticos: string[];
  metodologia: string;
  avaliacao: string;
  referencias: string[];
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
    imagem?: string;
    icones?: string[];
    grafico?: any;
    figuraGeometrica?: any;
    colunaA?: string[];
    colunaB?: string[];
    textoComLacunas?: string;
    linhasResposta?: number;
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
    imagem?: string;
    icones?: string[];
    grafico?: any;
    figuraGeometrica?: any;
    colunaA?: string[];
    colunaB?: string[];
    textoComLacunas?: string;
    linhasResposta?: number;
  }>;
  htmlContent?: string;
}

class MaterialService {
  async generateMaterial(type: string, formData: MaterialFormData): Promise<GeneratedMaterial> {
    console.log('🚀 Starting material generation with OpenAI:', { type, formData });
    
    try {
      // Call the Supabase Edge Function to generate content with OpenAI
      console.log('📞 Calling gerarMaterialIA Edge Function...');
      const { data, error } = await supabase.functions.invoke('gerarMaterialIA', {
        body: {
          materialType: type,
          formData
        }
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        throw new Error(`Erro ao gerar conteúdo: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('❌ Invalid response from Edge Function:', data);
        throw new Error('Resposta inválida do serviço de geração');
      }

      console.log('✅ Content generated successfully with OpenAI');
      let generatedContent = data.content;
      
      // Se for slides, gerar imagens para os prompts definidos
      if (type === 'slides' && generatedContent) {
        console.log('🎨 Starting image generation for slides...');
        generatedContent = await this.generateImagesForSlides(generatedContent);
      }
      
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

  private async generateImagesForSlides(slidesContent: any): Promise<any> {
    console.log('🎨 Generating images for slides...');
    
    // Lista de campos de imagem nos slides com suas prioridades
    const imageFields = [
      'tema_imagem',          // Slide 1 - Capa (alta prioridade)
      'introducao_imagem',    // Slide 3 - Introdução
      'conceitos_imagem',     // Slide 4 - Conceitos
      'desenvolvimento_1_imagem', // Slide 5
      'desenvolvimento_2_imagem', // Slide 6
      'desenvolvimento_3_imagem', // Slide 7
      'desenvolvimento_4_imagem', // Slide 8
      'exemplo_imagem'        // Slide 9 - Exemplo prático
    ];

    const updatedContent = { ...slidesContent };

    for (const field of imageFields) {
      const prompt = slidesContent[field];
      if (prompt && typeof prompt === 'string' && prompt.trim() !== '') {
        try {
          console.log(`🎨 Generating image for ${field}:`, prompt);
          
          const { data, error } = await supabase.functions.invoke('gerarImagemIA', {
            body: { prompt: prompt.trim() }
          });

          if (error) {
            console.error(`❌ Error generating image for ${field}:`, error);
            continue; // Continua para a próxima imagem
          }

          if (data?.success && data?.imageUrl) {
            updatedContent[field + '_url'] = data.imageUrl;
            console.log(`✅ Image generated for ${field}:`, data.imageUrl);
          } else {
            console.warn(`⚠️ No image URL returned for ${field}`);
          }

          // Pequeno delay entre chamadas para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Exception generating image for ${field}:`, error);
          continue; // Continua para a próxima imagem mesmo se uma falhar
        }
      }
    }

    console.log('🎨 Image generation completed for slides');
    return updatedContent;
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
      if (updates.type) userMaterialUpdates.type = updates.type === 'plano-de-aula' ? 'plano-aula' : updates.type;
      // Garantir que o campo type sempre seja enviado
      if (!userMaterialUpdates.type && updates.type) {
        userMaterialUpdates.type = updates.type === 'plano-de-aula' ? 'plano-aula' : updates.type;
      }
      console.log('Enviando para userMaterialsService.updateMaterial:', id, userMaterialUpdates);
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
}

export const materialService = new MaterialService();
