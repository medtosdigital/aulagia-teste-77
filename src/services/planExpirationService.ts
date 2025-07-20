import { supabase } from '@/integrations/supabase/client';

export interface PlanData {
  id: number;
  nome: string;
  descricao: string;
  preco_mensal: number;
  preco_anual: number;
  limite_materiais_mensal: number;
  pode_download_word: boolean;
  pode_download_ppt: boolean;
  pode_editar_materiais: boolean;
  pode_criar_slides: boolean;
  pode_criar_avaliacoes: boolean;
  tem_calendario: boolean;
  tem_historico: boolean;
  ativo: boolean;
}

export interface PlanExpirationData {
  user_id: string;
  plano_ativo: 'gratuito' | 'professor' | 'grupo_escolar' | 'admin';
  billing_type: 'monthly' | 'yearly';
  data_inicio_plano: string;
  data_expiracao_plano: string;
  status_plano: 'ativo' | 'atrasado' | 'cancelado';
  ultima_renovacao: string;
  customer_id?: string;
  subscription_id?: string;
}

class PlanExpirationService {
  // Calcular data de expiração baseada no tipo de billing
  private calculateExpirationDate(startDate: Date, billingType: 'monthly' | 'yearly'): Date {
    const expirationDate = new Date(startDate);
    
    if (billingType === 'monthly') {
      expirationDate.setMonth(expirationDate.getMonth() + 1);
    } else {
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    }
    
    return expirationDate;
  }

  // Criar perfil inicial para novo usuário
  async createInitialProfile(userId: string, userEmail: string): Promise<boolean> {
    try {
      const now = new Date();
      const expirationDate = this.calculateExpirationDate(now, 'monthly');
      
      const profileData = {
        user_id: userId,
        email: userEmail,
        full_name: userEmail?.split('@')[0] || 'Usuário',
        nome_preferido: userEmail?.split('@')[0] || 'Usuário',
        plano_ativo: 'gratuito' as const,
        billing_type: 'monthly' as const,
        data_inicio_plano: now.toISOString(),
        data_expiracao_plano: expirationDate.toISOString(),
        status_plano: 'ativo' as const,
        ultima_renovacao: now.toISOString(),
        celular: '',
        escola: '',
        etapas_ensino: [],
        anos_serie: [],
        disciplinas: [],
        tipo_material_favorito: [],
        preferencia_bncc: false,
        avatar_url: '',
        materiais_criados_mes_atual: 0,
        ano_atual: now.getFullYear(),
        mes_atual: now.getMonth() + 1,
        ultimo_reset_materiais: now.toISOString()
      };

      const { error } = await supabase
        .from('perfis')
        .insert(profileData);

      if (error) {
        console.error('❌ Erro ao criar perfil inicial:', error);
        return false;
      }

      console.log('✅ Perfil inicial criado com sucesso para usuário:', userId);
      return true;
    } catch (error) {
      console.error('❌ Erro em createInitialProfile:', error);
      return false;
    }
  }

  // Renovar plano gratuito automaticamente
  async renewFreePlan(userId: string): Promise<boolean> {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar perfil para renovação:', fetchError);
        return false;
      }

      if (profile.plano_ativo !== 'gratuito') {
        console.log('⚠️ Usuário não é do plano gratuito, não renovando automaticamente');
        return true;
      }

      const now = new Date();
      const currentExpiration = new Date(profile.data_expiracao_plano);
      
      // Se ainda não expirou, não renovar
      if (currentExpiration > now) {
        console.log('✅ Plano gratuito ainda não expirou, não renovando');
        return true;
      }

      // Calcular nova data de expiração
      const newExpirationDate = this.calculateExpirationDate(currentExpiration, 'monthly');

