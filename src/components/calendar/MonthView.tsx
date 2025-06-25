
import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScheduleEvent } from '@/services/scheduleService';
import EventCard from './EventCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface MonthViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  showWeekends: boolean;
  onDateClick: (date: Date) => void;
  onEventClick: (event: ScheduleEvent) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (event: ScheduleEvent) => void;
  onViewMaterial: (event: ScheduleEvent) => void;
  onToggleWeekends: () => void;
  getEventsForDate: (date: Date) => ScheduleEvent[];
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  showWeekends,
  onDateClick,
  onEventClick,
  onEditEvent,
  onDeleteEvent,
  onViewMaterial,
  onToggleWeekends,
  getEventsForDate
}) => {
  const isMobile = useIsMobile();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const rows = [];
  let days = [];
  let day = startDate;

  const weekDays = showWeekends 
    ? (isMobile ? ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'])
    : (isMobile ? ['S', 'T', 'Q', 'Q', 'S'] : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);

  const daysToShow = showWeekends ? 7 : 5;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      if (!showWeekends && isWeekend(day)) {
        day = addDays(day, 1);
        continue;
      }

      const dayEvents = getEventsForDate(day);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isCurrentDay = isToday(day);
      const currentDay = new Date(day);

      days.push(
        <div
          key={day.toString()}
          className={`${isMobile ? 'min-h-[100px] p-2' : 'min-h-[120px] p-3'} border border-gray-200 cursor-pointer hover:bg-blue-50 transition-all duration-200 ${
            !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:shadow-md'
          } ${isCurrentDay ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : ''}`}
          onClick={() => onDateClick(currentDay)}
        >
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold mb-2 ${
            isCurrentDay 
              ? 'text-blue-600' 
              : isCurrentMonth 
                ? 'text-gray-900' 
                : 'text-gray-400'
          }`}>
            {format(day, 'd')}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, isMobile ? 1 : 2).map(event => (
              <EventCard
                key={event.id}
                event={event}
                compact={true}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                onViewMaterial={onViewMaterial}
                isMobile={isMobile}
              />
            ))}
            {dayEvents.length > (isMobile ? 1 : 2) && (
              <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-blue-600 font-medium bg-blue-100 p-1 rounded text-center`}>
                +{dayEvents.length - (isMobile ? 1 : 2)} mais
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);

      if (days.length === daysToShow) break;
    }
    
    if (days.length > 0) {
      rows.push(
        <div key={day.toString()} className={`grid gap-0 ${showWeekends ? 'grid-cols-7' : 'grid-cols-5'}`}>
          {days}
        </div>
      );
      days = [];
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-6 border border-blue-100">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              {events.length} material{events.length !== 1 ? 'is' : ''} agendado{events.length !== 1 ? 's' : ''} este mês
            </p>
          </div>
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={onToggleWeekends}
            className="flex items-center gap-2 text-xs md:text-sm"
          >
            <Settings className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">
              {showWeekends ? 'Esconder fins de semana' : 'Mostrar fins de semana'}
            </span>
            <span className="sm:hidden">
              {showWeekends ? 'Sem FDS' : 'Com FDS'}
            </span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className={`grid gap-0 border-b border-gray-200 ${showWeekends ? 'grid-cols-7' : 'grid-cols-5'}`}>
          {weekDays.map((dayName, index) => (
            <div key={dayName} className={`${isMobile ? 'p-2' : 'p-4'} text-center font-bold text-gray-700 bg-gray-50 border-r border-gray-200 last:border-r-0 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {dayName}
            </div>
          ))}
        </div>
        <div className="space-y-0">
          {rows}
        </div>
      </div>
    </div>
  );
};

export default MonthView;
