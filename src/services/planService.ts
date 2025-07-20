import { supabase } from '@/integrations/supabase/client';
import { PlanData } from './planExpirationService';

export interface UserPlanData {
  planName: string;
  planLimit: number;
  materialsCreated: number;
  materialsRemaining: number;
  planPrice: {
    monthly: number;
    yearly: number;
  };
  features: {
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
  // Buscar todos os planos ativos
  async getAllPlans(): Promise<PlanData[]> {
    try {
      const { data, error } = await (supabase as any)
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
      const { data, error } = await (supabase as any)
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

  // Obter dados completos do plano do usuário
  async getUserPlanData(userId: string): Promise<UserPlanData | null> {
    try {
      // Primeiro verificar se precisa resetar o contador de materiais
      await this.checkAndResetMaterialCount(userId);

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('perfis')
        .select('plano_ativo, materiais_criados_mes_atual')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        console.error('❌ Erro ao buscar perfil do usuário:', profileError);
        return null;
      }

      // Buscar dados do plano
      const plan = await this.getPlan(profile.plano_ativo);
      if (!plan) {
        console.error('❌ Plano não encontrado:', profile.plano_ativo);
        return null;
      }

      const materialsCreated = profile.materiais_criados_mes_atual || 0;
      const materialsRemaining = Math.max(0, plan.limite_materiais_mensal - materialsCreated);

      return {
        planName: plan.nome,
        planLimit: plan.limite_materiais_mensal,
        materialsCreated,
        materialsRemaining,
        planPrice: {
          monthly: plan.preco_mensal,
          yearly: plan.preco_anual
        },
        features: {
          canDownloadWord: plan.pode_download_word,
          canDownloadPPT: plan.pode_download_ppt,
          canEditMaterials: plan.pode_editar_materiais,
          canCreateSlides: plan.pode_criar_slides,
          canCreateAssessments: plan.pode_criar_avaliacoes,
          hasCalendar: plan.tem_calendario,
          hasHistory: plan.tem_historico
        }
      };
    } catch (error) {
      console.error('❌ Erro em getUserPlanData:', error);
      return null;
    }
  }

  // Verificar se usuário pode acessar recurso específico
  async canAccessFeature(userId: string, feature: keyof PlanData): Promise<boolean> {
    try {
      const userPlanData = await this.getUserPlanData(userId);
      if (!userPlanData) {
        return false;
      }

      return userPlanData.features[feature as keyof typeof userPlanData.features] as boolean;
    } catch (error) {
      console.error('❌ Erro em canAccessFeature:', error);
      return false;
    }
  }

  // Obter limite de materiais do usuário
  async getUserMaterialLimit(userId: string): Promise<number> {
    try {
      const userPlanData = await this.getUserPlanData(userId);
      return userPlanData?.planLimit || 5; // Fallback para plano gratuito
    } catch (error) {
      console.error('❌ Erro em getUserMaterialLimit:', error);
      return 5; // Fallback para plano gratuito
    }
  }

  // Verificar se usuário pode criar material
  async canCreateMaterial(userId: string): Promise<boolean> {
    try {
      const userPlanData = await this.getUserPlanData(userId);
      if (!userPlanData) {
        return false;
      }

      return userPlanData.materialsRemaining > 0;
    } catch (error) {
      console.error('❌ Erro em canCreateMaterial:', error);
      return false;
    }
  }

  // Obter materiais restantes do usuário
  async getRemainingMaterials(userId: string): Promise<number> {
    try {
      const userPlanData = await this.getUserPlanData(userId);
      return userPlanData?.materialsRemaining || 0;
    } catch (error) {
      console.error('❌ Erro em getRemainingMaterials:', error);
      return 0;
    }
  }

  // Incrementar contador de materiais criados
  async incrementMaterialCount(userId: string): Promise<boolean> {
    try {
      // Primeiro buscar o valor atual
      const { data: profile, error: fetchError } = await supabase
        .from('perfis')
        .select('materiais_criados_mes_atual')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar contador atual:', fetchError);
        return false;
      }

      const currentCount = profile?.materiais_criados_mes_atual || 0;
      const newCount = currentCount + 1;

      // Atualizar com o novo valor
      const { error: updateError } = await supabase
        .from('perfis')
        .update({
          materiais_criados_mes_atual: newCount
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Erro ao incrementar contador de materiais:', updateError);
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

  // Verificar e resetar o contador de materiais se necessário
  async checkAndResetMaterialCount(userId: string): Promise<void> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('perfis')
        .select('ultimo_reset_materiais')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        console.error('❌ Erro ao buscar último reset de materiais:', profileError);
        return;
      }

      const lastReset = profile.ultimo_reset_materiais ? new Date(profile.ultimo_reset_materiais) : null;

      if (lastReset && lastReset.getMonth() !== new Date().getMonth()) {
        console.log(`Resetando contador de materiais para o usuário ${userId} em ${new Date().toISOString()}`);
        await this.resetMaterialCount(userId);
      }
    } catch (error) {
      console.error('❌ Erro em checkAndResetMaterialCount:', error);
    }
  }
}

export const planService = new PlanService(); 