import React, { useState, useEffect } from 'react';
import { Calendar, CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, BookOpen, Edit3, Trash2, GraduationCap, FileText, Eye, Download, Printer, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, MaterialCardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addWeeks, addMonths, addYears, isSameMonth, isSameDay, isToday, startOfDay, endOfDay, startOfYear, endOfYear, getWeek, getDaysInMonth, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { scheduleService, ScheduleEvent } from '@/services/scheduleService';
import { materialService } from '@/services/materialService';
import { exportService } from '@/services/exportService';
import ScheduleModal from './ScheduleModal';
import MaterialModal from './MaterialModal';
import { toast } from 'sonner';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [showFullWeek, setShowFullWeek] = useState(false);
  const [showWeekends, setShowWeekends] = useState(false);

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
        if (showFullWeek) {
          startDate = startOfWeek(currentDate, { locale: ptBR });
          endDate = endOfWeek(currentDate, { locale: ptBR });
        } else {
          const today = new Date();
          startDate = startOfDay(today);
          endDate = endOfWeek(today, { locale: ptBR });
        }
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

  const handleEditEvent = (event: ScheduleEvent) => {
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

  const handleViewMaterial = (event: ScheduleEvent) => {
    const material = materialService.getMaterials().find(m => m.id === event.materialId);
    if (material) {
      setSelectedMaterial(material);
      setMaterialModalOpen(true);
    } else {
      toast.error('Material não encontrado');
    }
  };

  const handleExportMaterial = async (event: ScheduleEvent, format: 'print' | 'pdf' | 'word' | 'ppt') => {
    const material = materialService.getMaterials().find(m => m.id === event.materialId);
    if (!material) {
      toast.error('Material não encontrado');
      return;
    }

    try {
      switch (format) {
        case 'print':
          await exportService.exportToPDF(material);
          toast.success('Material enviado para impressão!');
          break;
        case 'pdf':
          await exportService.exportToPDF(material);
          toast.success('PDF baixado com sucesso!');
          break;
        case 'word':
          if (material.type === 'slides') {
            toast.error('Exportação Word não disponível para slides. Use PPT.');
            return;
          }
          await exportService.exportToWord(material);
          toast.success('Word baixado com sucesso!');
          break;
        case 'ppt':
          if (material.type !== 'slides') {
            toast.error('Exportação PPT disponível apenas para slides. Use Word.');
            return;
          }
          await exportService.exportToPPT(material);
          toast.success('PowerPoint baixado com sucesso!');
          break;
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast.error('Erro na exportação');
    }
  };

  const getDateRangeText = () => {
    switch (view) {
      case 'day':
        return format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        if (showFullWeek) {
          const weekStart = startOfWeek(currentDate, { locale: ptBR });
          const weekEnd = endOfWeek(currentDate, { locale: ptBR });
          return `${format(weekStart, "dd/MM", { locale: ptBR })} - ${format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}`;
        } else {
          const today = new Date();
          const weekEnd = endOfWeek(today, { locale: ptBR });
          return `A partir de hoje - ${format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}`;
        }
      case 'month':
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'year':
        return format(currentDate, "yyyy", { locale: ptBR });
    }
  };

  const getMaterialTypeFromEvent = (event: ScheduleEvent): 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao' => {
    const material = materialService.getMaterials().find(m => m.id === event.materialId);
    return (material?.type as 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao') || 'atividade';
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Matemática': 'bg-blue-100 text-blue-800 border-blue-200',
      'Português': 'bg-green-100 text-green-800 border-green-200',
      'História': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Geografia': 'bg-purple-100 text-purple-800 border-purple-200',
      'Ciências': 'bg-pink-100 text-pink-800 border-pink-200',
      'Inglês': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Educação Física': 'bg-red-100 text-red-800 border-red-200',
      'Arte': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const EventCard = ({ event, showDate = false, compact = false }: { event: ScheduleEvent; showDate?: boolean; compact?: boolean }) => (
    <Card className={`group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden ${compact ? 'text-xs' : ''}`}>
      <MaterialCardHeader materialType={getMaterialTypeFromEvent(event)} subject={event.subject} />
      <CardContent className={`${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className={`font-bold text-gray-900 truncate ${compact ? 'text-sm' : 'text-base'}`}>
                {event.title}
              </h3>
            </div>
            
            {/* Turma logo abaixo do título com menos espaçamento */}
            <div className="mb-3">
              <p className={`text-gray-600 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                {event.grade}
              </p>
            </div>
            
            <div className={`space-y-3 ${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>
              {showDate && (
                <>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3 text-blue-500" />
                    <span className="font-medium">
                      {format(event.startDate, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <Separator className="my-2" />
                </>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-green-500" />
                <span className="font-medium">{event.startTime} - {event.endTime}</span>
              </div>
              {event.classroom && (
                <>
                  <Separator className="my-2" />
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-purple-500" />
                    <span className="truncate">{event.classroom}</span>
                  </div>
                </>
              )}
            </div>
            
            {event.description && !compact && (
              <>
                <Separator className="my-3" />
                <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded-md italic">
                  "{event.description}"
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Botões de ação reorganizados */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewMaterial(event);
            }}
            className="flex items-center gap-2 text-xs px-3 py-2 h-8"
          >
            <Eye className="w-4 h-4" />
            Visualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditEvent(event);
            }}
            className="p-2 h-8 w-8"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                const menu = e.currentTarget.nextElementSibling as HTMLElement;
                if (menu) {
                  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }
              }}
              className="p-2 h-8 w-8"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            {/* Submenu de exportação */}
            <div 
              style={{ display: 'none' }}
              className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportMaterial(event, 'print');
                  (e.target as HTMLElement).closest('div')!.style.display = 'none';
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-t-lg"
              >
                <Printer className="w-3 h-3" />
                Imprimir
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportMaterial(event, 'pdf');
                  (e.target as HTMLElement).closest('div')!.style.display = 'none';
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-3 h-3" />
                PDF
              </button>
              {getMaterialTypeFromEvent(event) === 'slides' ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportMaterial(event, 'ppt');
                    (e.target as HTMLElement).closest('div')!.style.display = 'none';
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-b-lg"
                >
                  <FileText className="w-3 h-3" />
                  PPT
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportMaterial(event, 'word');
                    (e.target as HTMLElement).closest('div')!.style.display = 'none';
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-b-lg"
                >
                  <FileText className="w-3 h-3" />
                  Word
                </button>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEvent(event);
            }}
            className="p-2 h-8 w-8"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);

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
                onClick={() => handleDateClick(currentDate)} 
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dayEvents
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    let weekDays: Date[];
    
    if (showFullWeek) {
      // Semana completa tradicional (domingo a sábado)
      const weekStart = startOfWeek(currentDate, { locale: ptBR });
      weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    } else {
      // Semana a partir de hoje
      const today = new Date();
      const endOfCurrentWeek = endOfWeek(today, { locale: ptBR });
      const daysUntilEndOfWeek = Math.ceil((endOfCurrentWeek.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      weekDays = Array.from({ length: daysUntilEndOfWeek }, (_, i) => addDays(today, i));
    }

    // Filtrar fins de semana se necessário
    if (!showWeekends) {
      weekDays = weekDays.filter(day => !isWeekend(day));
    }

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Visão Semanal</h2>
              <p className="text-gray-600">
                {showFullWeek 
                  ? `${format(weekDays[0], "dd/MM", { locale: ptBR })} - ${format(weekDays[weekDays.length - 1], "dd/MM/yyyy", { locale: ptBR })}`
                  : `A partir de hoje - ${format(weekDays[weekDays.length - 1], "dd/MM/yyyy", { locale: ptBR })}`
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullWeek(!showFullWeek)}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {showFullWeek ? 'A partir de hoje' : 'Semana completa'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWeekends(!showWeekends)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {showWeekends ? 'Ocultar fins de semana' : 'Mostrar fins de semana'}
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
                      <Card
                        key={event.id}
                        className="cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group overflow-hidden"
                        onClick={() => handleEventClick(event)}
                      >
                        <MaterialCardHeader materialType={getMaterialTypeFromEvent(event)} subject={event.subject} />
                        <CardContent className="p-3">
                          <div className="font-medium text-gray-900 text-sm truncate mb-1">{event.title}</div>
                          <div className="text-xs text-gray-600 font-medium">{event.startTime}</div>
                        </CardContent>
                      </Card>
                    ))}
                  
                  <button
                    onClick={() => handleDateClick(day)}
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
            className={`min-h-[120px] border border-gray-200 p-3 cursor-pointer hover:bg-blue-50 transition-all duration-200 ${
              !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:shadow-md'
            } ${isCurrentDay ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : ''}`}
            onClick={() => handleDateClick(currentDay)}
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
                    handleEventClick(event);
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

  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

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
                onClick={() => {
                  setCurrentDate(month);
                  setView('month');
                }}
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
                      {monthEvents.slice(0, 3).map(event => (
                        <Card key={event.id} className="overflow-hidden">
                          <MaterialCardHeader materialType={getMaterialTypeFromEvent(event)} subject={event.subject} />
                          <CardContent className="p-2">
                            <div className="text-xs font-medium truncate">{event.title}</div>
                          </CardContent>
                        </Card>
                      ))}
                      {monthEvents.length > 3 && (
                        <div className="text-xs text-blue-600 font-medium text-center bg-blue-100 p-2 rounded-md">
                          +{monthEvents.length - 3} mais materiais
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                Calendário de Materiais
              </h1>
              <p className="text-gray-600 text-lg">Organize e acompanhe seus agendamentos pedagógicos com elegância</p>
            </div>
            <Button 
              onClick={() => handleDateClick(new Date())} 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Agendamento
            </Button>
          </div>

          {/* Navigation Controls */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center justify-center md:justify-start space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigateDate('prev')}
                    className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-bold min-w-[250px] text-center text-gray-900">
                    {getDateRangeText()}
                  </h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigateDate('next')}
                    className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <Tabs value={view} onValueChange={(value: any) => setView(value)} className="w-full md:w-auto">
                  <TabsList className="grid w-full grid-cols-4 md:w-auto bg-gray-100 p-1 rounded-xl">
                    <TabsTrigger value="day" className="text-xs md:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Dia
                    </TabsTrigger>
                    <TabsTrigger value="week" className="text-xs md:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Semana
                    </TabsTrigger>
                    <TabsTrigger value="month" className="text-xs md:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Mês
                    </TabsTrigger>
                    <TabsTrigger value="year" className="text-xs md:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Ano
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Content */}
        <div className="space-y-6">
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

      <MaterialModal
        material={selectedMaterial}
        open={materialModalOpen}
        onClose={() => {
          setMaterialModalOpen(false);
          setSelectedMaterial(null);
        }}
        showNextSteps={false}
      />
    </div>
  );
};

export default CalendarPage;
