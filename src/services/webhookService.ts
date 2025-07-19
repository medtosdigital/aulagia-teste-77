import { supabase } from '@/integrations/supabase/client';

export interface WebhookLog {
  id: string;
  email: string;
  evento: string;
  produto?: string;
  plano_aplicado?: string;
  status: string;
  erro_mensagem?: string;
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
  private readonly WEBHOOK_URL = 'https://znczyttfmodaftjuimeb.supabase.co/functions/v1/webhooks-aulagia';
  private readonly SECURITY_TOKEN = 'q64w1ncxx2k';

  // Obter URL do webhook
  getWebhookUrl(): string {
    return this.WEBHOOK_URL;
  }

  // Obter token de segurança
  getSecurityToken(): string {
    return this.SECURITY_TOKEN;
  }

  // Simular webhook
  async simulateWebhook(simulation: WebhookSimulation): Promise<{ success: boolean; message: string; plano_aplicado?: string }> {
    try {
      console.log('🚀 Simulando webhook com dados:', simulation);
      
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
        .select('plano_ativo')
        .eq('email', simulation.email)
        .single();

      if (userError || !user) {
        console.error('❌ Usuário não encontrado:', simulation.email);
        return {
          success: false,
          message: `Usuário não encontrado: ${simulation.email}. Verifique se o email está correto.`,
        };
      }

      console.log('✅ Usuário encontrado:', user);
      
      // Preparar payload para o webhook
      const payload = {
        email: simulation.email,
        evento: simulation.evento,
        produto: simulation.produto,
        token: simulation.token || this.SECURITY_TOKEN,
      };

      console.log('📤 Enviando payload:', payload);
      
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
        console.error('❌ Erro na resposta do webhook:', response.status, result);
        return {
          success: false,
          message: result.error || `Erro ${response.status}: ${response.statusText}`,
        };
      }

      console.log('✅ Webhook processado com sucesso');
      
      return {
        success: true,
        message: `Webhook simulado com sucesso! Plano aplicado: ${result.plano_aplicado || 'gratuito'}`,
        plano_aplicado: result.plano_aplicado,
      };
    } catch (error) {
      console.error('💥 Erro ao simular webhook:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao simular webhook',
      };
    }
  }

  // Obter logs de webhook
  async getWebhookLogs(page: number = 1, limit: number = 10): Promise<{ logs: WebhookLog[]; total: number }> {
    try {
      console.log(`Buscando logs de webhook - página ${page}, limite ${limit}`);
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data: logs, error, count } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Erro ao buscar logs de webhook:', error);
        throw error;
      }

      console.log(`Logs encontrados: ${logs?.length || 0}, Total: ${count || 0}`);
      
      return {
        logs: logs || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Erro ao obter logs de webhook:', error);
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
      console.log('Buscando estatísticas de webhook...');
      
      // Total de eventos
      const { count: totalEvents, error: totalError } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        console.error('Erro ao buscar total de eventos:', totalError);
        throw totalError;
      }

      // Eventos de sucesso
      const { count: successEvents, error: successError } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sucesso');

      if (successError) {
        console.error('Erro ao buscar eventos de sucesso:', successError);
        throw successError;
      }

      // Eventos de erro
      const { count: errorEvents, error: errorError } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'erro');

      if (errorError) {
        console.error('Erro ao buscar eventos de erro:', errorError);
        throw errorError;
      }

      // Eventos recentes (últimos 5)
      const { data: recentEvents, error: recentError } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) {
        console.error('Erro ao buscar eventos recentes:', recentError);
        throw recentError;
      }

      const stats = {
        totalEvents: totalEvents || 0,
        successEvents: successEvents || 0,
        errorEvents: errorEvents || 0,
        recentEvents: recentEvents || [],
      };

      console.log('Estatísticas carregadas:', stats);
      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas de webhook:', error);
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
      { value: 'assinatura aprovada', label: 'Assinatura Aprovada' },
      { value: 'assinatura renovada', label: 'Assinatura Renovada' },
      { value: 'assinatura cancelada', label: 'Assinatura Cancelada' },
      { value: 'assinatura atrasada', label: 'Assinatura Atrasada' },
      { value: 'assinatura expirada', label: 'Assinatura Expirada' },
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

  // Obter plano aplicado baseado no produto
  getPlanoFromProduct(produto: string): string {
    const produtoLower = produto.toLowerCase();
    
    if (produtoLower.includes('professor')) {
      return 'professor';
    } else if (produtoLower.includes('grupo escolar')) {
      return 'grupo_escolar';
    }
    
    return 'gratuito';
  }

  // Obter status badge color
  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'sucesso':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'erro':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
}

export const webhookService = new WebhookService(); 