
import { supabase } from '@/integrations/supabase/client';

export interface CalendarEvent {
  id: string;
  user_id: string;
  material_id?: string;
  title: string;
  subject?: string;
  grade?: string;
  event_type: 'single' | 'multiple';
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  description?: string;
  classroom?: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    days?: string[];
    endDate: string;
  };
  created_at: string;
  updated_at: string;
}

class SupabaseScheduleService {
  // Obter eventos do usuário
  async getEvents(): Promise<CalendarEvent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado para buscar eventos');
        return [];
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro em getEvents:', error);
      return [];
    }
  }

  // Salvar evento
  async saveEvent(event: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado para criar evento');
        return null;
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          ...event,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar evento:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro em saveEvent:', error);
      return null;
    }
  }

  // Atualizar evento
  async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado para atualizar evento');
        return false;
      }

      const { error } = await supabase
        .from('calendar_events')
        .update(event)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar evento:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro em updateEvent:', error);
      return false;
    }
  }

  // Deletar evento
  async deleteEvent(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado para deletar evento');
        return false;
      }

      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar evento:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro em deleteEvent:', error);
      return false;
    }
  }

  // Obter eventos por range de data
  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado para buscar eventos por range');
        return [];
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_date', startDate.toISOString().split('T')[0])
        .lte('end_date', endDate.toISOString().split('T')[0])
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar eventos por range:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro em getEventsByDateRange:', error);
      return [];
    }
  }
}

export const supabaseScheduleService = new SupabaseScheduleService();
