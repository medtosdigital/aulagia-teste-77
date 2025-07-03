import React from 'react';
import { CalendarIcon, Plus, Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '@/services/supabaseScheduleService';
import EventCard from './EventCard';
import BlockedFeature from '../BlockedFeature';

interface DayViewProps {
  currentDate: Date;
  dayEvents: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
  onViewMaterial: (event: CalendarEvent) => void;
  hasCalendarAccess?: boolean;
  onUpgrade?: () => void;
}

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  dayEvents,
  onDateClick,
  onEditEvent,
  onDeleteEvent,
  onViewMaterial,
  hasCalendarAccess = true,
  onUpgrade = () => {}
}) => {
  // Se não tem acesso ao calendário, mostrar versão bloqueada
  if (!hasCalendarAccess) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 opacity-60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-500">
                {format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
              </h2>
              <p className="text-gray-400">
                {format(currentDate, "EEEE", { locale: ptBR })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-400">0</div>
              <div className="text-sm text-gray-400">
                materiais agendados
              </div>
            </div>
          </div>
        </div>

        <BlockedFeature
          title="Recurso Premium"
          description="Calendário disponível apenas em planos pagos"
          onUpgrade={onUpgrade}
          className="min-h-[300px]"
        >
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-3">Nenhum material agendado</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Que tal agendar um material pedagógico para hoje? Organize suas aulas de forma eficiente.
              </p>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Agendar Material
              </Button>
            </CardContent>
          </Card>
        </BlockedFeature>
      </div>
    );
  }

  // Versão normal para usuários com acesso
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
            </h2>
            <p className="text-gray-600">
              {format(currentDate, "EEEE", { locale: ptBR })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{dayEvents.length}</div>
            <div className="text-sm text-gray-600">
              {dayEvents.length === 1 ? 'material agendado' : 'materiais agendados'}
            </div>
          </div>
        </div>
      </div>

      {dayEvents.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300 hover:border-blue-300 transition-colors">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-3">Nenhum material agendado</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Que tal agendar um material pedagógico para hoje? Organize suas aulas de forma eficiente.
            </p>
            <Button 
              onClick={() => onDateClick(currentDate)} 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agendar Material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Materiais do dia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dayEvents
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map(event => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  compact={false}
                  onEdit={onEditEvent}
                  onDelete={onDeleteEvent}
                  onViewMaterial={onViewMaterial}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DayView;
