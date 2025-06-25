
import React, { useState, useEffect } from 'react';
import { Calendar, CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, BookOpen, Edit3, Trash2, GraduationCap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addWeeks, addMonths, addYears, isSameMonth, isSameDay, isToday, startOfDay, endOfDay, startOfYear, endOfYear, getWeek, getDaysInMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { scheduleService, ScheduleEvent } from '@/services/scheduleService';
import ScheduleModal from './ScheduleModal';
import { toast } from 'sonner';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  useEffect(() => {
    loadEvents();
  }, [currentDate, view]);

  const loadEvents = () => {
    let startDate: Date, endDate: Date;

    switch (view) {
      case 'day':
        startDate = startOfDay(currentDate);
        endDate = endOfDay(currentDate);
        break;
      case 'week':
        startDate = startOfWeek(currentDate, { locale: ptBR });
        endDate = endOfWeek(currentDate, { locale: ptBR });
        break;
      case 'month':
        startDate = startOfWeek(startOfMonth(currentDate), { locale: ptBR });
        endDate = endOfWeek(endOfMonth(currentDate), { locale: ptBR });
        break;
      case 'year':
        startDate = startOfYear(currentDate);
        endDate = endOfYear(currentDate);
        break;
    }

    const rangeEvents = scheduleService.getEventsByDateRange(startDate, endDate);
    
    const expandedEvents: ScheduleEvent[] = [];
    rangeEvents.forEach(event => {
      const expanded = scheduleService.expandRecurringEvents(event, startDate, endDate);
      expandedEvents.push(...expanded);
    });

    setEvents(expandedEvents);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate: Date;
    
    switch (view) {
      case 'day':
        newDate = direction === 'next' ? addDays(currentDate, 1) : addDays(currentDate, -1);
        break;
      case 'week':
        newDate = direction === 'next' ? addWeeks(currentDate, 1) : addWeeks(currentDate, -1);
        break;
      case 'month':
        newDate = direction === 'next' ? addMonths(currentDate, 1) : addMonths(currentDate, -1);
        break;
      case 'year':
        newDate = direction === 'next' ? addYears(currentDate, 1) : addYears(currentDate, -1);
        break;
    }
    
    setCurrentDate(newDate);
  };

  const getEventsForDate = (date: Date): ScheduleEvent[] => {
    return events.filter(event => isSameDay(event.startDate, date));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setModalOpen(true);
  };

  const handleDeleteEvent = (event: ScheduleEvent) => {
    if (window.confirm(`Tem certeza que deseja excluir "${event.title}"?`)) {
      const success = scheduleService.deleteEvent(event.id.split('-')[0]);
      if (success) {
        toast.success('Agendamento excluído com sucesso!');
        loadEvents();
      } else {
        toast.error('Erro ao excluir agendamento');
      }
    }
  };

  const getDateRangeText = () => {
    switch (view) {
      case 'day':
        return format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        const weekStart = startOfWeek(currentDate, { locale: ptBR });
        const weekEnd = endOfWeek(currentDate, { locale: ptBR });
        return `${format(weekStart, "dd/MM", { locale: ptBR })} - ${format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}`;
      case 'month':
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'year':
        return format(currentDate, "yyyy", { locale: ptBR });
    }
  };

  const EventCard = ({ event, showDate = false }: { event: ScheduleEvent; showDate?: boolean }) => (
    <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
              <Badge variant="secondary" className="text-xs">{event.subject}</Badge>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              {showDate && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-3 h-3 flex-shrink-0" />
                  {format(event.startDate, "dd/MM/yyyy", { locale: ptBR })}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>{event.startTime} - {event.endTime}</span>
              </div>
              {event.classroom && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{event.classroom}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs">{event.grade}</span>
              </div>
            </div>
            
            {event.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
            )}
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEventClick(event);
              }}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteEvent(event);
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="space-y-4">
        {dayEvents.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma aula agendada</h3>
              <p className="text-gray-500 mb-4">Que tal agendar um material para hoje?</p>
              <Button onClick={() => handleDateClick(currentDate)} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Agendar Material
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {dayEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { locale: ptBR });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map(day => {
            const dayEvents = getEventsForDate(day);
            const isCurrentDay = isToday(day);
            
            return (
              <div key={day.toString()} className="space-y-2">
                <div className={`text-center p-3 rounded-lg ${isCurrentDay ? 'bg-blue-500 text-white' : 'bg-gray-50'}`}>
                  <div className="text-xs font-medium">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className={`text-lg font-bold ${isCurrentDay ? 'text-white' : 'text-gray-900'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
                
                <div className="space-y-2 min-h-[200px]">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-2 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="font-medium text-blue-900 truncate">{event.title}</div>
                      <div className="text-blue-700">{event.startTime}</div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => handleDateClick(day)}
                    className="w-full text-xs p-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });

    const rows = [];
    let days = [];
    let day = startDate;

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayEvents = getEventsForDate(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isCurrentDay = isToday(day);
        const currentDay = new Date(day);

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[100px] md:min-h-[120px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
              !isCurrentMonth ? 'bg-gray-100 text-gray-400' : 'bg-white'
            } ${isCurrentDay ? 'bg-blue-50 border-blue-300' : ''}`}
            onClick={() => handleDateClick(currentDay)}
          >
            <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 2).map(event => (
                <div
                  key={event.id}
                  className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                >
                  {event.startTime} {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{dayEvents.length - 2} mais
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-0">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="space-y-0 bg-white rounded-lg border overflow-hidden">
        <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
          {weekDays.map(dayName => (
            <div key={dayName} className="p-3 md:p-4 text-center font-medium text-gray-600 bg-gray-50 border-r border-gray-200 last:border-r-0 text-sm md:text-base">
              {dayName}
            </div>
          ))}
        </div>
        <div className="space-y-0">
          {rows}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map(month => {
          const monthEvents = events.filter(event => 
            event.startDate.getFullYear() === year && 
            event.startDate.getMonth() === month.getMonth()
          );

          return (
            <Card 
              key={month.toString()} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setCurrentDate(month);
                setView('month');
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-center">
                  {format(month, 'MMMM', { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center mb-3">
                  <div className="text-2xl font-bold text-blue-500">
                    {monthEvents.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {monthEvents.length === 1 ? 'agendamento' : 'agendamentos'}
                  </div>
                </div>
                
                {monthEvents.length > 0 && (
                  <div className="space-y-1">
                    {monthEvents.slice(0, 3).map(event => (
                      <div key={event.id} className="text-xs p-1 bg-gray-100 rounded truncate">
                        {event.title}
                      </div>
                    ))}
                    {monthEvents.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{monthEvents.length - 3} mais
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Calendário de Materiais</h1>
              <p className="text-gray-600">Organize e acompanhe seus agendamentos pedagógicos</p>
            </div>
            <Button 
              onClick={() => handleDateClick(new Date())} 
              className="bg-blue-500 hover:bg-blue-600 w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>

          {/* Navigation Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center justify-center md:justify-start space-x-4">
                  <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-lg font-semibold min-w-[200px] text-center">
                    {getDateRangeText()}
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <Tabs value={view} onValueChange={(value: any) => setView(value)} className="w-full md:w-auto">
                  <TabsList className="grid w-full grid-cols-4 md:w-auto">
                    <TabsTrigger value="day" className="text-xs md:text-sm">Dia</TabsTrigger>
                    <TabsTrigger value="week" className="text-xs md:text-sm">Semana</TabsTrigger>
                    <TabsTrigger value="month" className="text-xs md:text-sm">Mês</TabsTrigger>
                    <TabsTrigger value="year" className="text-xs md:text-sm">Ano</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Content */}
        <div className="space-y-4">
          {view === 'day' && renderDayView()}
          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
          {view === 'year' && renderYearView()}
        </div>
      </div>

      <ScheduleModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEvent(null);
          setSelectedDate(undefined);
        }}
        onSave={loadEvents}
        event={selectedEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default CalendarPage;
