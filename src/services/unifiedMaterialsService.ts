
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
  templateUsed?: string;
  // Campos específicos de planos de aula
  startPeriod?: string;
  endPeriod?: string;
  weekDays?: string[];
  months?: any;
  weeks?: any;
  evaluations?: number;
  observations?: string;
  // Campos específicos de materiais de apoio
  mainMaterialId?: string;
  theme?: string;
  classroom?: string;
}

class UnifiedMaterialsService {
  private async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }
      
      if (!user) {
        console.log('No authenticated user found');
        return null;
      }

      // Verificar se o usuário tem uma sessão válida
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session.session) {
        console.error('No valid session found:', sessionError);
        return null;
      }

      console.log('Valid user session found:', user.id);
      return user;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  private mapFromSupabase(item: any): UnifiedMaterial {
    return {
      id: item.id,
      title: item.titulo,
      type: item.tipo_material,
      subject: item.disciplina || 'Não informado',
      grade: item.serie || 'Não informado',
      createdAt: item.data_criacao?.split('T')[0] || new Date().toISOString().split('T')[0],
      status: item.status || 'ativo',
      userId: item.user_id,
      content: item.conteudo,
      templateUsed: item.template_usado,
      startPeriod: item.periodo_inicio,
      endPeriod: item.periodo_fim,
      weekDays: item.dias_semana,
      months: item.meses,
      weeks: item.semanas,
      evaluations: item.avaliacoes,
      observations: item.observacoes,
      mainMaterialId: item.material_principal_id,
      theme: item.tema,
      classroom: item.turma
    };
  }

  private mapToSupabase(material: Omit<UnifiedMaterial, 'id' | 'createdAt' | 'status'>) {
    return {
      titulo: material.title,
      tipo_material: material.type,
      conteudo: material.content || '',
      disciplina: material.subject,
      serie: material.grade,
      user_id: material.userId,
      template_usado: material.templateUsed,
      periodo_inicio: material.startPeriod,
      periodo_fim: material.endPeriod,
      dias_semana: material.weekDays,
      meses: material.months,
      semanas: material.weeks,
      avaliacoes: material.evaluations,
      observacoes: material.observations,
      material_principal_id: material.mainMaterialId,
      tema: material.theme,
      turma: material.classroom
    };
  }

  async getMaterialsByUser(): Promise<UnifiedMaterial[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }

      console.log('Loading materials for authenticated user:', user.id);

      // Verificar se o usuário tem perfil na tabela perfis
      const { data: profile, error: profileError } = await supabase
        .from('perfis')
        .select('user_id, plano_ativo')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking user profile:', profileError);
        return [];
      }

      console.log('User profile found:', profile);

      const { data, error } = await supabase
        .from('materiais')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading materials:', error);
        // Se for erro de permissão, tentar sem RLS
        if (error.code === '42501' || error.message.includes('permission')) {
          console.log('Permission error detected, trying alternative query...');
          const { data: altData, error: altError } = await supabase
            .from('materiais')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (altError) {
            console.error('Alternative query also failed:', altError);
            return [];
          }
          
          if (!altData) {
            console.log('No materials found with alternative query');
            return [];
          }
          
          const materials = altData.map(item => this.mapFromSupabase(item));
          console.log('Total materials loaded with alternative query:', materials.length);
          return materials;
        }
        return [];
      }

      if (!data) {
        console.log('No materials found');
        return [];
      }

      const materials = data.map(item => this.mapFromSupabase(item));
      console.log('Total materials loaded:', materials.length);
      return materials;
    } catch (error) {
      console.error('Error getting materials:', error);
      return [];
    }
  }

  async addMaterial(material: Omit<UnifiedMaterial, 'id' | 'createdAt' | 'status'>): Promise<UnifiedMaterial | null> {
    try {
      console.log('🚀 Starting addMaterial process');
      console.log('📋 Input material data:', {
        title: material.title,
        type: material.type,
        subject: material.subject,
        grade: material.grade,
        contentLength: material.content?.length || 0
      });
      
      const user = await this.getCurrentUser();
      if (!user) {
        console.error('❌ User must be authenticated to add material');
        throw new Error('Usuário deve estar logado para salvar material');
      }

      console.log('✅ Authenticated user found:', user.id);

      if (!material.title?.trim()) {
        console.error('❌ Material title is required');
        throw new Error('Título do material é obrigatório');
      }

      if (!material.type) {
        console.error('❌ Material type is required');
        throw new Error('Tipo do material é obrigatório');
      }

      const materialWithUser = { ...material, userId: user.id };
      const supabaseData = this.mapToSupabase(materialWithUser);

      console.log('💾 Inserting into materiais table');

      const { data, error } = await supabase
        .from('materiais')
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        console.error(`❌ Error adding material:`, error);
        throw new Error(`Erro ao salvar material: ${error.message}`);
      }

      if (!data) {
        console.error('❌ No data returned from insert');
        throw new Error('Nenhum dado retornado após inserção');
      }

      console.log('✅ Material saved successfully:', data.id);
      const savedMaterial = this.mapFromSupabase(data);
      return savedMaterial;
    } catch (error) {
      console.error('❌ Error in addMaterial:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro interno ao salvar material');
    }
  }

  async updateMaterial(id: string, updates: Partial<UnifiedMaterial>): Promise<boolean> {
    console.log('🔧 UnifiedMaterialsService.updateMaterial: Starting update');
    
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.error('❌ User must be authenticated to update material');
        return false;
      }

      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.titulo = updates.title;
      if (updates.subject !== undefined) updateData.disciplina = updates.subject;
      if (updates.grade !== undefined) updateData.serie = updates.grade;
      if (updates.type !== undefined) updateData.tipo_material = updates.type;
      if (updates.content !== undefined) updateData.conteudo = updates.content;
      if (updates.templateUsed !== undefined) updateData.template_usado = updates.templateUsed;
      if (updates.startPeriod !== undefined) updateData.periodo_inicio = updates.startPeriod;
      if (updates.endPeriod !== undefined) updateData.periodo_fim = updates.endPeriod;
      if (updates.weekDays !== undefined) updateData.dias_semana = updates.weekDays;
      if (updates.months !== undefined) updateData.meses = updates.months;
      if (updates.weeks !== undefined) updateData.semanas = updates.weeks;
      if (updates.evaluations !== undefined) updateData.avaliacoes = updates.evaluations;
      if (updates.observations !== undefined) updateData.observacoes = updates.observations;
      if (updates.mainMaterialId !== undefined) updateData.material_principal_id = updates.mainMaterialId;
      if (updates.theme !== undefined) updateData.tema = updates.theme;
      if (updates.classroom !== undefined) updateData.turma = updates.classroom;

      console.log('💾 Executing update in materiais table');
      
      const { error } = await supabase
        .from('materiais')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id); // Adicionar filtro por usuário

      if (!error) {
        console.log('✅ Material updated successfully');
        return true;
      } else {
        console.error('❌ Error updating material:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Exception in updateMaterial:', error);
      return false;
    }
  }

  async deleteMaterial(id: string): Promise<boolean> {
    try {
      console.log('Deleting material with id:', id);

      const user = await this.getCurrentUser();
      if (!user) {
        console.error('User must be authenticated to delete material');
        return false;
      }

      const { error } = await supabase
        .from('materiais')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Adicionar filtro por usuário

      if (error) {
        console.error('Erro ao excluir material:', error.message);
        return false;
      }

      console.log('Material excluído com sucesso');
      return true;
    } catch (error) {
      console.error('Error deleting material:', error);
      return false;
    }
  }

  async getMaterialById(id: string): Promise<UnifiedMaterial | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('No authenticated user found');
        return null;
      }

      const { data, error } = await supabase
        .from('materiais')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id) // Adicionar filtro por usuário
        .single();

      if (error || !data) {
        console.log('Material not found:', id);
        return null;
      }

      return this.mapFromSupabase(data);
    } catch (error) {
      console.error('Error getting material by ID:', error);
      return null;
    }
  }
}

export const unifiedMaterialsService = new UnifiedMaterialsService();
