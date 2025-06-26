import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Crown, BookOpen, ClipboardList, FileText, CheckCircle, Download, Users, Presentation } from 'lucide-react';
import { statsService, MaterialStats } from '@/services/statsService';
import { scheduleService, ScheduleEvent } from '@/services/scheduleService';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { Activity } from '@/services/activityService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState('recent-activities');
  const [materialStats, setMaterialStats] = useState<MaterialStats | null>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<ScheduleEvent[]>([]);
  
  // Usar o hook de rastreamento de atividades e permissões
  const { activities: recentActivities, refreshActivities } = useActivityTracker();
  const { canAccessCreateMaterial, canAccessMaterials, hasCalendar } = usePlanPermissions();

  useEffect(() => {
    console.log('🏠 Dashboard mounted, recent activities:', recentActivities);
    
    // Carregar dados quando o componente montar
    setMaterialStats(statsService.getMaterialStats());
    
    // Carregar próximas aulas (próximos 7 dias)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const upcoming = scheduleService.getEventsByDateRange(now, nextWeek)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 5);
    setUpcomingClasses(upcoming);
  }, [recentActivities]);

  const tabs = [{
    id: 'recent-activities',
    label: 'Atividades Recentes',
    shortLabel: 'Atividades'
  }, {
    id: 'upcoming-classes',
    label: 'Próximas Aulas',
    shortLabel: 'Aulas'
  }, {
    id: 'quick-stats',
    label: 'Estatísticas',
    shortLabel: 'Stats'
  }];

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

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

  return <main className="p-4">
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
          <div className="bg-white rounded-xl shadow-sm p-5 flex items-center space-x-4 card-hover cursor-pointer" onClick={() => handleNavigate('create')}>
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
          <div className="bg-white rounded-xl shadow-sm p-5 flex items-center space-x-4 card-hover cursor-pointer" onClick={() => handleNavigate('lessons')}>
            <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center text-secondary-600">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Meus Materiais</h3>
              <p className="text-sm text-gray-500">Veja seus conteúdos</p>
            </div>
          </div>
        )}
        
        {hasCalendar() && (
          <div className="bg-white rounded-xl shadow-sm p-5 flex items-center space-x-4 card-hover cursor-pointer" onClick={() => handleNavigate('calendar')}>
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Calendário</h3>
              <p className="text-sm text-gray-500">Veja sua agenda</p>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center space-x-4 card-hover cursor-pointer" onClick={() => handleNavigate('subscription')}>
          <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
            <Crown size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Assinatura</h3>
            <p className="text-sm text-gray-500">Atualize seu plano</p>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="grid grid-cols-3">
            {tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-3 px-1 text-center border-b-2 font-medium text-xs sm:text-sm transition-colors ${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                {tab.label}
              </button>)}
          </nav>
        </div>
        
        <div className="p-4 md:p-6">
          {activeTab === 'recent-activities' && <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Suas atividades recentes</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Ao vivo</span>
                  <button 
                    onClick={refreshActivities}
                    className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                  >
                    Atualizar
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityIconColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                        {activity.subject && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {activity.subject}
                          </span>
                        )}
                        {activity.grade && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            {activity.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-800 mb-2">Ainda não há atividades</h4>
                    <p className="text-gray-500 mb-4">Suas atividades aparecerão aqui quando você começar a criar materiais</p>
                    {canAccessCreateMaterial() && (
                      <button 
                        onClick={() => handleNavigate('create')}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Material
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>}

          {activeTab === 'upcoming-classes' && <div>
              <h3 className="font-semibold text-lg mb-4">Suas próximas aulas</h3>
              
              <div className="space-y-4">
                {upcomingClasses.length > 0 ? upcomingClasses.map(event => (
                  <div key={event.id} className={`flex items-start space-x-4 p-3 rounded-lg ${
                    new Date(event.startDate).toDateString() === new Date().toDateString() 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  } transition`}>
                    <div className="mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        new Date(event.startDate).toDateString() === new Date().toDateString()
                          ? 'bg-blue-600 text-white'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        <Users size={16} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-700">{event.grade} - {event.subject}</p>
                      <p className={`text-xs mt-1 font-medium ${
                        new Date(event.startDate).toDateString() === new Date().toDateString()
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}>
                        {format(event.startDate, "dd/MM/yyyy", { locale: ptBR })} - {event.startTime} às {event.endTime}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma aula agendada para os próximos dias</p>
                    <p className="text-sm text-gray-400">Vá ao calendário para agendar suas aulas</p>
                  </div>
                )}
              </div>
            </div>}

          {activeTab === 'quick-stats' && <div>
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
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.min((materialStats?.planoAula || 0) * 10, 100)}%`}}></div>
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
                      <div className="bg-gray-500 h-2 rounded-full" style={{width: `${Math.min((materialStats?.slides || 0) * 15, 100)}%`}}></div>
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
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${Math.min((materialStats?.atividades || 0) * 8, 100)}%`}}></div>
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
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: `${Math.min((materialStats?.avaliacoes || 0) * 20, 100)}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">+{materialStats?.weeklyGrowth.avaliacoes || 0} na última semana</p>
                  </div>
                </div>
              </div>
            </div>}
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
            <button className="btn-magic p-4 rounded-xl text-white text-center flex flex-col items-center group" onClick={() => handleNavigate('create')}>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ClipboardList size={24} />
              </div>
              <h4 className="font-semibold">Plano de Aula</h4>
              <p className="text-xs opacity-80 mt-1">Alinhado à BNCC</p>
            </button>
            
            <button className="btn-magic p-4 rounded-xl text-white text-center flex flex-col items-center group" onClick={() => handleNavigate('create')}>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h4 className="font-semibold">Slides de Aula</h4>
              <p className="text-xs opacity-80 mt-1">Com imagens e design</p>
            </button>
            
            <button className="btn-magic p-4 rounded-xl text-white text-center flex flex-col items-center group" onClick={() => handleNavigate('create')}>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h4 className="font-semibold">Atividade</h4>
              <p className="text-xs opacity-80 mt-1">Questões variadas</p>
            </button>
            
            <button className="btn-magic p-4 rounded-xl text-white text-center flex flex-col items-center group" onClick={() => handleNavigate('create')}>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h4 className="font-semibold">Avaliação</h4>
              <p className="text-xs opacity-80 mt-1">Testes e provas</p>
            </button>
          </div>
        </div>
      )}
    </main>;
};

export default Dashboard;
