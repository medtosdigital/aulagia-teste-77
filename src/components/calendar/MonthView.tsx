import React from 'react';
import { Plus, Settings, Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScheduleEvent } from '@/services/scheduleService';
import EventCard from './EventCard';
import BlockedFeature from '../BlockedFeature';

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
  hasCalendarAccess?: boolean;
  onUpgrade?: () => void;
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
  getEventsForDate,
  hasCalendarAccess = true,
  onUpgrade = () => {}
}) => {
  // Se não tem acesso ao calendário, mostrar versão bloqueada
  if (!hasCalendarAccess) {
    const weekDays = showWeekends 
      ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 opacity-60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-500 mb-2">
                {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </h2>
              <p className="text-gray-400">
                Calendário mensal disponível apenas em planos pagos
              </p>
            </div>
          </div>
        </div>

        <BlockedFeature
          title="Recurso Premium"
          description="Visualização mensal do calendário disponível apenas em planos pagos"
          onUpgrade={onUpgrade}
          className="min-h-[500px]"
        >
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className={`grid gap-0 border-b border-gray-200 ${showWeekends ? 'grid-cols-7' : 'grid-cols-5'}`}>
              {weekDays.map(dayName => (
                <div key={dayName} className="p-4 text-center font-bold text-gray-400 bg-gray-50 border-r border-gray-200 last:border-r-0">
                  {dayName}
                </div>
              ))}
            </div>
            <div className="space-y-0">
              {Array.from({ length: 5 }, (_, weekIndex) => (
                <div key={weekIndex} className={`grid gap-0 ${showWeekends ? 'grid-cols-7' : 'grid-cols-5'}`}>
                  {Array.from({ length: showWeekends ? 7 : 5 }, (_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="min-h-[120px] border border-gray-200 p-3 bg-gray-100"
                    >
                      <div className="text-sm font-bold mb-2 text-gray-400">
                        {weekIndex * (showWeekends ? 7 : 5) + dayIndex + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </BlockedFeature>
      </div>
    );
  }

  // ... keep existing code (versão normal para usuários com acesso)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const rows = [];
  let days = [];
  let day = startDate;

  const weekDays = showWeekends 
    ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

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
          className={`min-h-[120px] border border-gray-200 p-3 cursor-pointer hover:bg-blue-50 transition-all duration-200 ${
            !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:shadow-md'
          } ${isCurrentDay ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : ''}`}
          onClick={() => onDateClick(currentDay)}
        >
          <div className={`text-sm font-bold mb-2 ${
            isCurrentDay 
              ? 'text-blue-600' 
              : isCurrentMonth 
                ? 'text-gray-900' 
                : 'text-gray-400'
          }`}>
            {format(day, 'd')}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 1).map(event => (
              <EventCard
                key={event.id}
                event={event}
                compact={true}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                onViewMaterial={onViewMaterial}
              />
            ))}
            {dayEvents.length > 1 && (
              <div className="text-xs text-blue-600 font-medium bg-blue-100 p-1 rounded text-center">
                +{dayEvents.length - 1} mais
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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <p className="text-gray-600">
              {events.length} material{events.length !== 1 ? 'is' : ''} agendado{events.length !== 1 ? 's' : ''} este mês
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleWeekends}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs sm:text-sm">{showWeekends ? 'Esconder fins de semana' : 'Mostrar fins de semana'}</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className={`grid gap-0 border-b border-gray-200 ${showWeekends ? 'grid-cols-7' : 'grid-cols-5'}`}>
          {weekDays.map(dayName => (
            <div key={dayName} className="p-4 text-center font-bold text-gray-700 bg-gray-50 border-r border-gray-200 last:border-r-0">
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
