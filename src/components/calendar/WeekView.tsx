
import React from 'react';
import { CalendarIcon, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, startOfWeek, endOfWeek, addDays, isToday, isSameMonth, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScheduleEvent } from '@/services/scheduleService';
import EventCard from './EventCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface WeekViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  showFullWeek: boolean;
  showWeekends: boolean;
  onDateClick: (date: Date) => void;
  onEventClick: (event: ScheduleEvent) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (event: ScheduleEvent) => void;
  onViewMaterial: (event: ScheduleEvent) => void;
  onToggleFullWeek: () => void;
  onToggleWeekends: () => void;
  getEventsForDate: (date: Date) => ScheduleEvent[];
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  showFullWeek,
  showWeekends,
  onDateClick,
  onEventClick,
  onEditEvent,
  onDeleteEvent,
  onViewMaterial,
  onToggleFullWeek,
  onToggleWeekends,
  getEventsForDate
}) => {
  const isMobile = useIsMobile();
  let weekDays: Date[];
  
  if (showFullWeek) {
    const weekStart = startOfWeek(currentDate, { locale: ptBR });
    weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  } else {
    const today = new Date();
    const endOfCurrentWeek = endOfWeek(today, { locale: ptBR });
    const daysUntilEndOfWeek = Math.ceil((endOfCurrentWeek.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    weekDays = Array.from({ length: daysUntilEndOfWeek }, (_, i) => addDays(today, i));
  }

  if (!showWeekends) {
    weekDays = weekDays.filter(day => !isWeekend(day));
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-6 border border-blue-100">
        <div className="flex flex-col space-y-4 md:items-center md:justify-between md:space-y-0 md:flex-row">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Visão Semanal</h2>
            <p className="text-sm md:text-base text-gray-600">
              {showFullWeek 
                ? `${format(weekDays[0], "dd/MM", { locale: ptBR })} - ${format(weekDays[weekDays.length - 1], "dd/MM/yyyy", { locale: ptBR })}`
                : `A partir de hoje - ${format(weekDays[weekDays.length - 1], "dd/MM/yyyy", { locale: ptBR })}`
              }
            </p>
          </div>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-3 md:space-y-0">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={onToggleFullWeek}
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              <CalendarIcon className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">
                {showFullWeek ? 'A partir de hoje' : 'Semana completa'}
              </span>
              <span className="sm:hidden">
                {showFullWeek ? 'De hoje' : 'Completa'}
              </span>
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={onToggleWeekends}
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              <Settings className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">
                {showWeekends ? 'Ocultar fins de semana' : 'Mostrar fins de semana'}
              </span>
              <span className="sm:hidden">
                {showWeekends ? 'Sem FDS' : 'Com FDS'}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className={`grid gap-3 md:gap-4 ${
        isMobile 
          ? 'grid-cols-1'
          : weekDays.length <= 5 
            ? 'lg:grid-cols-5' 
            : weekDays.length === 6 
              ? 'lg:grid-cols-6' 
              : 'lg:grid-cols-7'
      } ${!isMobile && weekDays.length <= 3 ? 'md:grid-cols-3' : !isMobile ? 'md:grid-cols-2' : ''}`}>
        {weekDays.map(day => {
          const dayEvents = getEventsForDate(day);
          const isCurrentDay = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div key={day.toString()} className="space-y-3">
              <div className={`text-center ${isMobile ? 'p-3' : 'p-4'} rounded-xl transition-all cursor-pointer hover:scale-105 ${
                isCurrentDay 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg' 
                  : isCurrentMonth 
                    ? 'bg-white border-2 border-gray-200 hover:border-blue-300' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                <div className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium uppercase tracking-wide`}>
                  {format(day, isMobile ? 'EEE' : 'EEE', { locale: ptBR })}
                </div>
                <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mt-1 ${
                  isCurrentDay ? 'text-white' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {format(day, 'd')}
                </div>
                {dayEvents.length > 0 && (
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} mt-2 px-2 py-1 rounded-full ${
                    isCurrentDay ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {dayEvents.length} material{dayEvents.length !== 1 ? 'is' : ''}
                  </div>
                )}
              </div>
              
              <div className={`space-y-2 ${isMobile ? 'min-h-[200px]' : 'min-h-[300px]'}`}>
                {dayEvents
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .slice(0, isMobile ? 2 : 4)
                  .map(event => (
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
                
                {dayEvents.length > (isMobile ? 2 : 4) && (
                  <div className="text-xs text-blue-600 font-medium bg-blue-100 p-2 rounded text-center">
                    +{dayEvents.length - (isMobile ? 2 : 4)} mais
                  </div>
                )}
                
                <button
                  onClick={() => onDateClick(day)}
                  className={`w-full ${isMobile ? 'text-xs p-2' : 'text-sm p-3'} border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all`}
                >
                  <Plus className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mx-auto mb-1`} />
                  <div>Adicionar</div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
