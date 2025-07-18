
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
      // Use the webhook URL directly with the project ID
      const webhookUrl = `https://xmxpteviwcnrljtxvaoo.supabase.co/functions/v1/webhook-handler`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHB0ZXZpd2NucmxqdHh2YW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTc5NzMsImV4cCI6MjA2Njc5Mzk3M30.-wSm455jQbizGZn4ceJATXyftbjBhfXA_l0ZZc5IieU`
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
