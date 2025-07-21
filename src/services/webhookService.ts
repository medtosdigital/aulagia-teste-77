import { supabase } from '@/integrations/supabase/client';

export interface WebhookLog {
  id: string;
  email: string;
  evento: string;
  produto?: string;
  plano_aplicado?: string;
  status: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
  payload?: any;
}

export interface WebhookSimulation {
  email: string;
  evento: string;
  produto?: string;
  token?: string;
}

export interface WebhookConfig {
  url: string;
  token: string;
  enabled: boolean;
}

class WebhookService {
  private readonly WEBHOOK_URL = 'https://xmxpteviwcnrljtxvaoo.supabase.co/functions/v1/webhooks-aulagia';
  private readonly SECURITY_TOKEN = 'i2ak29r42qk';

  // Obter URL do webhook
  getWebhookUrl(): string {
    return this.WEBHOOK_URL;
  }

  // Obter token de segurança
  getSecurityToken(): string {
    return this.SECURITY_TOKEN;
  }

  // Simular webhook da Kiwify
  async simulateWebhook(simulation: WebhookSimulation): Promise<{ success: boolean; message: string; plano_aplicado?: string; billing_type?: string }> {
    try {
      console.log('🚀 Simulando webhook da Kiwify com dados:', simulation);
      
      // Validar dados de entrada
      if (!simulation.email || !simulation.evento) {
        return {
          success: false,
          message: 'Email e evento são obrigatórios',
        };
      }

      // Verificar se o usuário existe no banco antes de simular
      const { data: user, error: userError } = await supabase
        .from('perfis')
        .select('user_id, email, plano_ativo, billing_type')
        .eq('email', simulation.email)
        .single();

      if (userError || !user) {
        return {
          success: false,
          message: `Usuário não encontrado: ${simulation.email}. Verifique se o email está correto e se o usuário existe na tabela perfis.`,
        };
      }

      // Preparar payload para o webhook
      const payload = {
        email: simulation.email,
        evento: simulation.evento,
        produto: simulation.produto || this.getDefaultProductForEvent(simulation.evento),
        token: simulation.token || this.SECURITY_TOKEN,
      };

      console.log('📤 Enviando payload para webhook:', payload);
      
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('📥 Resposta do webhook:', result);

      if (!response.ok) {
        return {
          success: false,
          message: result.error || result.message || `Erro ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        message: `Webhook simulado com sucesso! Plano aplicado: ${result.plano_aplicado || 'N/A'}`,
        plano_aplicado: result.plano_aplicado,
        billing_type: result.billing_type,
      };
    } catch (error) {
      console.error('💥 Erro ao simular webhook:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao simular webhook',
      };
    }
  }

  // Produto padrão baseado no evento
  private getDefaultProductForEvent(evento: string): string {
    switch (evento) {
      case 'compra aprovada':
      case 'assinatura aprovada':
        return 'Plano Professor (Mensal)';
      case 'assinatura renovada':
        return 'Plano Professor (Mensal)';
      case 'assinatura cancelada':
      case 'assinatura atrasada':
        return 'Plano Professor (Mensal)';
      default:
        return 'Plano Professor (Mensal)';
    }
  }

  // Obter logs de webhook
  async getWebhookLogs(page: number = 1, limit: number = 10): Promise<{ logs: WebhookLog[]; total: number }> {
    try {
      console.log(`📋 Buscando logs de webhook - página ${page}, limite ${limit}`);
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data: logs, error, count } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('❌ Erro ao buscar logs de webhook:', error);
        throw error;
      }

      console.log(`📝 Logs encontrados: ${logs?.length || 0}, Total: ${count || 0}`);
      
      return {
        logs: logs || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('❌ Erro ao obter logs de webhook:', error);
      throw error;
    }
  }

  // Obter estatísticas de webhook
  async getWebhookStats(): Promise<{
    totalEvents: number;
    successEvents: number;
    errorEvents: number;
    recentEvents: WebhookLog[];
  }> {
    try {
      console.log('📊 Buscando estatísticas de webhook...');
      
      const { count: totalEvents, error: totalError } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const { count: successEvents, error: successError } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sucesso');

      if (successError) throw successError;

      const { count: errorEvents, error: errorError } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: true })
        .in('status', ['erro', 'erro_processamento']);

      if (errorError) throw errorError;

      const { data: recentEvents, error: recentError } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      return {
        totalEvents: totalEvents || 0,
        successEvents: successEvents || 0,
        errorEvents: errorEvents || 0,
        recentEvents: recentEvents || [],
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de webhook:', error);
      throw error;
    }
  }

  // Formatar data para exibição
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Obter opções de eventos para simulação
  getEventOptions(): { value: string; label: string }[] {
    return [
      { value: 'compra aprovada', label: 'Compra Aprovada' },
      { value: 'assinatura aprovada', label: 'Assinatura Aprovada' },
      { value: 'assinatura renovada', label: 'Assinatura Renovada' },
      { value: 'assinatura cancelada', label: 'Assinatura Cancelada' },
      { value: 'assinatura atrasada', label: 'Assinatura Atrasada' },
    ];
  }

  // Obter opções de produtos para simulação
  getProductOptions(): { value: string; label: string }[] {
    return [
      { value: 'Plano Professor (Mensal)', label: 'Plano Professor (Mensal)' },
      { value: 'Plano Professor (Anual)', label: 'Plano Professor (Anual)' },
      { value: 'Plano Grupo Escolar (Mensal)', label: 'Plano Grupo Escolar (Mensal)' },
      { value: 'Plano Grupo Escolar (Anual)', label: 'Plano Grupo Escolar (Anual)' },
    ];
  }

  // Obter status badge color
  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'sucesso':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'erro':
      case 'erro_processamento':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Verificar se um usuário existe na tabela perfis
  async checkUserExists(email: string): Promise<{ exists: boolean; user?: any }> {
    try {
      const { data: user, error } = await supabase
        .from('perfis')
        .select('user_id, email, plano_ativo, billing_type')
        .eq('email', email)
        .single();

      if (error || !user) {
        return { exists: false };
      }

      return { exists: true, user };
    } catch (error) {
      console.error('❌ Erro ao verificar usuário:', error);
      return { exists: false };
    }
  }
}

export const webhookService = new WebhookService();
