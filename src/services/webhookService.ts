
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

export const webhookService = {
  // Buscar logs de webhook com paginação
  async getWebhookLogs(limit = 50, offset = 0): Promise<WebhookLog[]> {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erro ao buscar logs de webhook:', error);
      throw error;
    }

    return data || [];
  },

  // Buscar logs por email
  async getLogsByEmail(email: string): Promise<WebhookLog[]> {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar logs por email:', error);
      throw error;
    }

    return data || [];
  },

  // Buscar logs por evento
  async getLogsByEvent(evento: string): Promise<WebhookLog[]> {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('evento', evento)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar logs por evento:', error);
      throw error;
    }

    return data || [];
  },

  // Buscar logs por status
  async getLogsByStatus(status: string): Promise<WebhookLog[]> {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar logs por status:', error);
      throw error;
    }

    return data || [];
  },

  // Contar total de logs
  async getLogsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('webhook_logs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Erro ao contar logs:', error);
      throw error;
    }

    return count || 0;
  },

  // Testar webhook (para desenvolvimento)
  async testWebhook(testData: any): Promise<boolean> {
    try {
      // Get the webhook URL from the edge function
      const webhookUrl = `${supabase.supabaseUrl}/functions/v1/webhook-handler`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify(testData)
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      return false;
    }
  }
};
