
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedMaterial {
  id: string;
  title: string;
  type: 'plano-de-aula' | 'atividade' | 'slides' | 'avaliacao' | 'apoio';
  subject: string;
  grade: string;
  createdAt: string;
  status: 'ativo' | 'inativo';
  userId: string;
  content?: string;
}

class UnifiedMaterialsService {
  // Mapear dados do banco para o formato UnifiedMaterial
  private mapFromDatabase(data: any): UnifiedMaterial {
    return {
      id: data.id,
      title: data.titulo,
      type: data.tipo_material as any,
      subject: data.disciplina || '',
      grade: data.serie || '',
      createdAt: data.created_at,
      status: data.status === 'ativo' ? 'ativo' : 'inativo',
      userId: data.user_id,
      content: data.conteudo
    };
  }

  // Mapear dados do formato UnifiedMaterial para o banco
  private mapToDatabase(material: Omit<UnifiedMaterial, 'id' | 'createdAt' | 'status'>): any {
    return {
      titulo: material.title,
      tipo_material: material.type,
      disciplina: material.subject,
      serie: material.grade,
      user_id: material.userId,
      conteudo: material.content || '',
      status: 'ativo'
    };
  }

  // Buscar materiais do usuário atual
  async getMaterialsByUser(): Promise<UnifiedMaterial[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado');
        return [];
      }

      const { data, error } = await supabase
        .from('materiais')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar materiais:', error);
        return [];
      }

      return (data || []).map(item => this.mapFromDatabase(item));
    } catch (error) {
      console.error('Erro em getMaterialsByUser:', error);
      return [];
    }
  }

  // Buscar materiais de um usuário específico (para admin/grupo escolar)
  async getMaterialsByUserId(userId: string): Promise<UnifiedMaterial[]> {
    try {
      const { data, error } = await supabase
        .from('materiais')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar materiais do usuário:', error);
        return [];
      }

      return (data || []).map(item => this.mapFromDatabase(item));
    } catch (error) {
      console.error('Erro em getMaterialsByUserId:', error);
      return [];
    }
  }

  // Adicionar novo material
  async addMaterial(material: Omit<UnifiedMaterial, 'id' | 'createdAt' | 'status'>): Promise<UnifiedMaterial | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado');
        return null;
      }

      const dbMaterial = this.mapToDatabase(material);
      
      const { data, error } = await supabase
        .from('materiais')
        .insert(dbMaterial)
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar material:', error);
        return null;
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      console.error('Erro em addMaterial:', error);
      return null;
    }
  }

  // Atualizar material
  async updateMaterial(id: string, updates: Partial<UnifiedMaterial>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado');
        return false;
      }

      const dbUpdates: any = {};
      if (updates.title) dbUpdates.titulo = updates.title;
      if (updates.subject) dbUpdates.disciplina = updates.subject;
      if (updates.grade) dbUpdates.serie = updates.grade;
      if (updates.type) dbUpdates.tipo_material = updates.type;
      if (updates.content) dbUpdates.conteudo = updates.content;

      const { error } = await supabase
        .from('materiais')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar material:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro em updateMaterial:', error);
      return false;
    }
  }

  // Deletar material
  async deleteMaterial(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado');
        return false;
      }

      const { error } = await supabase
        .from('materiais')
        .update({ status: 'inativo' })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar material:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro em deleteMaterial:', error);
      return false;
    }
  }

  // Buscar material por ID
  async getMaterialById(id: string): Promise<UnifiedMaterial | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado');
        return null;
      }

      const { data, error } = await supabase
        .from('materiais')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar material por ID:', error);
        return null;
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      console.error('Erro em getMaterialById:', error);
      return null;
    }
  }
}

export const unifiedMaterialsService = new UnifiedMaterialsService();
