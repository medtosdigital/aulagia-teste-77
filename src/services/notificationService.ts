import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

// Adicionar campos opcionais: icon (string) e image_url (string)
export interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  data_envio: string;
  ativa: boolean;
  criada_por: string;
  lida_por: string[];
  created_at: string;
  updated_at: string;
  icon?: string; // emoji ou nome do ícone
  image_url?: string; // url da imagem
}

class NotificationService {
  async createNotification(titulo: string, mensagem: string, criada_por: string, icon?: string, image_url?: string) {
    const { data, error } = await supabase.from('notificacoes').insert([
      { titulo, mensagem, criada_por, icon, image_url } 
    ]).select().single();
    if (error) throw error;
    return data;
  }

  async getActiveNotifications() {
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('ativa', true)
      .order('data_envio', { ascending: false });
    if (error) throw error;
    return (data || []) as Notification[];
  }

  async markAsRead(notificationId: string, userId: string) {
    // Adiciona userId ao array lida_por se ainda não estiver
    const { error } = await supabase.rpc('mark_notification_as_read', {
      notification_id: notificationId,
      user_id: userId
    });
    if (error) throw error;
    return true;
  }

  async deleteNotification(id: string) {
    const { error } = await supabase.from('notificacoes').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  async updateNotification(id: string, updates: { titulo?: string; mensagem?: string; icon?: string; image_url?: string }) {
    const { error } = await supabase.from('notificacoes').update(updates).eq('id', id);
    if (error) throw error;
    return true;
  }
}

export const notificationService = new NotificationService(); 