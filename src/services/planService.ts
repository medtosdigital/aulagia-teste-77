import { supabase } from '@/integrations/supabase/client';

export interface PerfilUsuario {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  plano_ativo: string;
  plano_id: number;
  billing_type: string;
  status_plano: string;
  data_inicio_plano: string;
  data_expiracao_plano: string;
  materiais_criados_mes_atual: number;
  ano_atual: number;
  mes_atual: number;
  ultimo_reset_materiais: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
  nome_preferido: string;
  etapas_ensino: string[];
  disciplinas: string[];
  anos_serie: string[];
  tipo_material_favorito: string[];
  preferencia_bncc: boolean;
  forma_pagamento: string;
  ultima_renovacao: string;
  celular: string;
  escola: string;
  customer_id?: string;
  subscription_id?: string;
}

class PlanService {
  async resetMaterialCount(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn('Usuário não autenticado');
        return false;
      }

      // Obtenha o ano e o mês atuais
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // Os meses em JavaScript são de 0 a 11

      // Execute a função Supabase
      const { data, error } = await supabase.functions.invoke('reset-material-count', {
        body: {
          userId: user.id,
          year: currentYear,
          month: currentMonth,
        },
      });

      if (error) {
        console.error('Erro ao chamar a função Supabase:', error);
        return false;
      }

      console.log('Contagem de materiais resetada com sucesso:', data);
      return true;
    } catch (error) {
      console.error('Erro ao resetar contagem de materiais:', error);
      return false;
    }
  }

  async getProfile(): Promise<PerfilUsuario | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('❌ [PERFIL] Usuário não autenticado');
        return null;
      }

      const { data: profile, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('❌ [PERFIL] Erro ao buscar perfil:', error);
        return null;
      }

      if (!profile) {
        console.warn('❌ [PERFIL] Perfil não encontrado');
        return null;
      }

      // Mapear os dados do perfil para incluir customer_id e subscription_id opcionais
      const mappedProfile: PerfilUsuario = {
        ...profile,
        customer_id: profile.customer_id || undefined,
        subscription_id: profile.subscription_id || undefined
      };

      console.log('✅ [PERFIL] Perfil carregado:', mappedProfile.email);
      return mappedProfile;
    } catch (error) {
      console.error('❌ [PERFIL] Erro inesperado:', error);
      return null;
    }
  }

  async updateProfile(updates: Partial<PerfilUsuario>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn('Usuário não autenticado');
        return false;
      }

      const { error } = await supabase
        .from('perfis')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return false;
      }

      console.log('Perfil atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  }
}

export const planService = new PlanService();
