import { useState, useEffect, useCallback } from 'react';
import { supabaseScheduleService, CalendarEvent } from '@/services/supabaseScheduleService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseSchedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Carregando eventos do calendário para usuário:', user.id);
      
      const userEvents = await supabaseScheduleService.getEvents();
      console.log('Eventos carregados:', userEvents);
      
      setEvents(userEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast({
        title: "Erro ao carregar eventos",
        description: "Não foi possível carregar os eventos do calendário.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const saveEvent = async (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent | null> => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para criar eventos.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const newEvent = await supabaseScheduleService.saveEvent(eventData);
      
      if (newEvent) {
        await loadEvents(); // Recarregar eventos
        toast({
          title: "Evento criado",
          description: "O evento foi criado com sucesso.",
        });
        return newEvent;
      } else {
        toast({
          title: "Erro ao criar evento",
          description: "Não foi possível criar o evento.",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao criar o evento.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<CalendarEvent>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para atualizar eventos.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const success = await supabaseScheduleService.updateEvent(id, eventData);
      
      if (success) {
        await loadEvents(); // Recarregar eventos
        toast({
          title: "Evento atualizado",
          description: "O evento foi atualizado com sucesso.",
        });
        return true;
      } else {
        toast({
          title: "Erro ao atualizar evento",
          description: "Não foi possível atualizar o evento.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao atualizar o evento.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para deletar eventos.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const success = await supabaseScheduleService.deleteEvent(id);
      
      if (success) {
        await loadEvents(); // Recarregar eventos
        toast({
          title: "Evento excluído",
          description: "O evento foi excluído com sucesso.",
        });
        return true;
      } else {
        toast({
          title: "Erro ao excluir evento",
          description: "Não foi possível excluir o evento.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao excluir o evento.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getEventsByDateRange = async (startDate: Date, endDate: Date): Promise<CalendarEvent[]> => {
    if (!user) return [];

    try {
      return await supabaseScheduleService.getEventsByDateRange(startDate, endDate);
    } catch (error) {
      console.error('Erro ao buscar eventos por range:', error);
      return [];
    }
  };

  return {
    events,
    loading,
    saveEvent,
    updateEvent,
    deleteEvent,
    getEventsByDateRange,
    refreshEvents: loadEvents
  };
};
