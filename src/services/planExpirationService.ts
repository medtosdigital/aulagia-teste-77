
import { supabase } from '@/integrations/supabase/client';
import { planService } from './planService';

export interface PlanData {
  id: number;
  nome: string;
  descricao: string | null;
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
  created_at: string;
  updated_at: string;
}

interface ProfileData {
  user_id: string;
  email: string;
  full_name: string;
  nome_preferido: string;
  plano_ativo: 'gratuito' | 'professor' | 'grupo_escolar';
  billing_type: 'monthly' | 'yearly';
  data_inicio_plano: string;
  data_expiracao_plano: string | null;
  celular: string;
  escola: string;
  etapas_ensino: string[];
  anos_serie: string[];
  disciplinas: string[];
  tipo_material_favorito: string[];
  preferencia_bncc: boolean;
  avatar_url: string;
  materiais_criados_mes_atual: number;
  ano_atual: number;
  mes_atual: number;
  ultimo_reset_materiais: string;
}

class PlanExpirationService {
  async runDailyPlanCheck(): Promise<void> {
    try {
      console.log('🔄 Executando verificação diária de planos...');
      await this.checkAndHandleExpiredPlans();
    } catch (error) {
      console.error('❌ Erro na verificação diária de planos:', error);
    }
  }

  async checkAndHandleExpiredPlans(): Promise<void> {
    try {
      console.log('🔍 Verificando planos expirados...');
      
      // Buscar usuários com planos expirados
      const { data: expiredUsers, error } = await supabase
        .from('perfis')
        .select('user_id, email, full_name, plano_ativo, data_expiracao_plano')
        .not('data_expiracao_plano', 'is', null)
        .lt('data_expiracao_plano', new Date().toISOString())
        .neq('plano_ativo', 'gratuito');

      if (error) {
        console.error('❌ Erro ao buscar planos expirados:', error);
        return;
      }

      if (!expiredUsers || expiredUsers.length === 0) {
        console.log('✅ Nenhum plano expirado encontrado');
        return;
      }

      console.log(`📋 Encontrados ${expiredUsers.length} planos expirados`);

      // Processar cada usuário com plano expirado
      for (const user of expiredUsers) {
        await this.downgradeToFreeplan(user.user_id, user.email);
      }

      console.log('✅ Processamento de planos expirados concluído');
    } catch (error) {
      console.error('❌ Erro em checkAndHandleExpiredPlans:', error);
    }
  }

  // Rebaixar usuário para plano gratuito
  private async downgradeToFreeplan(userId: string, userEmail: string): Promise<void> {
    try {
      console.log(`🔄 Rebaixando usuário ${userEmail} para plano gratuito`);

      const { error } = await supabase
        .from('perfis')
        .update({
          plano_ativo: 'gratuito',
          data_expiracao_plano: null,
          billing_type: 'monthly' as 'monthly' | 'yearly',
          materiais_criados_mes_atual: 0,
          ultimo_reset_materiais: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error(`❌ Erro ao rebaixar usuário ${userEmail}:`, error);
        return;
      }

      console.log(`✅ Usuário ${userEmail} rebaixado para plano gratuito`);
    } catch (error) {
      console.error(`❌ Erro em downgradeToFreeplan para ${userEmail}:`, error);
    }
  }

  // Renovar plano gratuito
  async renewFreePlan(userId: string): Promise<boolean> {
    try {
      console.log(`🔄 Renovando plano gratuito para usuário ${userId}`);

      const { error } = await supabase
        .from('perfis')
        .update({
          plano_ativo: 'gratuito',
          data_expiracao_plano: null,
          billing_type: 'monthly',
          materiais_criados_mes_atual: 0,
          ultimo_reset_materiais: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error(`❌ Erro ao renovar plano gratuito para ${userId}:`, error);
        return false;
      }

      console.log(`✅ Plano gratuito renovado para usuário ${userId}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro em renewFreePlan para ${userId}:`, error);
      return false;
    }
  }

  // Atualizar plano pago
  async updatePaidPlan(userId: string, planType: 'professor' | 'grupo_escolar', billingType: 'monthly' | 'yearly'): Promise<boolean> {
    try {
      console.log(`🔄 Atualizando plano pago para usuário ${userId}: ${planType} (${billingType})`);

      // Calcular data de expiração
      const dataExpiracao = new Date();
      if (billingType === 'monthly') {
        dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
      } else {
        dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1);
      }

      const { error } = await supabase
        .from('perfis')
        .update({
          plano_ativo: planType,
          billing_type: billingType,
          data_expiracao_plano: dataExpiracao.toISOString(),
          data_inicio_plano: new Date().toISOString(),
          materiais_criados_mes_atual: 0,
          ultimo_reset_materiais: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error(`❌ Erro ao atualizar plano pago para ${userId}:`, error);
        return false;
      }

      console.log(`✅ Plano pago atualizado para usuário ${userId}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro em updatePaidPlan para ${userId}:`, error);
      return false;
    }
  }

  // Renovar plano pago (via webhook)
  async renewPaidPlan(userId: string): Promise<boolean> {
    try {
      console.log(`🔄 Renovando plano pago para usuário ${userId}`);

      // Buscar dados atuais do usuário
      const { data: userData, error: fetchError } = await supabase
        .from('perfis')
        .select('plano_ativo, billing_type')
        .eq('user_id', userId)
        .single();

      if (fetchError || !userData) {
        console.error(`❌ Erro ao buscar dados do usuário ${userId}:`, fetchError);
        return false;
      }

      // Calcular nova data de expiração
      const dataExpiracao = new Date();
      if (userData.billing_type === 'monthly') {
        dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
      } else {
        dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1);
      }

      const { error } = await supabase
        .from('perfis')
        .update({
          data_expiracao_plano: dataExpiracao.toISOString(),
          ultima_renovacao: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error(`❌ Erro ao renovar plano pago para ${userId}:`, error);
        return false;
      }

      console.log(`✅ Plano pago renovado para usuário ${userId}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro em renewPaidPlan para ${userId}:`, error);
      return false;
    }
  }

  // Criar perfil inicial completo
  async createInitialProfile(userId: string, userEmail: string): Promise<boolean> {
    try {
      console.log(`📝 Criando perfil inicial para ${userEmail}`);

      const profileData: ProfileData = {
        user_id: userId,
        email: userEmail,
        full_name: userEmail.split('@')[0] || 'Usuário',
        nome_preferido: userEmail.split('@')[0] || 'Usuário',
        plano_ativo: 'gratuito',
        billing_type: 'monthly',
        data_inicio_plano: new Date().toISOString(),
        data_expiracao_plano: null,
        celular: '',
        escola: '',
        etapas_ensino: [],
        anos_serie: [],
        disciplinas: [],
        tipo_material_favorito: [],
        preferencia_bncc: false,
        avatar_url: '',
        materiais_criados_mes_atual: 0,
        ano_atual: new Date().getFullYear(),
        mes_atual: new Date().getMonth() + 1,
        ultimo_reset_materiais: new Date().toISOString()
      };

      const { error } = await supabase
        .from('perfis')
        .insert(profileData);

      if (error) {
        console.error(`❌ Erro ao criar perfil inicial para ${userEmail}:`, error);
        return false;
      }

      console.log(`✅ Perfil inicial criado para ${userEmail}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro em createInitialProfile para ${userEmail}:`, error);
      return false;
    }
  }
}

export const planExpirationService = new PlanExpirationService();
