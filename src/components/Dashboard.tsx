import React, { useState } from 'react';
import { Plus, Calendar, Crown, BookOpen, ClipboardList, FileText, CheckCircle, Download, Users, Presentation } from 'lucide-react';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('recent-activities');
  
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

  return <main className="p-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Bem-vindo de volta, Professor!</h1>
            <p className="opacity-90">Pronto para criar aulas mágicas hoje?</p>
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
        <div 
          className="bg-white rounded-xl shadow-sm p-5 flex items-center space-x-4 card-hover cursor-pointer"
          onClick={() => handleNavigate('create')}
        >
          <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Preparar Material</h3>
            <p className="text-sm text-gray-500">Comece a planejar</p>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-xl shadow-sm p-5 flex items-center space-x-4 card-hover cursor-pointer"
          onClick={() => handleNavigate('lessons')}
        >
          <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center text-secondary-600">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Meus Materiais</h3>
            <p className="text-sm text-gray-500">Veja seus conteúdos</p>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-xl shadow-sm p-5 flex items-center space-x-4 card-hover cursor-pointer"
          onClick={() => handleNavigate('calendar')}
        >
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Calendário</h3>
            <p className="text-sm text-gray-500">Veja sua agenda</p>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-xl shadow-sm p-5 flex items-center space-x-4 card-hover cursor-pointer"
          onClick={() => handleNavigate('subscription')}
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

      {/* Main Content Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="grid grid-cols-3">
            {tabs.map(tab => 
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`py-3 px-1 text-center border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                  activeTab === tab.id 
                    ? 'border-primary-500 text-primary-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            )}
          </nav>
        </div>
        
        <div className="p-4 md:p-6">
          {activeTab === 'recent-activities' && <div>
              <h3 className="font-semibold text-lg mb-4">Suas atividades recentes</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle size={16} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Você criou um novo plano de aula</p>
                    <p className="text-sm text-gray-500">Matemática - Álgebra Linear para o 3º ano</p>
                    <p className="text-xs text-gray-400 mt-1">Hoje, 10:45 AM</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Download size={16} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Exportou uma avaliação</p>
                    <p className="text-sm text-gray-500">História - Revolução Industrial em PDF</p>
                    <p className="text-xs text-gray-400 mt-1">Ontem, 3:20 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <Plus size={16} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Atualizou o template de slides</p>
                    <p className="text-sm text-gray-500">Novo cabeçalho e rodapé adicionados</p>
                    <p className="text-xs text-gray-400 mt-1">Quarta-feira, 9:15 AM</p>
                  </div>
                </div>
              </div>
            </div>}

          {activeTab === 'upcoming-classes' && <div>
              <h3 className="font-semibold text-lg mb-4">Suas próximas aulas</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-3 bg-blue-50 rounded-lg">
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Matemática - 3º Ano A</p>
                    <p className="text-sm text-gray-700">Álgebra Linear: Introdução a Matrizes</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">Amanhã, 8:00 AM - 9:30 AM</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <BookOpen size={16} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Português - 2º Ano B</p>
                    <p className="text-sm text-gray-500">Análise de Texto: Machado de Assis</p>
                    <p className="text-xs text-gray-400 mt-1">Sexta-feira, 10:00 AM - 11:30 AM</p>
                  </div>
                </div>
              </div>
            </div>}

          {activeTab === 'quick-stats' && <div>
              <h3 className="font-semibold text-lg mb-4">Estatísticas rápidas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Planos de aula</p>
                      <p className="text-2xl font-bold text-gray-800">24</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      <ClipboardList size={24} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full w-3/4"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">+5 na última semana</p>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Slides</p>
                      <p className="text-2xl font-bold text-gray-800">18</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Presentation size={24} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-4/5"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">+3 na última semana</p>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Atividades criadas</p>
                      <p className="text-2xl font-bold text-gray-800">42</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600">
                      <FileText size={24} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-secondary-500 h-2 rounded-full w-3/5"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">+8 na última semana</p>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Avaliações</p>
                      <p className="text-2xl font-bold text-gray-800">15</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <FileText size={24} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full w-2/5"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">+3 na última semana</p>
                  </div>
                </div>
              </div>
            </div>}
        </div>
      </div>

      {/* Create New Section */}
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
            onClick={() => handleNavigate('create')}
          >
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ClipboardList size={24} />
            </div>
            <h4 className="font-semibold">Plano de Aula</h4>
            <p className="text-xs opacity-80 mt-1">Alinhado à BNCC</p>
          </button>
          
          <button 
            className="btn-magic p-4 rounded-xl text-white text-center flex flex-col items-center group"
            onClick={() => handleNavigate('create')}
          >
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h4 className="font-semibold">Slides de Aula</h4>
            <p className="text-xs opacity-80 mt-1">Com imagens e design</p>
          </button>
          
          <button 
            className="btn-magic p-4 rounded-xl text-white text-center flex flex-col items-center group"
            onClick={() => handleNavigate('create')}
          >
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <h4 className="font-semibold">Atividade</h4>
            <p className="text-xs opacity-80 mt-1">Questões variadas</p>
          </button>
          
          <button 
            className="btn-magic p-4 rounded-xl text-white text-center flex flex-col items-center group"
            onClick={() => handleNavigate('create')}
          >
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <h4 className="font-semibold">Avaliação</h4>
            <p className="text-xs opacity-80 mt-1">Testes e provas</p>
          </button>
        </div>
      </div>
    </main>;
};

export default Dashboard;
