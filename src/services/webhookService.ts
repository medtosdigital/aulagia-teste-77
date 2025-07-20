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
  private readonly SECURITY_TOKEN = 'q64w1ncxx2k';

  // Obter URL do webhook
  getWebhookUrl(): string {
    return this.WEBHOOK_URL;
  }

  // Obter token de segurança
  getSecurityToken(): string {
    return this.SECURITY_TOKEN;
  }

  // Simular webhook da Kiwify
  async simulateWebhook(simulation: WebhookSimulation): Promise<{ success: boolean; message: string; plano_aplicado?: string }> {
    try {
      console.log('🚀 Simulando webhook da Kiwify com dados:', simulation);
      console.log('🌐 URL do webhook:', this.WEBHOOK_URL);
      
      // Validar dados de entrada
      if (!simulation.email || !simulation.evento) {
        console.error('❌ Dados inválidos:', { email: simulation.email, evento: simulation.evento });
        return {
          success: false,
          message: 'Email e evento são obrigatórios',
        };
      }

      // Verificar se o usuário existe no banco antes de simular (apenas para usuários reais)
      if (!simulation.email.includes('@exemplo.com')) {
        console.log('🔍 Verificando se usuário existe na tabela perfis:', simulation.email);
        const { data: user, error: userError } = await supabase
          .from('perfis')
          .select('user_id, email, plano_ativo')
          .eq('email', simulation.email)
          .single();

        if (userError || !user) {
          console.error('❌ Usuário não encontrado na tabela perfis:', simulation.email, userError);
          return {
            success: false,
            message: `Usuário não encontrado: ${simulation.email}. Verifique se o email está correto e se o usuário existe na tabela perfis.`,
          };
        }

        console.log('✅ Usuário encontrado na tabela perfis:', user);
        console.log('📋 Plano atual do usuário:', user.plano_ativo);
      }
      
      // Preparar payload para o webhook (simulando dados da Kiwify)
      const payload = {
        email: simulation.email,
        evento: simulation.evento,
        produto: simulation.produto,
        token: simulation.token || this.SECURITY_TOKEN,
      };

      console.log('📤 Enviando payload para webhook:', payload);
      console.log('🔗 Fazendo requisição para:', this.WEBHOOK_URL);
      
      // Headers sem autenticação (função pública)
      const headers = {
        'Content-Type': 'application/json',
      };
      
      console.log('🔑 Headers:', headers);
      
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      console.log('📥 Status da resposta:', response.status);
      console.log('📥 Headers da resposta:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('📥 Resposta do webhook:', result);

      if (!response.ok) {
        console.error('❌ Erro na resposta do webhook:', response.status, result);
        return {
          success: false,
          message: result.error || result.message || `Erro ${response.status}: ${response.statusText}`,
        };
      }

      console.log('✅ Webhook processado com sucesso');
      
      return {
        success: true,
        message: `Webhook simulado com sucesso! Plano aplicado: ${result.plano_aplicado}`,
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
      
      // Total de eventos
      const { count: totalEvents, error: totalError } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        console.error('❌ Erro ao buscar total de eventos:', totalError);
        throw totalError;
      }

      // Eventos de sucesso
      const { count: successEvents, error: successError } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sucesso');

      if (successError) {
        console.error('❌ Erro ao buscar eventos de sucesso:', successError);
        throw successError;
      }

      // Eventos de erro
      const { count: errorEvents, error: errorError } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'erro');

      if (errorError) {
        console.error('❌ Erro ao buscar eventos de erro:', errorError);
        throw errorError;
      }

      // Eventos recentes (últimos 5)
      const { data: recentEvents, error: recentError } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) {
        console.error('❌ Erro ao buscar eventos recentes:', recentError);
        throw recentError;
      }

      const stats = {
        totalEvents: totalEvents || 0,
        successEvents: successEvents || 0,
        errorEvents: errorEvents || 0,
        recentEvents: recentEvents || [],
      };

      console.log('📊 Estatísticas carregadas:', stats);
      return stats;
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

  // Obter opções de eventos para simulação - Eventos da Kiwify
  getEventOptions(): { value: string; label: string }[] {
    return [
      { value: 'compra aprovada', label: 'Compra Aprovada' },
      { value: 'assinatura aprovada', label: 'Assinatura Aprovada' },
      { value: 'assinatura renovada', label: 'Assinatura Renovada' },
      { value: 'assinatura cancelada', label: 'Assinatura Cancelada' },
      { value: 'assinatura atrasada', label: 'Assinatura Atrasada' },
      { value: 'compra cancelada', label: 'Compra Cancelada' },
    ];
  }

  // Obter opções de produtos para simulação - Produtos da Kiwify
  getProductOptions(): { value: string; label: string }[] {
    return [
      { value: 'Plano Professor (Mensal)', label: 'Plano Professor (Mensal)' },
      { value: 'Plano Professor (Anual)', label: 'Plano Professor (Anual)' },
      { value: 'Plano Grupo Escolar (Mensal)', label: 'Plano Grupo Escolar (Mensal)' },
      { value: 'Plano Grupo Escolar (Anual)', label: 'Plano Grupo Escolar (Anual)' },
    ];
  }

  // Obter plano aplicado baseado no produto da Kiwify
  getPlanoFromProduct(produto: string): { plano: string; billingType: string } {
    const produtoLower = produto.toLowerCase();
    
    let plano = 'gratuito';
    let billingType = 'gratuito';
    
    if (produtoLower.includes('professor')) {
      plano = 'professor';
    } else if (produtoLower.includes('grupo escolar')) {
      plano = 'grupo_escolar';
    }
    
    if (produtoLower.includes('mensal')) {
      billingType = 'mensal';
    } else if (produtoLower.includes('anual')) {
      billingType = 'anual';
    }
    
    return { plano, billingType };
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

  // Testar conectividade da Edge Function
  async testWebhookConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testando conectividade da Edge Function...');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: 'teste@exemplo.com',
          evento: 'teste_conectividade',
          token: this.SECURITY_TOKEN,
        }),
      });

      console.log('📥 Status do teste:', response.status);
      const result = await response.json();
      console.log('📥 Resultado do teste:', result);
      
      return response.ok;
    } catch (error) {
      console.error('❌ Erro no teste de conectividade:', error);
      return false;
    }
  }

  // Verificar se um usuário existe na tabela perfis
  async checkUserExists(email: string): Promise<{ exists: boolean; user?: any }> {
    try {
      const { data: user, error } = await supabase
        .from('perfis')
        .select('user_id, email, plano_ativo')
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
