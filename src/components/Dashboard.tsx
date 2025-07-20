import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Crown, BookOpen, ClipboardList, FileText, CheckCircle, Download, Users, Presentation, School } from 'lucide-react';
import { statsService, MaterialStats } from '@/services/statsService';
import { scheduleService, ScheduleEvent } from '@/services/scheduleService';
import { activityService, Activity } from '@/services/activityService';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabaseScheduleService } from '@/services/supabaseScheduleService';
import { CalendarEvent } from '@/services/supabaseScheduleService';
import { parseISO } from 'date-fns';
import { materialService, GeneratedMaterial } from '@/services/materialService';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('recent-activities');
  const [materialStats, setMaterialStats] = useState<MaterialStats | null>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<CalendarEvent[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [materialsMap, setMaterialsMap] = useState<{ [id: string]: GeneratedMaterial }>({});

  const {
    canAccessCreateMaterial,
    canAccessMaterials,
    hasCalendar,
    canAccessCalendarPage,
    canAccessSchool
  } = usePlanPermissions();

  const navigate = useNavigate();

  useEffect(() => {
    console.log('🏠 Dashboard mounted');

    // Carregar estatísticas, atividades e próximas aulas em paralelo
    const loadDashboardData = async () => {
      try {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        
        // Carregar dados em paralelo com timeout para evitar travamentos
        const loadPromise = Promise.all([
          statsService.getMaterialStats(),
          activityService.getRecentActivities(10),
          supabaseScheduleService.getEventsByDateRange(now, nextWeek)
        ]);

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 15000)
        );

        const [stats, activities, upcoming] = await Promise.race([loadPromise, timeoutPromise]) as [any, any, any];
        
        setMaterialStats(stats);
        setRecentActivities(activities);
        setUpcomingClasses(upcoming.slice(0, 5));
        
        // Buscar materiais vinculados das próximas aulas apenas se necessário
        const allMaterialIds = Array.from(new Set(upcoming.flatMap(ev => ev.material_ids || [])));
        if (allMaterialIds.length > 0) {
          // Buscar apenas os materiais específicos em vez de todos
          const materialsMap: { [id: string]: GeneratedMaterial } = {};
          
          // Buscar materiais específicos por ID
          for (const materialId of allMaterialIds.slice(0, 10)) { // Limitar a 10 para performance
            try {
              const material = await materialService.getMaterialById(materialId);
              if (material) {
                materialsMap[materialId as string] = material;
              }
            } catch (error) {
              console.warn(`Erro ao buscar material ${materialId}:`, error);
            }
          }
          
          setMaterialsMap(materialsMap);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        // Fallback para dados básicos
        setMaterialStats({
          totalMaterials: 0,
          planoAula: 0,
          slides: 0,
          atividades: 0,
          avaliacoes: 0,
          weeklyGrowth: {
            planoAula: 0,
            slides: 0,
            atividades: 0,
            avaliacoes: 0
          }
        });
        setRecentActivities([]);
        setUpcomingClasses([]);
      }
    };
    loadDashboardData();
  }, []);

  const tabs = [{
    id: 'upcoming-classes',
    label: 'Próximas Aulas',
    shortLabel: 'Aulas'
  }];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'created':
        return <Plus size={16} />;
      case 'exported':
        return <Download size={16} />;
      case 'updated':
        return <CheckCircle size={16} />;
      case 'scheduled':
        return <Calendar size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getActivityIconColor = (type: Activity['type']) => {
    switch (type) {
      case 'created':
        return 'bg-green-100 text-green-600';
      case 'exported':
        return 'bg-blue-100 text-blue-600';
      case 'updated':
        return 'bg-purple-100 text-purple-600';
      case 'scheduled':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} min atrás`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
    }
  };

  return (
    <main className="p-4 h-full overflow-y-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Bem-vindo de volta, Professor!</h1>
            <p className="opacity-90">Sua próxima aula começa aqui. Vamos começar?</p>
          </div>
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white bg-opacity-30 rounded-full animate-pulse delay-100"></div>
            <div className="absolute inset-4 flex items-center justify-center bg-white bg-opacity-10 rounded-full">
              <BookOpen className="w-8 h-8 text-white animate-floating" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {canAccessCreateMaterial() && (
          <div 
            className="bg-white rounded-xl shadow-sm p-5 flex items-center space-x-4 card-hover cursor-pointer" 
            onClick={() => navigate('/criar')}
          >
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
              <Plus size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Preparar Material</h3>
              <p className="text-sm text-gray-500">Comece a planejar</p>
            </div>
          </div>
        )}
        
        {canAccessMaterials() && (
          <div 
            className="bg-white rounded-xl shadow-sm p-5 flex items-center space-x-4 card-hover cursor-pointer" 
            onClick={() => navigate('/materiais')}
          >
            <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center text-secondary-600">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Meus Materiais</h3>
              <p className="text-sm text-gray-500">Veja seus conteúdos</p>
            </div>
          </div>
        )}
        
        {canAccessCalendarPage() && (
          <div 
            className="bg-white rounded-xl shadow-sm p-5 flex items-center space-x-4 card-hover cursor-pointer" 
            onClick={() => navigate('/agenda')}
          >
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Calendário</h3>
              <p className="text-sm text-gray-500">Veja sua agenda</p>
            </div>
          </div>
        )}

        {canAccessSchool() && (
          <div 
            className="bg-white rounded-xl shadow-sm p-5 flex items-center space-x-4 card-hover cursor-pointer" 
            onClick={() => navigate('/escola')}
          >
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <School size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Grupo Escolar</h3>
              <p className="text-sm text-gray-500">Adicionar professores</p>
            </div>
          </div>
        )}
        
        <div 
          className="bg-white rounded-xl shadow-sm p-5 flex items-center space-x-4 card-hover cursor-pointer" 
          onClick={() => navigate('/assinatura')}
        >
          <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
            <Crown size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Assinatura</h3>
            <p className="text-sm text-gray-500">Atualize seu plano</p>
          </div>
        </div>
      </div>

      {/* Próximas aulas + Estatísticas rápidas */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-4 md:p-6">
          <h3 className="font-semibold text-lg mb-4">Suas próximas aulas</h3>
          <div className="space-y-4">
            {upcomingClasses.length > 0 ? (() => {
              // Encontrar o evento mais próximo da data/hora atual
              const now = new Date();
              const getEventDateTime = (ev: CalendarEvent) => {
                // Junta data e hora para comparar corretamente
                return new Date(`${ev.start_date}T${ev.start_time}`);
              };
              // FILTRO: remove eventos do dia atual cujo horário já passou
              const filtered = upcomingClasses.filter(ev => {
                const eventDateTime = getEventDateTime(ev);
                // Se for hoje, só mostra se o horário ainda não passou
                if (
                  eventDateTime.toDateString() === now.toDateString()
                ) {
                  return eventDateTime >= now;
                }
                // Se for futuro, mostra normalmente
                return eventDateTime > now || eventDateTime.toDateString() !== now.toDateString();
              });
              if (filtered.length === 0) {
                return (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma aula agendada para os próximos dias</p>
                    <p className="text-sm text-gray-400">Vá ao calendário para agendar suas aulas</p>
                  </div>
                );
              }
              const sorted = [...filtered].sort((a, b) => getEventDateTime(a).getTime() - getEventDateTime(b).getTime());
              const nextEvent = sorted.find(ev => getEventDateTime(ev) >= now) || sorted[0];
              return filtered.map(event => {
                const isNext = event.id === nextEvent.id;
                const color = event.event_type === 'avaliacao'
                  ? (isNext ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600')
                  : (isNext ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600');
                const border = isNext
                  ? (event.event_type === 'avaliacao' ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50 border border-blue-200')
                  : '';
                const icon = event.event_type === 'avaliacao' ? <FileText size={16} /> : <Users size={16} />;
                // Materiais vinculados
                const eventMaterials = (event.material_ids || []).map(id => materialsMap[id]).filter(Boolean);
                return (
                  <div
                    key={event.id}
                    className={`flex flex-row items-start md:items-center gap-3 md:gap-4 p-2 md:p-3 rounded-lg ${isNext ? border : ''} transition min-h-[64px] ${isNext ? 'bg-opacity-100' : 'bg-transparent'}`}
                  >
                    <div className="flex-shrink-0 flex items-center justify-center mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>{icon}</div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-1">
                        <p className="font-semibold truncate text-base md:text-sm" title={event.title}>{event.title}</p>
                        <span className="text-xs text-gray-500 font-medium">{event.event_type === 'avaliacao' ? 'Avaliação' : 'Aula'}</span>
                        {event.subject && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium ml-1">{event.subject}</span>}
                        {event.grade && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium ml-1">{event.grade}</span>}
                        {event.classroom && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium ml-1">Sala: {event.classroom}</span>}
                      </div>
                      <p className="text-xs text-gray-700 leading-tight">
                        {eventMaterials.length > 0
                          ? `Com ${eventMaterials.length} ${eventMaterials.length === 1 ? 'material' : 'materiais'}`
                          : ''}
                        {` para ${format(parseISO(event.start_date), "dd/MM/yyyy", { locale: ptBR })} das ${event.start_time.slice(0,5)} às ${event.end_time.slice(0,5)}`}
                      </p>
                      {event.description && <p className="text-xs text-gray-600 truncate" title={event.description}>{event.description}</p>}
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded ${event.event_type === 'avaliacao' ? 'bg-purple-500/10 text-purple-700' : 'bg-blue-500/10 text-blue-700'}`}
                          style={{letterSpacing: 0.2, backgroundColor: event.event_type === 'avaliacao' ? 'rgba(139, 92, 246, 0.10)' : 'rgba(59, 130, 246, 0.10)'}}
                        >
                          {format(parseISO(event.start_date), "dd/MM/yyyy", { locale: ptBR })} - {event.start_time.slice(0,5)} às {event.end_time.slice(0,5)}
                        </span>
                        {eventMaterials.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {eventMaterials.map(mat => (
                              <span key={mat.id} className="flex items-center bg-gray-100 rounded px-2 py-0.5 text-xs font-medium mr-1 mb-1">
                                {mat.type === 'plano-de-aula' && <ClipboardList size={12} className="mr-1" />}
                                {mat.type === 'slides' && <Presentation size={12} className="mr-1" />}
                                {mat.type === 'atividade' && <FileText size={12} className="mr-1" />}
                                {mat.type === 'avaliacao' && <CheckCircle size={12} className="mr-1" />}
                                <span className="truncate max-w-[80px]" title={mat.title}>{mat.title}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 block mt-0.5">
                        {event.updated_at ? format(parseISO(event.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''}
                      </span>
                    </div>
                  </div>
                );
              });
            })() : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma aula agendada para os próximos dias</p>
                <p className="text-sm text-gray-400">Vá ao calendário para agendar suas aulas</p>
              </div>
            )}
          </div>
          {/* Estatísticas rápidas logo abaixo */}
          <div className="mt-8">
            <h3 className="font-semibold text-lg mb-4">Estatísticas rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Planos de aula</p>
                    <p className="text-2xl font-bold text-gray-800">{materialStats?.planoAula || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <ClipboardList size={24} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min((materialStats?.planoAula || 0) * 10, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">+{materialStats?.weeklyGrowth.planoAula || 0} na última semana</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Slides</p>
                    <p className="text-2xl font-bold text-gray-800">{materialStats?.slides || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <Presentation size={24} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{ width: `${Math.min((materialStats?.slides || 0) * 15, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">+{materialStats?.weeklyGrowth.slides || 0} na última semana</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Atividades</p>
                    <p className="text-2xl font-bold text-gray-800">{materialStats?.atividades || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <FileText size={24} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min((materialStats?.atividades || 0) * 8, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">+{materialStats?.weeklyGrowth.atividades || 0} na última semana</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avaliações</p>
                    <p className="text-2xl font-bold text-gray-800">{materialStats?.avaliacoes || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <FileText size={24} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min((materialStats?.avaliacoes || 0) * 20, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">+{materialStats?.weeklyGrowth.avaliacoes || 0} na última semana</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Section - só aparece se tiver permissão */}
      {canAccessCreateMaterial() && (
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between mb-4 text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">Criar novo conteúdo</h3>
            <div className="mt-2 md:mt-0">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                Ver todos os modelos
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              className="btn-magic p-4 rounded-xl text-white text-center flex flex-col items-center group"
              onClick={() => navigate('/criar')}
            >
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ClipboardList size={24} />
              </div>
              <h4 className="font-semibold">Plano de Aula</h4>
              <p className="text-xs opacity-80 mt-1">Alinhado à BNCC</p>
            </button>
            
            <button
              className="btn-magic p-4 rounded-xl text-white text-center flex flex-col items-center group"
              onClick={() => navigate('/criar')}
            >
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h4 className="font-semibold">Slides de Aula</h4>
              <p className="text-xs opacity-80 mt-1">Com imagens e design</p>
            </button>
            
            <button
              className="btn-magic p-4 rounded-xl text-white text-center flex flex-col items-center group"
              onClick={() => navigate('/criar')}
            >
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h4 className="font-semibold">Atividade</h4>
              <p className="text-xs opacity-80 mt-1">Questões variadas</p>
            </button>
            
            <button
              className="btn-magic p-4 rounded-xl text-white text-center flex flex-col items-center group"
              onClick={() => navigate('/criar')}
            >
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h4 className="font-semibold">Avaliação</h4>
              <p className="text-xs opacity-80 mt-1">Testes e provas</p>
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
