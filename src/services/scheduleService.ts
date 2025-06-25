
export interface ScheduleEvent {
  id: string;
  materialId: string;
  title: string;
  subject: string;
  grade: string;
  type: 'single' | 'multiple';
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
      if (event.type === 'single') {
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
    if (event.type === 'single' || !event.recurrence) {
      return [event];
    }

    const expanded: ScheduleEvent[] = [];
    const { frequency, days, endDate: recurrenceEnd } = event.recurrence;
    
    let currentDate = new Date(event.startDate);
    
    while (currentDate <= recurrenceEnd && currentDate <= endDate) {
      if (currentDate >= startDate) {
        const expandedEvent: ScheduleEvent = {
          ...event,
          id: `${event.id}-${currentDate.getTime()}`,
          startDate: new Date(currentDate),
          endDate: new Date(currentDate)
        };
        expanded.push(expandedEvent);
      }
      
      // Avançar para a próxima data baseada na frequência
      if (frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (frequency === 'weekly') {
        if (days && days.length > 0) {
          // Lógica para dias específicos da semana
          let found = false;
          for (let i = 1; i <= 7 && !found; i++) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + i);
            const dayName = nextDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
            if (days.includes(dayName)) {
              currentDate = nextDate;
              found = true;
            }
          }
          if (!found) break;
        } else {
          currentDate.setDate(currentDate.getDate() + 7);
        }
      } else if (frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    return expanded;
  }
}

export const scheduleService = new ScheduleService();
