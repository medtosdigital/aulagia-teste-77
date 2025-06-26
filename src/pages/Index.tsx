
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import CreateLesson from '@/components/CreateLesson';
import MaterialsList from '@/components/MaterialsList';
import MaterialViewer from '@/components/MaterialViewer';
import CalendarPage from '@/components/CalendarPage';
import SchoolPage from '@/components/SchoolPage';
import SubscriptionPage from '@/components/SubscriptionPage';
import PageBlockedOverlay from '@/components/PageBlockedOverlay';
import UpgradeModal from '@/components/UpgradeModal';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';

const Index = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const { canAccessSchool, canAccessSettings } = usePlanPermissions();
  const { 
    isOpen: isUpgradeModalOpen, 
    closeModal: closeUpgradeModal, 
    openModal: openUpgradeModal,
    handlePlanSelection,
    currentPlan,
    availablePlans 
  } = useUpgradeModal();

  const getPageTitle = () => {
    switch (activeItem) {
      case 'dashboard':
        return 'Dashboard';
      case 'create':
        return 'Criar Material';
      case 'lessons':
        return 'Meus Materiais';
      case 'calendar':
        return 'Calendário';
      case 'school':
        return 'Escola';
      case 'subscription':
        return 'Assinatura';
      case 'settings':
        return 'Configurações';
      case 'api-keys':
        return 'Chaves de API';
      default:
        return 'Dashboard';
    }
  };

  const handleNavigate = (page: string) => {
    setActiveItem(page);
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'create':
        return <CreateLesson />;
      case 'lessons':
        return <MaterialsList />;
      case 'calendar':
        return <CalendarPage />;
      case 'school':
        if (!canAccessSchool()) {
          return (
            <PageBlockedOverlay
              title="Recurso Grupo Escolar"
              description="A página Escola está disponível apenas para o plano Grupo Escolar. Faça upgrade para gerenciar sua instituição educacional."
              icon="school"
              onUpgrade={openUpgradeModal}
            >
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestão Escolar</h2>
                <p className="text-gray-600">Recursos administrativos para sua escola</p>
              </div>
            </PageBlockedOverlay>
          );
        }
        return <SchoolPage />;
      case 'subscription':
        return <SubscriptionPage />;
      case 'settings':
        if (!canAccessSettings()) {
          return (
            <PageBlockedOverlay
              title="Configurações Avançadas"
              description="As configurações avançadas estão disponíveis apenas para o plano Grupo Escolar. Faça upgrade para acessar recursos administrativos."
              icon="settings"
              onUpgrade={openUpgradeModal}
            >
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Configurações</h2>
                <p className="text-gray-600">Personalize sua experiência</p>
              </div>
            </PageBlockedOverlay>
          );
        }
        return <div className="p-4"><h2>Configurações - Em desenvolvimento</h2></div>;
      case 'api-keys':
        if (!canAccessSettings()) {
          return (
            <PageBlockedOverlay
              title="Chaves de API Premium"
              description="O gerenciamento de chaves de API está disponível apenas para o plano Grupo Escolar. Faça upgrade para integrar APIs externas."
              icon="settings"
              onUpgrade={openUpgradeModal}
            >
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Chaves de API</h2>
                <p className="text-gray-600">Gerencie suas integrações</p>
              </div>
            </PageBlockedOverlay>
          );
        }
        return <div className="p-4"><h2>Chaves de API - Em desenvolvimento</h2></div>;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <Routes>
        {/* Rota para visualização de material específico */}
        <Route path="/material/:id" element={<MaterialViewer />} />
        
        {/* Rota principal com sidebar */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 w-full">
            <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
            
            <div className="md:ml-64 min-h-screen pb-20 md:pb-0">
              <Header title={getPageTitle()} />
              {renderContent()}
            </div>
          </div>
        } />
      </Routes>

      {/* Modal de upgrade global */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        onSelectPlan={handlePlanSelection}
        availablePlans={availablePlans}
        currentPlanName={currentPlan.name}
      />
    </>
  );
};

export default Index;
