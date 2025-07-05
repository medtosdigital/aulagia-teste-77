
import React, { useState, useEffect } from 'react';
import { CalendarIcon, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, startOfWeek, endOfWeek, addDays, isToday, isSameMonth, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '@/services/supabaseScheduleService';
import EventCard from './EventCard';
import BlockedFeature from '../BlockedFeature';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  showWeekends: boolean;
  showFullWeek?: boolean;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
  onViewMaterial: (event: CalendarEvent) => void;
  onToggleWeekends: () => void;
  onToggleFullWeek?: () => void;
  getEventsForDate: (date: Date) => CalendarEvent[];
  hasCalendarAccess?: boolean;
  onUpgrade?: () => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  showWeekends = false,
  showFullWeek = false,
  onDateClick,
  onEventClick,
  onEditEvent,
  onDeleteEvent,
  onViewMaterial,
  onToggleWeekends,
  onToggleFullWeek,
  getEventsForDate,
  hasCalendarAccess = true,
  onUpgrade = () => {}
}) => {
  // Detecta se é mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Estado para semana completa ou a partir de hoje
  const [internalShowFullWeek, setInternalShowFullWeek] = useState(!isMobile);
  const effectiveShowFullWeek = showFullWeek !== undefined ? showFullWeek : internalShowFullWeek;

  // Atualiza showFullWeek se o tamanho da tela mudar
  useEffect(() => {
    const handleResize = () => {
      if (showFullWeek === undefined) {
        setInternalShowFullWeek(window.innerWidth >= 640);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showFullWeek]);

  let weekDays: Date[];
  
  if (effectiveShowFullWeek) {
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

  // Estado para navegação mobile
  const [mobileIndex, setMobileIndex] = useState(0);
  const daysPerPage = 2;
  const totalPages = Math.ceil(weekDays.length / daysPerPage);

  // Dias a exibir no mobile
  const visibleDays = isMobile
    ? weekDays.slice(mobileIndex * daysPerPage, mobileIndex * daysPerPage + daysPerPage)
    : weekDays;

  const handleToggleFullWeek = () => {
    if (onToggleFullWeek) {
      onToggleFullWeek();
    } else {
      setInternalShowFullWeek(prev => !prev);
    }
  };

  // Se não tem acesso ao calendário, mostrar versão bloqueada
  if (!hasCalendarAccess) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 opacity-60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-500 mb-2">Visão Semanal</h2>
              <p className="text-gray-400">
                {effectiveShowFullWeek 
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
                <span className="text-xs sm:text-sm">{effectiveShowFullWeek ? 'A partir de hoje' : 'Semana completa'}</span>
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
              {effectiveShowFullWeek 
                ? `${format(weekDays[0], "dd/MM", { locale: ptBR })} - ${format(weekDays[weekDays.length - 1], "dd/MM/yyyy", { locale: ptBR })}`
                : `A partir de hoje - ${format(weekDays[weekDays.length - 1], "dd/MM/yyyy", { locale: ptBR })}`
              }
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFullWeek}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{effectiveShowFullWeek ? 'A partir de hoje' : 'Semana completa'}</span>
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

      <div className={
        isMobile
          ? 'grid grid-cols-2 gap-4 items-stretch'
          : `grid grid-cols-1 gap-4 ${weekDays.length <= 5 ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : weekDays.length === 6 ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7'}`
      } style={{overflowX: 'hidden', width: '100%'}}>
        {visibleDays.map(day => {
          const dayEvents = getEventsForDate(day);
          const isCurrentDay = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          return (
            <div key={day.toString()} className="space-y-3 overflow-x-hidden w-full">
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
                  isCurrentDay ? 'text-white' : isCurrentMonth ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className={`text-xs mt-2 px-2 py-1 rounded-full ${
                  isCurrentDay ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                  {dayEvents.length === 1
                    ? '1 material'
                    : `${dayEvents.length} materiais`}
                </div>
              </div>
              <div className="space-y-2 min-h-[120px] w-full">
                {dayEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    compact={true}
                    onEdit={onEditEvent}
                    onDelete={onDeleteEvent}
                    onViewMaterial={onViewMaterial}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Navegação mobile */}
      {isMobile && (
        <div className="flex justify-between items-center mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileIndex(i => Math.max(0, i - 1))}
            disabled={mobileIndex === 0}
          >
            &#8592; Anterior
          </Button>
          <span className="text-xs text-gray-500">{mobileIndex + 1} / {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileIndex(i => Math.min(totalPages - 1, i + 1))}
            disabled={mobileIndex >= totalPages - 1}
          >
            Próximo &#8594;
          </Button>
        </div>
      )}
    </div>
  );
};

export default WeekView;
