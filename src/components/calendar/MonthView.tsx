
import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, MaterialCardHeader } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScheduleEvent } from '@/services/scheduleService';
import { materialService } from '@/services/materialService';

interface MonthViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: ScheduleEvent) => void;
  getEventsForDate: (date: Date) => ScheduleEvent[];
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  onDateClick,
  onEventClick,
  getEventsForDate
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const rows = [];
  let days = [];
  let day = startDate;

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getMaterialTypeFromEvent = (event: ScheduleEvent): 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao' => {
    const material = materialService.getMaterials().find(m => m.id === event.materialId);
    return (material?.type as 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao') || 'atividade';
  };

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
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
            {dayEvents.slice(0, 2).map(event => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-sm transition-all overflow-hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
              >
                <MaterialCardHeader materialType={getMaterialTypeFromEvent(event)} subject={event.subject} />
                <CardContent className="p-2">
                  <div className="text-xs font-medium truncate">{event.startTime} {event.title}</div>
                </CardContent>
              </Card>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-blue-600 font-medium bg-blue-100 p-1 rounded text-center">
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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
        <p className="text-gray-600">
          {events.length} material{events.length !== 1 ? 'is' : ''} agendado{events.length !== 1 ? 's' : ''} este mês
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
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
