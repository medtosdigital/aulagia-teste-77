
import { supabase } from '@/integrations/supabase/client';

export interface UserMaterial {
  id: string;
  title: string;
  type: 'plano-aula' | 'atividade' | 'slides' | 'avaliacao';
  subject: string;
  grade: string;
  createdAt: string;
  status: 'completed' | 'draft';
  userId: string;
  content?: string;
}

class UserMaterialsService {
  private mapFromSupabase(item: any, type: string): UserMaterial {
    return {
      id: item.id,
      title: item.titulo,
      type: type as 'plano-aula' | 'atividade' | 'slides' | 'avaliacao',
      subject: item.disciplina || 'Não informado',
      grade: item.serie || 'Não informado',
      createdAt: item.data_criacao?.split('T')[0] || new Date().toISOString().split('T')[0],
      status: 'completed' as const,
      userId: item.user_id,
      content: item.conteudo
    };
  }

  private mapToSupabase(material: Omit<UserMaterial, 'id' | 'createdAt' | 'status'>) {
    return {
      titulo: material.title,
      tipo_material: material.type,
      conteudo: material.content || '',
      disciplina: material.subject,
      serie: material.grade,
      user_id: material.userId
    };
  }

  async getMaterialsByUser(userId: string): Promise<UserMaterial[]> {
    try {
      const allMaterials: UserMaterial[] = [];

      // Buscar planos de aula
      const { data: planosData, error: planosError } = await supabase
        .from('planos_de_aula')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!planosError && planosData) {
        const mappedPlanos = planosData.map(item => this.mapFromSupabase(item, 'plano-aula'));
        allMaterials.push(...mappedPlanos);
      }

      // Buscar atividades
      const { data: atividadesData, error: atividadesError } = await supabase
        .from('atividades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!atividadesError && atividadesData) {
        const mappedAtividades = atividadesData.map(item => this.mapFromSupabase(item, 'atividade'));
        allMaterials.push(...mappedAtividades);
      }

      // Buscar slides
      const { data: slidesData, error: slidesError } = await supabase
        .from('slides')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!slidesError && slidesData) {
        const mappedSlides = slidesData.map(item => this.mapFromSupabase(item, 'slides'));
        allMaterials.push(...mappedSlides);
      }

