import { supabase } from '@/integrations/supabase/client';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  features: string[];
}

interface PerfilUsuario {
  user_id: string;
  email: string;
  full_name: string;
  plano_ativo: string;
  billing_type: string;
  status_plano: string;
  data_inicio_plano: string;
  data_expiracao_plano: string;
  materiais_criados_mes_atual: number;
  ano_atual: number;
  mes_atual: number;
  ultimo_reset_materiais: string;
  avatar_url: string;
  nome_preferido: string;
  etapas_ensino: string[];
  disciplinas: string[];
  anos_serie: string[];
  tipo_material_favorito: string[];
  preferencia_bncc: boolean;
  created_at: string;
  updated_at: string;
  plano_id: number;
  celular: string;
  escola: string;
  forma_pagamento: string;
  ultima_renovacao: string;
  // Campos que podem estar faltando
  customer_id?: string;
  subscription_id?: string;
}

class PlanService {
  async getPlans(): Promise<Plan[]> {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .order('price', { ascending: true });

      if (error) {
        console.error('Erro ao buscar planos:', error);
        return [];
      }

      return data as Plan[];
    } catch (error) {
      console.error('Erro em getPlans:', error);
      return [];
    }
  }

  async getPlanById(planId: number): Promise<Plan | null> {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) {
        console.error('Erro ao buscar plano por ID:', error);
        return null;
      }

      return data as Plan;
    } catch (error) {
      console.error('Erro em getPlanById:', error);
      return null;
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
        console.error('Erro ao buscar perfil do usuário:', error);
        return null;
      }

      // Map database fields to interface, providing defaults for missing fields
      return {
        ...data,
        customer_id: data.customer_id || '',
        subscription_id: data.subscription_id || ''
      } as PerfilUsuario;
      
    } catch (error) {
      console.error('Erro em getUserProfile:', error);
      return null;
    }
  }

  async updateMaterialsCreatedCount(userId: string, newCount: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ materiais_criados_mes_atual: newCount })
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao atualizar contagem de materiais criados:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro em updateMaterialsCreatedCount:', error);
      return false;
    }
  }

  async resetMonthlyMaterialCount(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('perfis')
        .update({
          materiais_criados_mes_atual: 0,
          ultimo_reset_materiais: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao resetar contagem mensal de materiais:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro em resetMonthlyMaterialCount:', error);
      return false;
    }
  }
}

export const planService = new PlanService();