      const { error: updateError } = await supabase
        .from('perfis')
        .update({
          data_expiracao_plano: newExpirationDate.toISOString(),
          ultima_renovacao: now.toISOString(),
          status_plano: 'ativo'
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Erro ao renovar plano gratuito:', updateError);
        return false;
      }

      console.log('✅ Plano gratuito renovado automaticamente para usuário:', userId);
      return true;
    } catch (error) {
      console.error('❌ Erro em renewFreePlan:', error);
      return false;
    }
  }

  // Atualizar plano pago (quando usuário adquire plano pago)
  async updatePaidPlan(userId: string, planType: 'professor' | 'grupo_escolar', billingType: 'monthly' | 'yearly'): Promise<boolean> {
    try {
      const now = new Date();
      const expirationDate = this.calculateExpirationDate(now, billingType);

      const { error } = await supabase
        .from('perfis')
        .update({
          plano_ativo: planType,
          billing_type: billingType,
          data_inicio_plano: now.toISOString(),
          data_expiracao_plano: expirationDate.toISOString(),
          status_plano: 'ativo',
          ultima_renovacao: now.toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao atualizar plano pago:', error);
        return false;
      }

      console.log('✅ Plano pago atualizado para usuário:', userId, 'Plano:', planType, 'Billing:', billingType);
      return true;
    } catch (error) {
      console.error('❌ Erro em updatePaidPlan:', error);
      return false;
    }
  }

  // Renovar plano pago (via webhook)
  async renewPaidPlan(userId: string): Promise<boolean> {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar perfil para renovação paga:', fetchError);
        return false;
      }

      if (profile.plano_ativo === 'gratuito') {
        console.log('⚠️ Usuário é do plano gratuito, não renovando como pago');
        return true;
      }

      const now = new Date();
      const currentExpiration = new Date(profile.data_expiracao_plano);
      const newExpirationDate = this.calculateExpirationDate(currentExpiration, profile.billing_type);

      const { error: updateError } = await supabase
        .from('perfis')
        .update({
          data_expiracao_plano: newExpirationDate.toISOString(),
          ultima_renovacao: now.toISOString(),
          status_plano: 'ativo'
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Erro ao renovar plano pago:', updateError);
        return false;
      }

      console.log('✅ Plano pago renovado para usuário:', userId);
      return true;
    } catch (error) {
      console.error('❌ Erro em renewPaidPlan:', error);
      return false;
    }
  }

  // Verificar e atualizar status de planos expirados
  async checkAndUpdateExpiredPlans(): Promise<void> {
    try {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

      // Buscar planos que expiraram há mais de 3 dias
      const { data: expiredPlans, error } = await supabase
        .from('perfis')
        .select('user_id, plano_ativo, data_expiracao_plano, status_plano')
        .lt('data_expiracao_plano', threeDaysAgo.toISOString())
        .neq('plano_ativo', 'gratuito')
        .neq('status_plano', 'cancelado');

      if (error) {
        console.error('❌ Erro ao buscar planos expirados:', error);
        return;
      }

      if (!expiredPlans || expiredPlans.length === 0) {
        console.log('✅ Nenhum plano expirado encontrado');
        return;
      }

      // Cancelar planos expirados (voltar para gratuito)
      for (const plan of expiredPlans) {
        const { error: updateError } = await supabase
          .from('perfis')
          .update({
            plano_ativo: 'gratuito',
            billing_type: 'monthly',
            status_plano: 'cancelado',
            data_expiracao_plano: this.calculateExpirationDate(now, 'monthly').toISOString()
          })
          .eq('user_id', plan.user_id);

        if (updateError) {
          console.error('❌ Erro ao cancelar plano expirado:', updateError);
        } else {
          console.log('✅ Plano cancelado para usuário:', plan.user_id);
        }
      }
    } catch (error) {
      console.error('❌ Erro em checkAndUpdateExpiredPlans:', error);
    }
  }

  // Marcar plano como atrasado (quando expira mas ainda não passou 3 dias)
  async markOverduePlans(): Promise<void> {
    try {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

      // Buscar planos que expiraram mas ainda não passaram 3 dias
      const { data: overduePlans, error } = await supabase
        .from('perfis')
        .select('user_id, plano_ativo, data_expiracao_plano, status_plano')
        .lt('data_expiracao_plano', now.toISOString())
        .gte('data_expiracao_plano', threeDaysAgo.toISOString())
        .neq('plano_ativo', 'gratuito')
        .eq('status_plano', 'ativo');

      if (error) {
        console.error('❌ Erro ao buscar planos atrasados:', error);
        return;
      }

      if (!overduePlans || overduePlans.length === 0) {
        console.log('✅ Nenhum plano atrasado encontrado');
        return;
      }

      // Marcar planos como atrasados
      for (const plan of overduePlans) {
        const { error: updateError } = await supabase
          .from('perfis')
          .update({
            status_plano: 'atrasado'
          })
          .eq('user_id', plan.user_id);

        if (updateError) {
          console.error('❌ Erro ao marcar plano como atrasado:', updateError);
        } else {
          console.log('⚠️ Plano marcado como atrasado para usuário:', plan.user_id);
        }
      }
    } catch (error) {
      console.error('❌ Erro em markOverduePlans:', error);
    }
  }

  // Executar verificação diária de planos
  async runDailyPlanCheck(): Promise<void> {
    console.log('🔄 Executando verificação diária de planos...');
    
    // Marcar planos atrasados
    await this.markOverduePlans();
    
    // Verificar e cancelar planos expirados
    await this.checkAndUpdateExpiredPlans();
    
    console.log('✅ Verificação diária de planos concluída');
  }

  // Buscar dados de um plano específico
  async getPlanData(planName: string): Promise<PlanData | null> {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('nome', planName)
        .eq('ativo', true)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar dados do plano:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Erro em getPlanData:', error);
      return null;
    }
  }

  // Buscar todos os planos ativos
  async getAllActivePlans(): Promise<PlanData[]> {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)
        .order('preco_mensal', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar planos ativos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro em getAllActivePlans:', error);
      return [];
    }
  }
}

export const planExpirationService = new PlanExpirationService(); 