      // Buscar avaliações
      const { data: avaliacoesData, error: avaliacoesError } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!avaliacoesError && avaliacoesData) {
        const mappedAvaliacoes = avaliacoesData.map(item => this.mapFromSupabase(item, 'avaliacao'));
        allMaterials.push(...mappedAvaliacoes);
      }

      // Sort by creation date
      return allMaterials.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting materials:', error);
      return [];
    }
  }

  async addMaterial(material: Omit<UserMaterial, 'id' | 'createdAt' | 'status'>): Promise<UserMaterial | null> {
    try {
      const supabaseData = this.mapToSupabase(material);

      if (material.type === 'plano-aula') {
        const { data, error } = await supabase
          .from('planos_de_aula')
          .insert([supabaseData])
          .select()
          .single();

        if (error) {
          console.error('Error adding plano de aula:', error);
          return null;
        }

        return this.mapFromSupabase(data, 'plano-aula');
      } else if (material.type === 'atividade') {
        const { data, error } = await supabase
          .from('atividades')
          .insert([supabaseData])
          .select()
          .single();

        if (error) {
          console.error('Error adding atividade:', error);
          return null;
        }

        return this.mapFromSupabase(data, 'atividade');
      } else if (material.type === 'slides') {
        const { data, error } = await supabase
          .from('slides')
          .insert([supabaseData])
          .select()
          .single();

        if (error) {
          console.error('Error adding slides:', error);
          return null;
        }

        return this.mapFromSupabase(data, 'slides');
      } else if (material.type === 'avaliacao') {
        const { data, error } = await supabase
          .from('avaliacoes')
          .insert([supabaseData])
          .select()
          .single();

        if (error) {
          console.error('Error adding avaliacao:', error);
          return null;
        }

        return this.mapFromSupabase(data, 'avaliacao');
      }

      return null;
    } catch (error) {
      console.error('Error adding material:', error);
      return null;
    }
  }

  async getAllMaterials(): Promise<UserMaterial[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      return await this.getMaterialsByUser(user.id);
    } catch (error) {
      console.error('Error getting all materials:', error);
      return [];
    }
  }

  async deleteMaterial(id: string): Promise<boolean> {
    try {
      // Try to delete from planos_de_aula
      const { error: planosError } = await supabase
        .from('planos_de_aula')
        .delete()
        .eq('id', id);

      if (!planosError) {
        return true;
      }

      // Try to delete from atividades
      const { error: atividadesError } = await supabase
        .from('atividades')
        .delete()
        .eq('id', id);

      if (!atividadesError) {
        return true;
      }

      // Try to delete from slides
      const { error: slidesError } = await supabase
        .from('slides')
        .delete()
        .eq('id', id);

      if (!slidesError) {
        return true;
      }

      // Try to delete from avaliacoes
      const { error: avaliacoesError } = await supabase
        .from('avaliacoes')
        .delete()
        .eq('id', id);

      if (!avaliacoesError) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting material:', error);
      return false;
    }
  }

  async updateMaterial(id: string, updates: Partial<UserMaterial>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.titulo = updates.title;
      if (updates.content) updateData.conteudo = updates.content;
      if (updates.subject) updateData.disciplina = updates.subject;
      if (updates.grade) updateData.serie = updates.grade;

      // Try to update in planos_de_aula
      const { data: planosData } = await supabase
        .from('planos_de_aula')
        .select('id')
        .eq('id', id)
        .single();

      if (planosData) {
        const { error } = await supabase
          .from('planos_de_aula')
          .update(updateData)
          .eq('id', id);

        return !error;
      }

      // Try to update in atividades
      const { data: atividadesData } = await supabase
        .from('atividades')
        .select('id')
        .eq('id', id)
        .single();

      if (atividadesData) {
        const { error } = await supabase
          .from('atividades')
          .update(updateData)
          .eq('id', id);

        return !error;
      }

      // Try to update in slides
      const { data: slidesData } = await supabase
        .from('slides')
        .select('id')
        .eq('id', id)
        .single();

      if (slidesData) {
        const { error } = await supabase
          .from('slides')
          .update(updateData)
          .eq('id', id);

        return !error;
      }

      // Try to update in avaliacoes
      const { data: avaliacoesData } = await supabase
        .from('avaliacoes')
        .select('id')
        .eq('id', id)
        .single();

      if (avaliacoesData) {
        const { error } = await supabase
          .from('avaliacoes')
          .update(updateData)
          .eq('id', id);

        return !error;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating material:', error);
      return false;
    }
  }

  async initializeSampleMaterials(userId: string): Promise<void> {
    try {
      const existingMaterials = await this.getMaterialsByUser(userId);
      
      if (existingMaterials.length === 0) {
        const sampleMaterials = [
          {
            title: 'Plano de Aula - Frações',
            type: 'plano-aula' as const,
            subject: 'Matemática',
            grade: '6º ano',
            userId: userId,
            content: 'Conteúdo do plano de aula sobre frações...'
          },
          {
            title: 'Atividade - Operações Básicas',
            type: 'atividade' as const,
            subject: 'Matemática',
            grade: '6º ano',
            userId: userId,
            content: 'Lista de exercícios sobre operações básicas...'
          },
          {
            title: 'Slides - Geometria Básica',
            type: 'slides' as const,
            subject: 'Matemática',
            grade: '7º ano',
            userId: userId,
            content: 'Apresentação sobre geometria básica...'
          }
        ];

        for (const material of sampleMaterials) {
          await this.addMaterial(material);
        }
      }
    } catch (error) {
      console.error('Error initializing sample materials:', error);
    }
  }
}

export const userMaterialsService = new UserMaterialsService();
