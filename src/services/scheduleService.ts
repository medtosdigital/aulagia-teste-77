
export interface ScheduleEvent {
  id: string;
  materialId: string;
  title: string;
  subject: string;
  grade: string;
  schedule_type: 'unica' | 'recorrente';
  event_type: 'aula' | 'avaliacao';
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    days?: string[]; // Para aulas semanais: ['monday', 'wednesday', 'friday']
    endDate: Date;
  };
  description?: string;
  classroom?: string;
  createdAt: Date;
}

class ScheduleService {
  private storageKey = 'teaching-materials-schedule';

  getEvents(): ScheduleEvent[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    
    const events = JSON.parse(stored);
    return events.map((event: any) => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      createdAt: new Date(event.createdAt),
      recurrence: event.recurrence ? {
        ...event.recurrence,
        endDate: new Date(event.recurrence.endDate)
      } : undefined
    }));
  }

  // Add the missing getUpcomingClasses method
  getUpcomingClasses(limit: number = 5): ScheduleEvent[] {
    const events = this.getEvents();
    const now = new Date();
    
    // Filter for upcoming events
    const upcomingEvents = events.filter(event => {
      return event.startDate >= now;
    });
    
    // Sort by start date and limit results
    return upcomingEvents
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, limit);
  }

  saveEvent(event: Omit<ScheduleEvent, 'id' | 'createdAt'>): ScheduleEvent {
    const events = this.getEvents();
    const newEvent: ScheduleEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    events.push(newEvent);
    localStorage.setItem(this.storageKey, JSON.stringify(events));
    return newEvent;
  }

  updateEvent(id: string, event: Partial<ScheduleEvent>): boolean {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === id);
    
    if (index === -1) return false;
    
    events[index] = { ...events[index], ...event };
    localStorage.setItem(this.storageKey, JSON.stringify(events));
    return true;
  }

  deleteEvent(id: string): boolean {
    const events = this.getEvents();
    const filteredEvents = events.filter(e => e.id !== id);
    
    if (filteredEvents.length === events.length) return false;
    
    localStorage.setItem(this.storageKey, JSON.stringify(filteredEvents));
    return true;
  }

  getEventsByDateRange(startDate: Date, endDate: Date): ScheduleEvent[] {
    const events = this.getEvents();
    return events.filter(event => {
      // Para eventos únicos
      if (event.schedule_type === 'unica') {
        return event.startDate >= startDate && event.startDate <= endDate;
      }
      
      // Para eventos múltiplos/recorrentes
      if (event.recurrence) {
        return event.startDate <= endDate && event.recurrence.endDate >= startDate;
      }
      
      return event.startDate >= startDate && event.endDate <= endDate;
    });
  }

  expandRecurringEvents(event: ScheduleEvent, startDate: Date, endDate: Date): ScheduleEvent[] {
    if (event.schedule_type === 'unica' || !event.recurrence) {
      return [event];
    }

    const expanded: ScheduleEvent[] = [];
    const { frequency, days, endDate: recurrenceEnd } = event.recurrence;
    
    // Mapear dias da semana para números (0 = domingo, 1 = segunda, etc.)
    const dayMap: { [key: string]: number } = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    
    // Começar a partir da data de início do evento
    const currentDate = new Date(event.startDate);
    currentDate.setHours(0, 0, 0, 0);
    
    const endDateLimit = new Date(Math.min(recurrenceEnd.getTime(), endDate.getTime()));
    
    while (currentDate <= endDateLimit) {
      // Verificar se a data atual está dentro do range solicitado
      if (currentDate >= startDate) {
        // Para aulas semanais com dias específicos
        if (frequency === 'weekly' && days && days.length > 0) {
          const currentDayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          
          if (days.includes(currentDayName)) {
            const expandedEvent: ScheduleEvent = {
              ...event,
              id: `${event.id}-${currentDate.getTime()}`,
              startDate: new Date(currentDate),
              endDate: new Date(currentDate)
            };
            expanded.push(expandedEvent);
          }
        }
        // Para outras frequências
        else if (frequency === 'daily') {
          const expandedEvent: ScheduleEvent = {
            ...event,
            id: `${event.id}-${currentDate.getTime()}`,
            startDate: new Date(currentDate),
            endDate: new Date(currentDate)
          };
          expanded.push(expandedEvent);
        }
      }
      
      // Avançar para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return expanded;
  }
}

export const scheduleService = new ScheduleService();
