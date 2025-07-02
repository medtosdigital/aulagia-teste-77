import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScheduleEvent } from '@/services/scheduleService';
import EventCard from './EventCard';
import CalendarBlockedOverlay from './CalendarBlockedOverlay';

interface YearViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  onMonthClick: (month: Date, view: 'month') => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (event: ScheduleEvent) => void;
  onViewMaterial: (event: ScheduleEvent) => void;
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

  if (!hasCalendarAccess) {
    return (
      <CalendarBlockedOverlay onUpgrade={onUpgrade}>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{year}</h2>
            <p className="text-gray-600">Exemplo de calendário anual</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {months.map(month => (
              <Card 
                key={month.toString()} 
                className="border-2 border-gray-200 overflow-hidden opacity-50"
              >
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-lg text-center font-bold text-gray-500">
                    {format(month, 'MMMM', { locale: ptBR })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-gray-400 mb-1">
                      {Math.floor(Math.random() * 5)}
                    </div>
                    <div className="text-sm text-gray-400">materiais</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Card className="p-2 bg-blue-50 border-blue-200">
                      <div className="text-xs text-blue-600">Material exemplo</div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CalendarBlockedOverlay>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{year}</h2>
        <p className="text-gray-600">
          {events.length} material{events.length !== 1 ? 'is' : ''} agendado{events.length !== 1 ? 's' : ''} este ano
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map(month => {
          const monthEvents = events.filter(event => 
            event.startDate.getFullYear() === year && 
            event.startDate.getMonth() === month.getMonth()
          );

          return (
            <Card 
              key={month.toString()} 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-blue-300 overflow-hidden"
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
                      <EventCard
                        key={event.id}
                        event={event}
                        compact={true}
                        showDate={false}
                        onEdit={onEditEvent}
                        onDelete={onDeleteEvent}
                        onViewMaterial={onViewMaterial}
                      />
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
