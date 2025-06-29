
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
  // Obter plano atual do usuário com fallback
  async getCurrentUserPlan(): Promise<PlanoUsuario | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Nenhum usuário autenticado');
        return null;
      }

      console.log('Buscando plano para usuário:', user.id);

      const { data, error } = await supabase
        .from('planos_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar plano do usuário:', error);
        
        // Se não encontrou o plano, criar um plano gratuito
        if (error.code === 'PGRST116') {
          console.log('Plano não encontrado, criando plano gratuito');
          return await this.createDefaultPlan(user.id);
        }
        
        return null;
      }

      console.log('Plano encontrado:', data);
      return data;
    } catch (error) {
      console.error('Erro em getCurrentUserPlan:', error);
      return null;
    }
  }

  // Criar plano padrão gratuito
  private async createDefaultPlan(userId: string): Promise<PlanoUsuario | null> {
    try {
      const { data, error } = await supabase
        .from('planos_usuarios')
        .insert({
          user_id: userId,
          plano_ativo: 'gratuito' as TipoPlano,
          data_inicio: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar plano padrão:', error);
        return null;
      }

      console.log('Plano padrão criado:', data);
      return data;
    } catch (error) {
      console.error('Erro em createDefaultPlan:', error);
      return null;
    }
  }

  // Verificar se usuário pode criar material
  async canCreateMaterial(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado para criar material');
        return false;
      }

      const { data, error } = await supabase.rpc('can_create_material', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Erro ao verificar permissão de criação:', error);
        return false;
      }

      console.log('Pode criar material:', data);
      return data || false;
    } catch (error) {
      console.error('Erro em canCreateMaterial:', error);
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
        console.error('Erro ao incrementar uso de material:', error);
        return false;
      }

      console.log('Uso de material incrementado:', data);
      return data || false;
    } catch (error) {
      console.error('Erro em incrementMaterialUsage:', error);
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
        .maybeSingle(); // Usar maybeSingle ao invés de single

      if (error) {
        console.error('Erro ao buscar uso atual:', error);
        return 0;
      }

      const usage = data?.materiais_criados || 0;
      console.log('Uso atual do mês:', usage);
      return usage;
    } catch (error) {
      console.error('Erro em getCurrentMonthUsage:', error);
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
      if (!plan) {
        console.log('Nenhum plano encontrado, retornando 0 materiais');
        return 0;
      }

      const currentUsage = await this.getCurrentMonthUsage();
      const planLimit = this.getPlanLimits(plan.plano_ativo);
      const remaining = Math.max(0, planLimit - currentUsage);

      console.log(`Plano: ${plan.plano_ativo}, Limite: ${planLimit}, Usado: ${currentUsage}, Restante: ${remaining}`);
      return remaining;
    } catch (error) {
      console.error('Erro em getRemainingMaterials:', error);
      return 0;
    }
  }

  // Atualizar plano do usuário
  async updateUserPlan(newPlan: TipoPlano, expirationDate?: Date): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado para atualizar plano');
        return false;
      }

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
        console.error('Erro ao atualizar plano do usuário:', error);
        return false;
      }

      console.log('Plano atualizado com sucesso para:', newPlan);
      return true;
    } catch (error) {
      console.error('Erro em updateUserPlan:', error);
      return false;
    }
  }

  // Verificar se plano expirou
  async isPlanExpired(): Promise<boolean> {
    try {
      const plan = await this.getCurrentUserPlan();
      if (!plan || !plan.data_expiracao) return false;

      const expirationDate = new Date(plan.data_expiracao);
      const isExpired = expirationDate < new Date();
      
      console.log('Verificação de expiração:', { expirationDate, isExpired });
      return isExpired;
    } catch (error) {
      console.error('Erro ao verificar expiração do plano:', error);
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
        console.error('Erro ao buscar histórico de uso:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro em getUsageHistory:', error);
      return [];
    }
  }
}

export const supabasePlanService = new SupabasePlanService();
