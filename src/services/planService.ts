import { supabase } from '@/integrations/supabase/client';

export interface PerfilUsuario {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  plano_ativo: 'gratuito' | 'professor' | 'grupo_escolar';
  billing_type: string;
  status_plano: string;
  data_inicio_plano: string;
  data_expiracao_plano: string;
  materiais_criados_mes_atual: number;
  ano_atual: number;
  mes_atual: number;
  ultimo_reset_materiais: string;
  created_at: string;
  updated_at: string;
  // Campos opcionais que podem não estar presentes
  customer_id?: string;
  subscription_id?: string;
  avatar_url?: string;
  nome_preferido?: string;
  etapas_ensino?: string[];
  disciplinas?: string[];
  anos_serie?: string[];
  tipo_material_favorito?: string[];
  preferencia_bncc?: boolean;
  forma_pagamento?: string;
  ultima_renovacao?: string;
  plano_id?: number;
  celular?: string;
  escola?: string;
}

export interface Usage {
  id: number;
  user_id: string;
  data: string;
  materiais_criados: number;
}

class PlanService {
  async getUsage(): Promise<Usage | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Obter a data de hoje no formato 'YYYY-MM-DD'
      const today = new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('uso_materiais')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', today)
        .single();

      if (error) {
        console.error('Erro ao buscar uso:', error);
        return null;
      }

      return data as Usage;
    } catch (error) {
      console.error('Erro em getUsage:', error);
      return null;
    }
  }

  async incrementMaterialCount(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Obter a data de hoje no formato 'YYYY-MM-DD'
      const today = new Date().toISOString().slice(0, 10);

      // Verificar se já existe um registro para o dia atual
      const existingUsage = await this.getUsage();

      if (existingUsage) {
        // Se existir, atualizar o número de materiais criados
        const { error } = await supabase
          .from('uso_materiais')
          .update({ materiais_criados: existingUsage.materiais_criados + 1 })
          .eq('id', existingUsage.id);

        if (error) {
          console.error('Erro ao atualizar uso:', error);
          return false;
        }
      } else {
        // Se não existir, criar um novo registro
        const { error } = await supabase
          .from('uso_materiais')
          .insert([{ user_id: user.id, data: today, materiais_criados: 1 }]);

        if (error) {
          console.error('Erro ao inserir uso:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erro em incrementMaterialCount:', error);
      return false;
    }
  }

  async getUserProfile(): Promise<PerfilUsuario | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      // Mapear os dados recebidos para o tipo PerfilUsuario
      const perfil: PerfilUsuario = {
        id: data.id,
        user_id: data.user_id,
        email: data.email || '',
        full_name: data.full_name || '',
        plano_ativo: data.plano_ativo || 'gratuito',
        billing_type: data.billing_type || '',
        status_plano: data.status_plano || 'ativo',
        data_inicio_plano: data.data_inicio_plano || '',
        data_expiracao_plano: data.data_expiracao_plano || '',
        materiais_criados_mes_atual: data.materiais_criados_mes_atual || 0,
        ano_atual: data.ano_atual || new Date().getFullYear(),
        mes_atual: data.mes_atual || new Date().getMonth() + 1,
        ultimo_reset_materiais: data.ultimo_reset_materiais || '',
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
        // Campos opcionais
        customer_id: data.customer_id,
        subscription_id: data.subscription_id,
        avatar_url: data.avatar_url,
        nome_preferido: data.nome_preferido,
        etapas_ensino: data.etapas_ensino,
        disciplinas: data.disciplinas,
        anos_serie: data.anos_serie,
        tipo_material_favorito: data.tipo_material_favorito,
        preferencia_bncc: data.preferencia_bncc,
        forma_pagamento: data.forma_pagamento,
        ultima_renovacao: data.ultima_renovacao,
        plano_id: data.plano_id,
        celular: data.celular,
        escola: data.escola
      };

      return perfil;
    } catch (error) {
      console.error('Erro em getUserProfile:', error);
      return null;
    }
  }

  async updateProfile(updates: Partial<PerfilUsuario>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Mapear os campos que podem ser atualizados
      const dbUpdates: any = {};
      if (updates.full_name) dbUpdates.full_name = updates.full_name;
      if (updates.nome_preferido) dbUpdates.nome_preferido = updates.nome_preferido;
      if (updates.avatar_url) dbUpdates.avatar_url = updates.avatar_url;
      if (updates.etapas_ensino) dbUpdates.etapas_ensino = updates.etapas_ensino;
      if (updates.disciplinas) dbUpdates.disciplinas = updates.disciplinas;
      if (updates.anos_serie) dbUpdates.anos_serie = updates.anos_serie;
       if (updates.celular) dbUpdates.celular = updates.celular;
       if (updates.escola) dbUpdates.escola = updates.escola;

      const { error } = await supabase
        .from('perfis')
        .update(dbUpdates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro em updateProfile:', error);
      return false;
    }
  }
}

export const planService = new PlanService();
