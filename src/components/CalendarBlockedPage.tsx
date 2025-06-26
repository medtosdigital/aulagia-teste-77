
import React from 'react';
import { Calendar, Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import UpgradeModal from './UpgradeModal';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';

const CalendarBlockedPage: React.FC = () => {
  const { 
    isOpen: isUpgradeModalOpen, 
    closeModal: closeUpgradeModal, 
    handlePlanSelection,
    currentPlan,
    availablePlans 
  } = useUpgradeModal();

  const handleUpgradeClick = () => {
    // O modal será aberto automaticamente pelo hook
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white shadow-2xl border border-gray-300">
        <CardContent className="p-8 text-center">
          {/* Ícone com cadeado */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Calendar className="w-12 h-12 text-gray-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center shadow-lg">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Título e descrição */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Calendário de Materiais
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Organize e acompanhe seus agendamentos pedagógicos
          </p>
          <p className="text-gray-500 mb-8">
            Esta funcionalidade está disponível apenas nos planos pagos
          </p>

          {/* Recursos bloqueados */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Recursos Bloqueados:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Agendar materiais</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Visualização em calendário</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Gestão de horários</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Planejamento semanal</span>
              </div>
            </div>
          </div>

          {/* Botão de upgrade */}
          <Button 
            onClick={handleUpgradeClick}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Crown className="w-6 h-6 mr-2" />
            Fazer Upgrade do Plano
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            Desbloqueie todas as funcionalidades e potencialize seu ensino
          </p>
        </CardContent>
      </Card>

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

export default CalendarBlockedPage;
