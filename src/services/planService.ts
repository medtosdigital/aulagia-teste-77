import { supabase } from '@/integrations/supabase/client';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

interface Subscription {
  planId: string;
  planName: string;
  startDate: string;
  endDate: string | null;
  status: string;
  priceId: string;
}

interface PerfilUsuario {
  user_id: string;
  email: string;
  full_name: string;
  plano_ativo: string;
  data_inicio_plano: string;
  data_expiracao_plano: string | null;
  materiais_criados_mes_atual: number;
  ano_atual: number;
  mes_atual: number;
  billing_type: string;
  status_plano: string;
  customer_id?: string;
  subscription_id?: string;
}

class PlanService {
  async getPlans(): Promise<Plan[]> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*');

      if (error) {
        console.error('Erro ao buscar planos:', error);
        return [];
      }

      return data.map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        description: plan.description,
        features: plan.features
      }));
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      return [];
    }
  }

  async getSubscription(): Promise<Subscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan_id, start_date, end_date, status, price_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar assinatura:', error);
        return null;
      }

      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('name')
        .eq('id', data.plan_id)
        .single();

      if (planError) {
        console.error('Erro ao buscar nome do plano:', planError);
        return null;
      }

      return {
        planId: data.plan_id,
        planName: planData.name,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        priceId: data.price_id
      };
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
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
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      // Convert to PerfilUsuario with proper types
      return {
        user_id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        plano_ativo: data.plano_ativo,
        data_inicio_plano: data.data_inicio_plano,
        data_expiracao_plano: data.data_expiracao_plano,
        materiais_criados_mes_atual: data.materiais_criados_mes_atual,
        ano_atual: data.ano_atual,
        mes_atual: data.mes_atual,
        billing_type: data.billing_type,
        status_plano: data.status_plano,
        customer_id: data.customer_id || undefined,
        subscription_id: data.subscription_id || undefined
      };
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  }

  async updateSubscriptionStatus(userId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: status })
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao atualizar status da assinatura:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status da assinatura:', error);
      return false;
    }
  }

  async incrementMaterialUsage(userId: string): Promise<void> {
    try {
      // Get the current date
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // Month is 0-indexed

      // First, try to update the existing record
      const { data, error: updateError } = await supabase
        .from('perfis')
        .update({ materiais_criados_mes_atual: () => 'materiais_criados_mes_atual + 1' })
        .eq('user_id', userId)
        .eq('ano_atual', currentYear)
        .eq('mes_atual', currentMonth)
        .select('*');

      if (updateError) {
        console.error('Erro ao atualizar contador de materiais:', updateError);

        // If no rows were updated (likely because the record doesn't exist), insert a new one
        if (updateError.code === '23505') { // Unique violation error code
          console.log('Tentando inserir novo registro para o mês atual...');

          const { error: insertError } = await supabase
            .from('perfis')
            .insert({
              user_id: userId,
              ano_atual: currentYear,
              mes_atual: currentMonth,
              materiais_criados_mes_atual: 1
            });

          if (insertError) {
            console.error('Erro ao inserir novo registro:', insertError);
          } else {
            console.log('Novo registro inserido com sucesso.');
          }
        }
      } else if (data && data.length > 0) {
        console.log('Contador de materiais incrementado com sucesso.');
      }
    } catch (error) {
      console.error('Erro ao incrementar contador de materiais:', error);
    }
  }
}

export const planService = new PlanService();
