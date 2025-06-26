
import React from 'react';
import { LayoutDashboard, Plus, BookOpen, Calendar, TrendingUp, Users, School } from 'lucide-react';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';

const Dashboard: React.FC = () => {
  const {
    currentPlan,
    usage,
    getRemainingMaterials,
    canAccessSchool,
    canAccessCreateMaterial,
    canAccessMaterials,
    canAccessCalendarPage
  } = usePlanPermissions();

  const handleItemClick = (item: string) => {
    // Handle navigation logic here
    console.log('Navigate to:', item);
  };

  const statsCards = [
    {
      title: 'Materiais Criados',
      value: usage.materialsThisMonth.toString(),
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Materiais Restantes',
      value: getRemainingMaterials().toString(),
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Total de Materiais',
      value: usage.totalMaterials.toString(),
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50 ${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Botão Escola - apenas para plano grupo escolar */}
        {canAccessSchool() && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleItemClick('school')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Escola</p>
                <p className="text-lg font-semibold text-gray-900">Gerenciar</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <School size={24} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {canAccessCreateMaterial() && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleItemClick('create')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Plus size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Criar Material</h3>
                <p className="text-white/80">Criar novo material didático</p>
              </div>
            </div>
          </div>
        )}

        {canAccessMaterials() && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleItemClick('lessons')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Meus Materiais</h3>
                <p className="text-gray-600">Ver materiais criados</p>
              </div>
            </div>
          </div>
        )}

        {canAccessCalendarPage() && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleItemClick('calendar')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Calendário</h3>
                <p className="text-gray-600">Gerenciar agenda</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
