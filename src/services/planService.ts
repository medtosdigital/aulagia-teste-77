
import { supabase } from '@/integrations/supabase/client';

export interface PerfilUsuario {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  nome_preferido?: string;
  plano_ativo: 'gratuito' | 'professor' | 'grupo_escolar' | 'admin';
  billing_type?: string;
  data_inicio_plano: string;
  data_expiracao_plano: string | null;
  status_plano: 'ativo' | 'atrasado' | 'cancelado';
  ultima_renovacao: string;
  customer_id?: string;
  subscription_id?: string;
  materiais_criados_mes_atual: number;
  ano_atual: number;
  mes_atual: number;
  ultimo_reset_materiais: string;
  created_at: string;
  updated_at: string;
}

export interface PlanData {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  limits: {
    materialsPerMonth: number;
    canDownloadWord: boolean;
    canDownloadPPT: boolean;
    canEditMaterials: boolean;
    canCreateSlides: boolean;
    canCreateAssessments: boolean;
    hasCalendar: boolean;
    hasHistory: boolean;
  };
}

class PlanService {
  async getCurrentUserProfile(): Promise<PerfilUsuario | null> {
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

      // Fixed: Map the data to match PerfilUsuario interface
      return {
        id: data.id,
        user_id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        nome_preferido: data.nome_preferido,
        plano_ativo: data.plano_ativo,
        billing_type: data.billing_type,
        data_inicio_plano: data.data_inicio_plano,
        data_expiracao_plano: data.data_expiracao_plano,
        status_plano: data.status_plano || 'ativo',
        ultima_renovacao: data.ultima_renovacao,
        customer_id: data.customer_id || undefined,
        subscription_id: data.subscription_id || undefined,
        materiais_criados_mes_atual: data.materiais_criados_mes_atual,
        ano_atual: data.ano_atual,
        mes_atual: data.mes_atual,
        ultimo_reset_materiais: data.ultimo_reset_materiais,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Erro em getCurrentUserProfile:', error);
      return null;
    }
  }

  async updateUserPlan(planType: 'gratuito' | 'professor' | 'grupo_escolar', expirationDate?: Date): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .rpc('update_user_plan', {
          p_user_id: user.id,
          p_new_plan: planType,
          p_expiration_date: expirationDate?.toISOString() || null
        });

      if (error) {
        console.error('Erro ao atualizar plano:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro em updateUserPlan:', error);
      return false;
    }
  }

  async getRemainingMaterials(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .rpc('get_remaining_materials', {
          p_user_id: user.id
        });

      if (error) {
        console.error('Erro ao obter materiais restantes:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Erro em getRemainingMaterials:', error);
      return 0;
    }
  }

  async canCreateMaterial(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .rpc('can_create_material', {
          p_user_id: user.id
        });

      if (error) {
        console.error('Erro ao verificar se pode criar material:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Erro em canCreateMaterial:', error);
      return false;
    }
  }

  async incrementMaterialUsage(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .rpc('increment_material_usage', {
          p_user_id: user.id
        });

      if (error) {
        console.error('Erro ao incrementar uso de material:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro em incrementMaterialUsage:', error);
      return false;
    }
  }

  getPlanData(planType: string): PlanData {
    const plans: Record<string, PlanData> = {
      'gratuito': {
        id: 'gratuito',
        name: 'Plano Gratuito',
        price: { monthly: 0, yearly: 0 },
        limits: {
          materialsPerMonth: 5,
          canDownloadWord: false,
          canDownloadPPT: false,
          canEditMaterials: false,
          canCreateSlides: false,
          canCreateAssessments: false,
          hasCalendar: false,
          hasHistory: false
        }
      },
      'professor': {
        id: 'professor',
        name: 'Plano Professor',
        price: { monthly: 29.90, yearly: 299 },
        limits: {
          materialsPerMonth: 50,
          canDownloadWord: true,
          canDownloadPPT: true,
          canEditMaterials: true,
          canCreateSlides: true,
          canCreateAssessments: true,
          hasCalendar: true,
          hasHistory: true
        }
      },
      'grupo_escolar': {
        id: 'grupo_escolar',
        name: 'Grupo Escolar',
        price: { monthly: 89.90, yearly: 849 },
        limits: {
          materialsPerMonth: 300,
          canDownloadWord: true,
          canDownloadPPT: true,
          canEditMaterials: true,
          canCreateSlides: true,
          canCreateAssessments: true,
          hasCalendar: true,
          hasHistory: true
        }
      },
      'admin': {
        id: 'admin',
        name: 'Administrador',
        price: { monthly: 0, yearly: 0 },
        limits: {
          materialsPerMonth: Infinity,
          canDownloadWord: true,
          canDownloadPPT: true,
          canEditMaterials: true,
          canCreateSlides: true,
          canCreateAssessments: true,
          hasCalendar: true,
          hasHistory: true
        }
      }
    };

    return plans[planType] || plans['gratuito'];
  }
}

export const planService = new PlanService();
