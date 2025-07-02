import React from 'react';
import { CalendarIcon, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, startOfWeek, endOfWeek, addDays, isToday, isSameMonth, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScheduleEvent } from '@/services/scheduleService';
import EventCard from './EventCard';
import BlockedFeature from '../BlockedFeature';

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
  hasCalendarAccess?: boolean;
  onUpgrade?: () => void;
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
  getEventsForDate,
  hasCalendarAccess = true,
  onUpgrade = () => {}
}) => {
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

  // Se não tem acesso ao calendário, mostrar versão bloqueada
  if (!hasCalendarAccess) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 opacity-60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-500 mb-2">Visão Semanal</h2>
              <p className="text-gray-400">
                {showFullWeek 
                  ? `${format(weekDays[0], "dd/MM", { locale: ptBR })} - ${format(weekDays[weekDays.length - 1], "dd/MM/yyyy", { locale: ptBR })}`
                  : `A partir de hoje - ${format(weekDays[weekDays.length - 1], "dd/MM/yyyy", { locale: ptBR })}`
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto opacity-50">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="text-xs sm:text-sm">{showFullWeek ? 'A partir de hoje' : 'Semana completa'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Settings className="w-4 h-4" />
                <span className="text-xs sm:text-sm">{showWeekends ? 'Ocultar fins de semana' : 'Mostrar fins de semana'}</span>
              </Button>
            </div>
          </div>
        </div>

        <BlockedFeature
          title="Recurso Premium"
          description="Calendário disponível apenas em planos pagos"
          onUpgrade={onUpgrade}
          className="min-h-[400px]"
        >
          <div className={`grid grid-cols-1 gap-4 ${weekDays.length <= 5 ? 'lg:grid-cols-5' : weekDays.length === 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-7'}`}>
            {weekDays.map(day => {
              const isCurrentDay = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              
              return (
                <div key={day.toString()} className="space-y-3">
                  <div className={`text-center p-4 rounded-xl transition-all ${
                    isCurrentDay 
                      ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600' 
                      : isCurrentMonth 
                        ? 'bg-gray-200 border-2 border-gray-300' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    <div className="text-xs font-medium uppercase tracking-wide">
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${
                      isCurrentDay ? 'text-gray-600' : isCurrentMonth ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className={`text-xs mt-2 px-2 py-1 rounded-full ${
                      isCurrentDay ? 'bg-gray-400/20 text-gray-600' : 'bg-gray-300 text-gray-500'
                    }`}>
                      0 materiais
                    </div>
                  </div>
                  
                  <div className="space-y-2 min-h-[300px]">
                    <button
                      disabled
                      className="w-full text-sm p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 cursor-not-allowed transition-all"
                    >
                      <Plus className="w-4 h-4 mx-auto mb-1" />
                      <div>Adicionar</div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </BlockedFeature>
      </div>
    );
  }

  // Versão normal para usuários com acesso
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Visão Semanal</h2>
            <p className="text-gray-600">
              {showFullWeek 
                ? `${format(weekDays[0], "dd/MM", { locale: ptBR })} - ${format(weekDays[weekDays.length - 1], "dd/MM/yyyy", { locale: ptBR })}`
                : `A partir de hoje - ${format(weekDays[weekDays.length - 1], "dd/MM/yyyy", { locale: ptBR })}`
              }
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFullWeek}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{showFullWeek ? 'A partir de hoje' : 'Semana completa'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleWeekends}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Settings className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{showWeekends ? 'Ocultar fins de semana' : 'Mostrar fins de semana'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-4 ${weekDays.length <= 5 ? 'lg:grid-cols-5' : weekDays.length === 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-7'}`}>
        {weekDays.map(day => {
          const dayEvents = getEventsForDate(day);
          const isCurrentDay = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div key={day.toString()} className="space-y-3">
              <div className={`text-center p-4 rounded-xl transition-all cursor-pointer hover:scale-105 ${
                isCurrentDay 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg' 
                  : isCurrentMonth 
                    ? 'bg-white border-2 border-gray-200 hover:border-blue-300' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                <div className="text-xs font-medium uppercase tracking-wide">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div className={`text-2xl font-bold mt-1 ${
                  isCurrentDay ? 'text-white' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {format(day, 'd')}
                </div>
                {dayEvents.length > 0 && (
                  <div className={`text-xs mt-2 px-2 py-1 rounded-full ${
                    isCurrentDay ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {dayEvents.length} material{dayEvents.length !== 1 ? 'is' : ''}
                  </div>
                )}
              </div>
              
              <div className="space-y-2 min-h-[300px]">
                {dayEvents
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      compact={true}
                      onEdit={onEditEvent}
                      onDelete={onDeleteEvent}
                      onViewMaterial={onViewMaterial}
                    />
                  ))}
                
                <button
                  onClick={() => onDateClick(day)}
                  className="w-full text-sm p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <Plus className="w-4 h-4 mx-auto mb-1" />
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
