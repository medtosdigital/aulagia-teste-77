
import { supabase } from '@/integrations/supabase/client';

export type TipoPlano = 'gratuito' | 'professor' | 'grupo_escolar';

export interface PlanoUsuario {
  id: string;
  user_id: string;
  plano_ativo: TipoPlano;
  data_inicio: string;
  data_expiracao: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsoMensalMateriais {
  id: string;
  user_id: string;
  ano: number;
  mes: number;
  materiais_criados: number;
  created_at: string;
  updated_at: string;
}

class SupabasePlanService {
  // Obter plano atual do usuário
  async getCurrentUserPlan(): Promise<PlanoUsuario | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('planos_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user plan:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentUserPlan:', error);
      return null;
    }
  }

  // Verificar se usuário pode criar material
  async canCreateMaterial(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('can_create_material', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking material creation permission:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in canCreateMaterial:', error);
      return false;
    }
  }

  // Incrementar uso de materiais
  async incrementMaterialUsage(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('increment_material_usage', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error incrementing material usage:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in incrementMaterialUsage:', error);
      return false;
    }
  }

  // Obter uso mensal atual
  async getCurrentMonthUsage(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const { data, error } = await supabase
        .from('uso_mensal_materiais')
        .select('materiais_criados')
        .eq('user_id', user.id)
        .eq('ano', currentYear)
        .eq('mes', currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching current usage:', error);
        return 0;
      }

      return data?.materiais_criados || 0;
    } catch (error) {
      console.error('Error in getCurrentMonthUsage:', error);
      return 0;
    }
  }

  // Obter limites do plano
  getPlanLimits(planType: TipoPlano): number {
    switch (planType) {
      case 'gratuito':
        return 5;
      case 'professor':
        return 50;
      case 'grupo_escolar':
        return 300;
      default:
        return 0;
    }
  }

  // Obter materiais restantes no mês
  async getRemainingMaterials(): Promise<number> {
    try {
      const plan = await this.getCurrentUserPlan();
      if (!plan) return 0;

      const currentUsage = await this.getCurrentMonthUsage();
      const planLimit = this.getPlanLimits(plan.plano_ativo);

      return Math.max(0, planLimit - currentUsage);
    } catch (error) {
      console.error('Error in getRemainingMaterials:', error);
      return 0;
    }
  }

  // Atualizar plano do usuário
  async updateUserPlan(newPlan: TipoPlano, expirationDate?: Date): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const updateData: any = {
        plano_ativo: newPlan,
        updated_at: new Date().toISOString()
      };

      if (expirationDate) {
        updateData.data_expiracao = expirationDate.toISOString();
      }

      const { error } = await supabase
        .from('planos_usuarios')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating user plan:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserPlan:', error);
      return false;
    }
  }

  // Verificar se plano expirou
  async isPlanExpired(): Promise<boolean> {
    try {
      const plan = await this.getCurrentUserPlan();
      if (!plan || !plan.data_expiracao) return false;

      const expirationDate = new Date(plan.data_expiracao);
      return expirationDate < new Date();
    } catch (error) {
      console.error('Error checking plan expiration:', error);
      return false;
    }
  }

  // Obter histórico de uso
  async getUsageHistory(months: number = 12): Promise<UsoMensalMateriais[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('uso_mensal_materiais')
        .select('*')
        .eq('user_id', user.id)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .limit(months);

      if (error) {
        console.error('Error fetching usage history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUsageHistory:', error);
      return [];
    }
  }
}

export const supabasePlanService = new SupabasePlanService();
