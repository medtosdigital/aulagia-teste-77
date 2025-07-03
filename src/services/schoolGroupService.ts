
import { supabase } from '@/integrations/supabase/client';

export interface GrupoEscolar {
  id: string;
  owner_id: string;
  nome_grupo: string;
  created_at: string;
  updated_at: string;
}

export interface MembroGrupoEscolar {
  id: string;
  grupo_id: string;
  user_id: string;
  limite_materiais: number;
  status: 'ativo' | 'pendente' | 'inativo';
  convite_enviado_em?: string;
  aceito_em?: string;
  created_at: string;
  updated_at: string;
  // Dados do usuário (join com profiles)
  user_profile?: {
    full_name?: string;
    email?: string;
  };
}

class SchoolGroupService {
  // Criar grupo escolar
  async createSchoolGroup(nome_grupo: string): Promise<GrupoEscolar | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) return null;

      const { data, error } = await supabase
        .from('grupos_escolares')
        .insert([{ nome_grupo, owner_id: userData.user.id }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar grupo escolar:', error);
        return null;
      }

      // O trigger automaticamente adiciona o proprietário como membro
      console.log('Grupo escolar criado e proprietário adicionado automaticamente como membro');
      return data;
    } catch (error) {
      console.error('Erro ao criar grupo escolar:', error);
      return null;
    }
  }

  // Obter grupo escolar do usuário
  async getUserSchoolGroup(): Promise<GrupoEscolar | null> {
    try {
      const { data, error } = await supabase
        .from('grupos_escolares')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum grupo encontrado
          return null;
        }
        console.error('Erro ao buscar grupo escolar:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar grupo escolar:', error);
      return null;
    }
  }

  // Adicionar membro ao grupo (apenas para não-proprietários)
  async addMemberToGroup(
    grupo_id: string, 
    email: string, 
    limite_materiais: number = 60
  ): Promise<boolean> {
    try {
      // Primeiro, verificar se o usuário existe
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        console.error('Usuário não encontrado:', email);
        return false;
      }

      // Verificar se não é o proprietário do grupo
      const { data: grupo, error: grupoError } = await supabase
        .from('grupos_escolares')
        .select('owner_id')
        .eq('id', grupo_id)
        .single();

      if (grupoError || !grupo) {
        console.error('Grupo não encontrado');
        return false;
      }

      if (grupo.owner_id === profile.id) {
        console.error('Não é possível adicionar o proprietário novamente como membro');
        return false;
      }

      // Adicionar como membro
      const { error } = await supabase
        .from('membros_grupo_escolar')
        .insert([{
          grupo_id,
          user_id: profile.id,
          limite_materiais,
          status: 'ativo',
          aceito_em: new Date().toISOString()
        }]);

      if (error) {
        console.error('Erro ao adicionar membro:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      return false;
    }
  }

  // Obter membros do grupo (incluindo o proprietário)
  async getGroupMembers(grupo_id: string): Promise<MembroGrupoEscolar[]> {
    try {
      const { data, error } = await supabase
        .from('membros_grupo_escolar')
        .select(`
          *,
          user_profile:profiles!membros_grupo_escolar_user_id_fkey (
            full_name,
            email
          )
        `)
        .eq('grupo_id', grupo_id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar membros:', error);
        return [];
      }

      return (data || []) as MembroGrupoEscolar[];
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      return [];
    }
  }

  // Atualizar limite de materiais de um membro
  async updateMemberLimit(membro_id: string, limite_materiais: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('membros_grupo_escolar')
        .update({ limite_materiais })
        .eq('id', membro_id);

      if (error) {
        console.error('Erro ao atualizar limite:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar limite:', error);
      return false;
    }
  }

  // Remover membro do grupo (não permite remover o proprietário)
  async removeMemberFromGroup(membro_id: string): Promise<boolean> {
    try {
      // Verificar se não é o proprietário antes de remover
      const { data: membro, error: membroError } = await supabase
        .from('membros_grupo_escolar')
        .select(`
          user_id,
          grupos_escolares!inner(owner_id)
        `)
        .eq('id', membro_id)
        .single();

      if (membroError || !membro) {
        console.error('Membro não encontrado');
        return false;
      }

      // Verificar se é o proprietário
      const grupo = membro.grupos_escolares as any;
      if (grupo.owner_id === membro.user_id) {
        console.error('Não é possível remover o proprietário do grupo');
        return false;
      }

      const { error } = await supabase
        .from('membros_grupo_escolar')
        .delete()
        .eq('id', membro_id);

      if (error) {
        console.error('Erro ao remover membro:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      return false;
    }
  }

  // Distribuir limites igualmente
  async distributeEqually(grupo_id: string, total_limit: number = 300): Promise<boolean> {
    try {
      // Buscar todos os membros
      const members = await this.getGroupMembers(grupo_id);
      
      if (members.length === 0) return false;

      const limit_per_member = Math.floor(total_limit / members.length);
      
      // Atualizar todos os membros
      const promises = members.map(member => 
        this.updateMemberLimit(member.id, limit_per_member)
      );

      const results = await Promise.all(promises);
      return results.every(result => result);
    } catch (error) {
      console.error('Erro ao distribuir igualmente:', error);
      return false;
    }
  }

  // Obter estatísticas do grupo
  async getGroupStats(grupo_id: string) {
    try {
      const members = await this.getGroupMembers(grupo_id);
      
      const totalMembers = members.length;
      const activeMembers = members.filter(m => m.status === 'ativo').length;
      const totalLimitUsed = members.reduce((sum, m) => sum + m.limite_materiais, 0);
      const remainingLimit = 300 - totalLimitUsed;

      return {
        totalMembers,
        activeMembers,
        totalLimitUsed,
        remainingLimit,
        members
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        totalLimitUsed: 0,
        remainingLimit: 300,
        members: []
      };
    }
  }
}

export const schoolGroupService = new SchoolGroupService();
