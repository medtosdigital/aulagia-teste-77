import { supabase } from '@/integrations/supabase/client';
import { PlanData } from './planExpirationService';

class PlanService {
  // Buscar todos os planos ativos
  async getAllPlans(): Promise<PlanData[]> {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)
        .order('preco_mensal', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar planos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro em getAllPlans:', error);
      return [];
    }
  }

  // Buscar plano específico
  async getPlan(planName: string): Promise<PlanData | null> {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('nome', planName)
        .eq('ativo', true)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar plano:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Erro em getPlan:', error);
      return null;
    }
  }

  // Verificar se usuário pode acessar recurso específico
  async canAccessFeature(userId: string, feature: keyof PlanData): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('perfis')
        .select('plano_ativo')
        .eq('user_id', userId)
        .single();

      if (error || !user) {
        console.error('❌ Erro ao buscar perfil do usuário:', error);
        return false;
      }

      const plan = await this.getPlan(user.plano_ativo);
      if (!plan) {
        return false;
      }

      return plan[feature] as boolean;
    } catch (error) {
      console.error('❌ Erro em canAccessFeature:', error);
      return false;
    }
  }

  // Obter limite de materiais do usuário
  async getUserMaterialLimit(userId: string): Promise<number> {
    try {
      const { data: user, error } = await supabase
        .from('perfis')
        .select('plano_ativo')
        .eq('user_id', userId)
        .single();

      if (error || !user) {
        console.error('❌ Erro ao buscar perfil do usuário:', error);
        return 5; // Fallback para plano gratuito
      }

      const plan = await this.getPlan(user.plano_ativo);
      if (!plan) {
        return 5; // Fallback para plano gratuito
      }

      return plan.limite_materiais_mensal;
    } catch (error) {
      console.error('❌ Erro em getUserMaterialLimit:', error);
      return 5; // Fallback para plano gratuito
    }
  }

  // Verificar se usuário pode criar material
  async canCreateMaterial(userId: string): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('perfis')
        .select('plano_ativo, materiais_criados_mes_atual')
        .eq('user_id', userId)
        .single();

      if (error || !user) {
        console.error('❌ Erro ao buscar perfil do usuário:', error);
        return false;
      }

      const plan = await this.getPlan(user.plano_ativo);
      if (!plan) {
        return false;
      }

      return user.materiais_criados_mes_atual < plan.limite_materiais_mensal;
    } catch (error) {
      console.error('❌ Erro em canCreateMaterial:', error);
      return false;
    }
  }

  // Incrementar contador de materiais criados
  async incrementMaterialCount(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('perfis')
        .update({
          materiais_criados_mes_atual: supabase.rpc('increment', { value: 1 })
        })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao incrementar contador de materiais:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro em incrementMaterialCount:', error);
      return false;
    }
  }

  // Resetar contador de materiais (executar mensalmente)
  async resetMaterialCount(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('perfis')
        .update({
          materiais_criados_mes_atual: 0,
          ultimo_reset_materiais: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao resetar contador de materiais:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro em resetMaterialCount:', error);
      return false;
    }
  }
}

export const planService = new PlanService(); 