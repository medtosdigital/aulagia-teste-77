
import React, { useState, useEffect } from 'react';
import { Calendar, CalendarIcon, Plus, ChevronLeft, ChevronRight, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addWeeks, addMonths, addYears, isSameDay, startOfDay, endOfDay, startOfYear, endOfYear, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { materialService } from '@/services/materialService';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import ScheduleModal from './ScheduleModal';
import MaterialModal from './MaterialModal';
import { UpgradeModal } from './UpgradeModal';
import { toast } from 'sonner';
import DayView from './calendar/DayView';
import WeekView from './calendar/WeekView';
import MonthView from './calendar/MonthView';
import YearView from './calendar/YearView';
import { useSupabaseSchedule } from '@/hooks/useSupabaseSchedule';
import { CalendarEvent } from '@/services/supabaseScheduleService';
import { activityService } from '@/services/activityService';
import LessonModal from './LessonModal';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [showFullWeek, setShowFullWeek] = useState(false);
  const [showWeekends, setShowWeekends] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);

  // Hook para verificar se o usuário está logado
  const { user } = useAuth();
  
  // Hooks para verificar funcionalidades específicas do plano
  const { hasCalendar } = usePlanPermissions();
  const { 
    isOpen: isUpgradeModalOpen, 
    closeModal: closeUpgradeModal, 
    openModal: openUpgradeModal,
    handlePlanSelection,
    currentPlan,
    availablePlans 
  } = useUpgradeModal();

  // Verificar se tem funcionalidades específicas do calendário
  const hasCalendarFeatures = hasCalendar();

  const { events, loading, refreshEvents, deleteEvent: deleteSupabaseEvent } = useSupabaseSchedule();

  useEffect(() => {
    if (user && hasCalendarFeatures) {
      console.log('Carregando eventos do calendário...');
      const result = refreshEvents && typeof refreshEvents === 'function' ? refreshEvents() : null;
      if (result && typeof result.then === 'function') {
        result.catch(error => {
          console.error('Error loading calendar events:', error);
          toast.error('Erro ao carregar eventos do calendário');
        });
      }
    }
  }, [currentDate, view, user, hasCalendarFeatures, refreshEvents]);

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

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      if (!event.start_date) return false;
      return isSameDay(parseISO(event.start_date), date);
    });
  };

  const handleDateClick = (date: Date) => {
    if (!hasCalendarFeatures) {
      openUpgradeModal();
      return;
    }
    setSelectedDate(date);
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setModalOpen(true);
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (window.confirm(`Tem certeza que deseja excluir "${event.title}"?`)) {
      const success = await deleteSupabaseEvent(event.id);
      if (success) {
        toast.success('Agendamento excluído com sucesso!');
        let materialType: 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao' | 'apoio' | undefined = undefined;
        let subject = '';
        let grade = '';
        if (event.material_ids && event.material_ids.length > 0) {
          const material = await materialService.getMaterialById(event.material_ids[0]);
          materialType = material?.type;
          subject = material?.subject || '';
          grade = material?.grade || '';
        }
        activityService.addActivity({
          type: 'updated',
          title: event.title,
          description: `Agendamento excluído: ${event.title} para ${event.start_date} das ${event.start_time} às ${event.end_time}`,
          materialType: materialType,
          materialId: event.material_ids && event.material_ids.length > 0 ? event.material_ids[0] : undefined,
          subject,
          grade
        });
        refreshEvents();
      } else {
        toast.error('Erro ao excluir agendamento');
      }
    }
  };

  const handleViewLesson = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setLessonModalOpen(true);
  };

  const handleMonthClick = (month: Date, newView: 'month') => {
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
              disabled={!hasCalendarFeatures}
            >
              <Plus className="w-5 h-5 mr-2" />
              {hasCalendarFeatures ? 'Novo Agendamento' : 'Recurso Premium'}
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
              dayEvents={user && hasCalendarFeatures ? getEventsForDate(currentDate) : []}
              onDateClick={handleDateClick}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onViewMaterial={handleViewLesson}
              hasCalendarAccess={hasCalendarFeatures}
              onUpgrade={openUpgradeModal}
            />
          )}
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={user && hasCalendarFeatures ? events : []}
              showFullWeek={showFullWeek}
              showWeekends={showWeekends}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onViewMaterial={handleViewLesson}
              onToggleFullWeek={() => setShowFullWeek(!showFullWeek)}
              onToggleWeekends={() => setShowWeekends(!showWeekends)}
              getEventsForDate={getEventsForDate}
              hasCalendarAccess={hasCalendarFeatures}
              onUpgrade={openUpgradeModal}
            />
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={user && hasCalendarFeatures ? events : []}
              showWeekends={showWeekends}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onViewMaterial={handleViewLesson}
              onToggleWeekends={() => setShowWeekends(!showWeekends)}
              getEventsForDate={getEventsForDate}
              hasCalendarAccess={hasCalendarFeatures}
              onUpgrade={openUpgradeModal}
            />
          )}
          {view === 'year' && (
            <YearView
              currentDate={currentDate}
              events={user && hasCalendarFeatures ? events : []}
              onMonthClick={handleMonthClick}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onViewMaterial={handleViewLesson}
              hasCalendarAccess={hasCalendarFeatures}
              onUpgrade={openUpgradeModal}
            />
          )}
        </div>
      </div>

      {/* Modais */}
      {hasCalendarFeatures && (
        <ScheduleModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedEvent(null);
            setSelectedDate(undefined);
          }}
          onSave={refreshEvents}
          event={selectedEvent ? {
            id: selectedEvent.id,
            user_id: selectedEvent.user_id,
            material_ids: selectedEvent.material_ids || [],
            title: selectedEvent.title,
            event_type: selectedEvent.event_type,
            schedule_type: selectedEvent.schedule_type,
            start_date: selectedEvent.start_date,
            end_date: selectedEvent.end_date,
            start_time: selectedEvent.start_time,
            end_time: selectedEvent.end_time,
            recurrence: selectedEvent.recurrence,
            description: selectedEvent.description,
            classroom: selectedEvent.classroom,
            created_at: selectedEvent.created_at,
            updated_at: selectedEvent.updated_at
          } : undefined}
          selectedDate={selectedDate}
          startDate={selectedEvent && selectedEvent.start_date ? parseISO(selectedEvent.start_date) : undefined}
          endDate={selectedEvent && selectedEvent.end_date ? parseISO(selectedEvent.end_date) : undefined}
        />
      )}

      <MaterialModal
        material={selectedMaterial}
        open={materialModalOpen}
        onClose={() => {
          setMaterialModalOpen(false);
          setSelectedMaterial(null);
        }}
        showNextSteps={false}
      />

      <LessonModal
        open={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        onRefresh={refreshEvents}
      />

      {/* Modal de upgrade global */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        onPlanSelect={handlePlanSelection}
        currentPlan={currentPlan}
      />
    </div>
  );
};

export default CalendarPage;
