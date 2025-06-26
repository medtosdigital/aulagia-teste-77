
import React, { useState, useEffect } from 'react';
import { Calendar, CalendarIcon, Plus, ChevronLeft, ChevronRight, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addWeeks, addMonths, addYears, isSameDay, startOfDay, endOfDay, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { scheduleService, ScheduleEvent } from '@/services/scheduleService';
import { materialService } from '@/services/materialService';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import ScheduleModal from './ScheduleModal';
import MaterialModal from './MaterialModal';
import UpgradeModal from './UpgradeModal';
import { toast } from 'sonner';
import DayView from './calendar/DayView';
import WeekView from './calendar/WeekView';
import MonthView from './calendar/MonthView';
import YearView from './calendar/YearView';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [showFullWeek, setShowFullWeek] = useState(false);
  const [showWeekends, setShowWeekends] = useState(false);

  // Hooks para verificar permissões
  const { hasCalendar } = usePlanPermissions();
  const { 
    isOpen: isUpgradeModalOpen, 
    closeModal: closeUpgradeModal, 
    openModal: openUpgradeModal,
    handlePlanSelection,
    currentPlan,
    availablePlans 
  } = useUpgradeModal();

  // Verificar se tem acesso ao calendário
  const hasCalendarAccess = hasCalendar();

  useEffect(() => {
    if (hasCalendarAccess) {
      loadEvents();
    }
  }, [currentDate, view, hasCalendarAccess]);

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
    if (!hasCalendarAccess) {
      openUpgradeModal();
      return;
    }
    setSelectedDate(date);
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleEventClick = (event: ScheduleEvent) => {
    if (!hasCalendarAccess) {
      openUpgradeModal();
      return;
    }
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setModalOpen(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    if (!hasCalendarAccess) {
      openUpgradeModal();
      return;
    }
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setModalOpen(true);
  };

  const handleDeleteEvent = (event: ScheduleEvent) => {
    if (!hasCalendarAccess) {
      openUpgradeModal();
      return;
    }
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
    if (!hasCalendarAccess) {
      openUpgradeModal();
      return;
    }
    const material = materialService.getMaterials().find(m => m.id === event.materialId);
    if (material) {
      setSelectedMaterial(material);
      setMaterialModalOpen(true);
    } else {
      toast.error('Material não encontrado');
    }
  };

  const handleMonthClick = (month: Date, newView: 'month') => {
    if (!hasCalendarAccess) {
      openUpgradeModal();
      return;
    }
    setCurrentDate(month);
    setView(newView);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
      <div className="max-w-7xl mx-auto p-4 md:p-6 relative">
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
        <div className="space-y-6 relative">
          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              dayEvents={hasCalendarAccess ? getEventsForDate(currentDate) : []}
              onDateClick={handleDateClick}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onViewMaterial={handleViewMaterial}
            />
          )}
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={hasCalendarAccess ? events : []}
              showFullWeek={showFullWeek}
              showWeekends={showWeekends}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onViewMaterial={handleViewMaterial}
              onToggleFullWeek={() => setShowFullWeek(!showFullWeek)}
              onToggleWeekends={() => setShowWeekends(!showWeekends)}
              getEventsForDate={getEventsForDate}
            />
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={hasCalendarAccess ? events : []}
              showWeekends={showWeekends}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onViewMaterial={handleViewMaterial}
              onToggleWeekends={() => setShowWeekends(!showWeekends)}
              getEventsForDate={getEventsForDate}
            />
          )}
          {view === 'year' && (
            <YearView
              currentDate={currentDate}
              events={hasCalendarAccess ? events : []}
              onMonthClick={handleMonthClick}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onViewMaterial={handleViewMaterial}
            />
          )}

          {/* Overlay de bloqueio para plano gratuito - posicionado sobre o conteúdo do calendário */}
          {!hasCalendarAccess && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <Card className="max-w-md w-full mx-4 shadow-2xl border-0 bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <Lock className="w-8 h-8 text-gray-600" />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Calendário Premium</h2>
                    <p className="text-gray-600 leading-relaxed">
                      O calendário de materiais está disponível apenas em planos pagos. Faça upgrade para organizar e agendar seus materiais pedagógicos com eficiência.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={openUpgradeModal}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all w-full"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Fazer Upgrade Agora
                  </Button>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    Desbloqueie todos os recursos com um plano premium
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Modais - só funcionam se tiver acesso */}
      {hasCalendarAccess && (
        <>
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
        </>
      )}

      {/* Modal de upgrade global */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        onSelectPlan={handlePlanSelection}
        availablePlans={availablePlans}
        currentPlanName={currentPlan.name}
      />
    </div>
  );
};

export default CalendarPage;
