
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
  private getTableName(type: string): string {
    const tableMap = {
      'plano-aula': 'planos_de_aula',
      'atividade': 'atividades',
      'slides': 'slides',
      'avaliacao': 'avaliacoes'
    };
    return tableMap[type as keyof typeof tableMap] || 'atividades';
  }

  private mapFromSupabase(item: any, tableName: string): UserMaterial {
    return {
      id: item.id,
      title: item.titulo,
      type: tableName === 'planos_de_aula' ? 'plano-aula' : 
            tableName === 'atividades' ? 'atividade' :
            tableName === 'slides' ? 'slides' : 'avaliacao',
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
      const tables = ['planos_de_aula', 'atividades', 'slides', 'avaliacoes'];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Error fetching from ${table}:`, error);
          continue;
        }

        if (data) {
          const mappedData = data.map(item => this.mapFromSupabase(item, table));
          allMaterials.push(...mappedData);
        }
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
      const tableName = this.getTableName(material.type);
      const supabaseData = this.mapToSupabase(material);

      const { data, error } = await supabase
        .from(tableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        console.error('Error adding material:', error);
        return null;
      }

      return this.mapFromSupabase(data, tableName);
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
      // Try to delete from all tables since we don't know which table the material is in
      const tables = ['planos_de_aula', 'atividades', 'slides', 'avaliacoes'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id);

        if (!error) {
          return true; // Successfully deleted
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting material:', error);
      return false;
    }
  }

  async updateMaterial(id: string, updates: Partial<UserMaterial>): Promise<boolean> {
    try {
      const tables = ['planos_de_aula', 'atividades', 'slides', 'avaliacoes'];
      
      for (const table of tables) {
        // First check if the material exists in this table
        const { data: existing } = await supabase
          .from(table)
          .select('id')
          .eq('id', id)
          .single();

        if (existing) {
          // Update the material in this table
          const updateData: any = {};
          
          if (updates.title) updateData.titulo = updates.title;
          if (updates.content) updateData.conteudo = updates.content;
          if (updates.subject) updateData.disciplina = updates.subject;
          if (updates.grade) updateData.serie = updates.grade;

          const { error } = await supabase
            .from(table)
            .update(updateData)
            .eq('id', id);

          return !error;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error updating material:', error);
      return false;
    }
  }

  // Função para inicializar alguns materiais de exemplo se não existirem
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
