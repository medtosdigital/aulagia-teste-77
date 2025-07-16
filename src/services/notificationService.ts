
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
  async uploadImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('notificacoes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Erro no upload da imagem:', error);
      throw new Error('Falha ao fazer upload da imagem');
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('notificacoes')
      .getPublicUrl(fileName);
    
    return publicUrlData.publicUrl;
  }

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
    // Get current notification
    const { data: notification, error: fetchError } = await supabase
      .from('notificacoes')
      .select('lida_por')
      .eq('id', notificationId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Check if user already read it
    const currentReadBy = notification?.lida_por || [];
    if (currentReadBy.includes(userId)) {
      return true; // Already marked as read
    }
    
    // Add user to lida_por array
    const updatedReadBy = [...currentReadBy, userId];
    
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida_por: updatedReadBy })
      .eq('id', notificationId);
    
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
