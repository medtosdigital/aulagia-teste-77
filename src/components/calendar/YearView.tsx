import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '@/services/supabaseScheduleService';
import EventCard from './EventCard';
import BlockedFeature from '../BlockedFeature';

interface YearViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onMonthClick: (month: Date, view: 'month') => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
  onViewMaterial: (event: CalendarEvent) => void;
  hasCalendarAccess?: boolean;
  onUpgrade?: () => void;
}

const YearView: React.FC<YearViewProps> = ({
  currentDate,
  events,
  onMonthClick,
  onEditEvent,
  onDeleteEvent,
  onViewMaterial,
  hasCalendarAccess = true,
  onUpgrade = () => {}
}) => {
  const year = currentDate.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  // Se não tem acesso ao calendário, mostrar versão bloqueada
  if (!hasCalendarAccess) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 opacity-60">
          <h2 className="text-2xl font-bold text-gray-500 mb-2">{year}</h2>
          <p className="text-gray-400">
            0 materiais agendados este ano
          </p>
        </div>

        <BlockedFeature
          title="Recurso Premium"
          description="Calendário disponível apenas em planos pagos"
          onUpgrade={onUpgrade}
          className="min-h-[600px]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" style={{overflowX: 'hidden', width: '100%'}}>
            {months.map(month => (
              <Card 
                key={month.toString()} 
                className="cursor-not-allowed border-2 border-gray-300 overflow-hidden opacity-60"
              >
                <CardHeader className="pb-3 bg-gray-100">
                  <CardTitle className="text-lg text-center font-bold text-gray-500">
                    {format(month, 'MMMM', { locale: ptBR })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-gray-400 mb-1">
                      0
                    </div>
                    <div className="text-sm text-gray-400">
                      materiais
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </BlockedFeature>
      </div>
    );
  }

  // Versão normal para usuários com acesso
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{year}</h2>
        <p className="text-gray-600">
          {events.length} material{events.length !== 1 ? 'is' : ''} agendado{events.length !== 1 ? 's' : ''} este ano
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" style={{overflowX: 'hidden', width: '100%'}}>
        {months.map(month => {
          const monthEvents = events.filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate.getFullYear() === year && eventDate.getMonth() === month.getMonth();
          });

          return (
            <Card 
              key={month.toString()} 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-blue-300 overflow-hidden w-full truncate"
              onClick={() => onMonthClick(month, 'month')}
            >
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-lg text-center font-bold text-gray-900">
                  {format(month, 'MMMM', { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {monthEvents.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {monthEvents.length === 1 ? 'material' : 'materiais'}
                  </div>
                </div>
                
                {monthEvents.length > 0 && (
                  <div className="space-y-2">
                    {monthEvents.slice(0, 2).map(event => (
                      <div className="truncate">
                        <EventCard
                          key={event.id}
                          event={event}
                          compact={true}
                          showDate={false}
                          onEdit={onEditEvent}
                          onDelete={onDeleteEvent}
                          onViewMaterial={onViewMaterial}
                        />
                      </div>
                    ))}
                    {monthEvents.length > 2 && (
                      <div className="text-xs text-blue-600 font-medium text-center bg-blue-100 p-2 rounded-md">
                        +{monthEvents.length - 2} mais materiais
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default YearView;
