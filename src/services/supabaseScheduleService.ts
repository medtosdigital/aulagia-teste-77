import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DatabaseCalendarEvent = Database['public']['Tables']['calendar_events']['Row'];
type DatabaseCalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert'];

export interface CalendarEvent {
  id: string;
  user_id: string;
  material_ids?: string[];
  title: string;
  event_type: 'single' | 'multiple';
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  description?: string;
  classroom?: string;
  recurrence?: any;
  created_at: string;
  updated_at: string;
}

// Helper function to convert database event to CalendarEvent
const convertDatabaseEventToCalendarEvent = (dbEvent: DatabaseCalendarEvent): CalendarEvent => {
  return {
    id: dbEvent.id,
    user_id: dbEvent.user_id,
    material_ids: dbEvent.material_ids ? JSON.parse(dbEvent.material_ids) : [],
    title: dbEvent.title,
    event_type: (dbEvent.event_type === 'multiple' ? 'multiple' : 'single') as 'single' | 'multiple',
    start_date: dbEvent.start_date,
    end_date: dbEvent.end_date,
    start_time: dbEvent.start_time,
    end_time: dbEvent.end_time,
    description: dbEvent.description || undefined,
    classroom: dbEvent.classroom || undefined,
    recurrence: dbEvent.recurrence || undefined,
    created_at: dbEvent.created_at,
    updated_at: dbEvent.updated_at
  };
};

export const supabaseScheduleService = {
  async getEvents(): Promise<CalendarEvent[]> {
    console.log('Buscando eventos do calendário no Supabase...');
    
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    }

    return (data || []).map(convertDatabaseEventToCalendarEvent);
  },

  async saveEvent(eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent | null> {
    console.log('Salvando evento no Supabase:', eventData);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    const insertData: DatabaseCalendarEventInsert = {
      user_id: user.id,
      material_ids: JSON.stringify(eventData.material_ids || []),
      title: eventData.title,
      event_type: eventData.event_type,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      description: eventData.description || null,
      classroom: eventData.classroom || null,
      recurrence: eventData.recurrence || null
    };
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(insertData)
      .select()
      .single();
    if (error) {
      console.error('Erro ao salvar evento:', error);
      throw error;
    }
    return data ? convertDatabaseEventToCalendarEvent(data) : null;
  },

  async updateEvent(id: string, eventData: Partial<CalendarEvent>): Promise<boolean> {
    console.log('Atualizando evento no Supabase:', id, eventData);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    // Remove campos que não devem ser atualizados
    const { id: _, user_id, created_at, updated_at, ...updateData } = eventData;
    const { error } = await supabase
      .from('calendar_events')
      .update({
        ...updateData,
        material_ids: updateData.material_ids ? JSON.stringify(updateData.material_ids) : JSON.stringify([]),
        description: updateData.description || null,
        classroom: updateData.classroom || null,
        recurrence: updateData.recurrence || null
      })
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
    return true;
  },

  async deleteEvent(id: string): Promise<boolean> {
    console.log('Excluindo evento no Supabase:', id);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao excluir evento:', error);
      throw error;
    }

    return true;
  },

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    console.log('Buscando eventos por range de datas no Supabase:', startDate, endDate);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_date', startDateStr)
      .lte('end_date', endDateStr)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar eventos por range:', error);
      throw error;
    }

    return (data || []).map(convertDatabaseEventToCalendarEvent);
  }
};
