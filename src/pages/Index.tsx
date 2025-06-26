
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
import SupportModal from '@/components/SupportModal';
import AdminLoginModal from '@/components/AdminLoginModal';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';

const Index = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  const { 
    canAccessSchool, 
    canAccessSettings, 
    canAccessCreateMaterial,
    canAccessMaterials,
    hasCalendar,
    shouldShowSupportModal,
    dismissSupportModal,
    currentPlan,
    getNextResetDate,
    isAdminAuthenticated
  } = usePlanPermissions();
  
  const { 
    isOpen: isUpgradeModalOpen, 
    closeModal: closeUpgradeModal, 
    openModal: openUpgradeModal,
    handlePlanSelection,
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
    // Verificar se precisa de login de admin para páginas administrativas
    if ((page === 'settings' || page === 'api-keys' || page === 'templates') && !isAdminAuthenticated()) {
      setShowAdminLogin(true);
      return;
    }
    
    setActiveItem(page);
  };

  const calculateRemainingDays = (): number => {
    const nextReset = getNextResetDate();
    const now = new Date();
    const diffTime = Math.abs(nextReset.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
        
      case 'create':
        if (!canAccessCreateMaterial()) {
          return (
            <PageBlockedOverlay
              title="Recurso Restrito"
              description="Para acessar a criação de materiais com o plano Grupo Escolar, você precisa ser adicionado como usuário da escola e ter acesso ao plano Professor."
              icon="plus"
              onUpgrade={openUpgradeModal}
            >
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Criar Material</h2>
                <p className="text-gray-600">Crie planos de aula, slides e atividades</p>
              </div>
            </PageBlockedOverlay>
          );
        }
        return <CreateLesson />;
        
      case 'lessons':
        if (!canAccessMaterials()) {
          return (
            <PageBlockedOverlay
              title="Recurso Restrito"
              description="Para acessar seus materiais com o plano Grupo Escolar, você precisa ser adicionado como usuário da escola e ter acesso ao plano Professor."
              icon="book"
              onUpgrade={openUpgradeModal}
            >
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Meus Materiais</h2>
                <p className="text-gray-600">Visualize e gerencie seus conteúdos</p>
              </div>
            </PageBlockedOverlay>
          );
        }
        return <MaterialsList />;
        
      case 'calendar':
        if (!hasCalendar()) {
          const isSchoolPlan = currentPlan.id === 'grupo-escolar';
          return (
            <PageBlockedOverlay
              title={isSchoolPlan ? "Recurso Restrito" : "Calendário Premium"}
              description={
                isSchoolPlan 
                  ? "Para acessar o calendário com o plano Grupo Escolar, você precisa ser adicionado como usuário da escola e ter acesso ao plano Professor."
                  : "O calendário está disponível apenas para planos Professor e Grupo Escolar. Faça upgrade para organizar suas aulas e atividades."
              }
              icon="calendar"
              onUpgrade={openUpgradeModal}
            >
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Calendário</h2>
                <p className="text-gray-600">Organize suas aulas e atividades</p>
              </div>
            </PageBlockedOverlay>
          );
        }
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
              title="Acesso Restrito"
              description="As configurações estão disponíveis apenas para administradores. Faça login com suas credenciais de administrador."
              icon="settings"
              onUpgrade={() => setShowAdminLogin(true)}
            >
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Configurações</h2>
                <p className="text-gray-600">Configurações administrativas do sistema</p>
              </div>
            </PageBlockedOverlay>
          );
        }
        return <div className="p-4"><h2>Configurações - Em desenvolvimento</h2></div>;
        
      case 'api-keys':
        if (!canAccessSettings()) {
          return (
            <PageBlockedOverlay
              title="Acesso Restrito"
              description="O gerenciamento de chaves de API está disponível apenas para administradores. Faça login com suas credenciais de administrador."
              icon="settings"
              onUpgrade={() => setShowAdminLogin(true)}
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
            <Sidebar activeItem={activeItem} onItemClick={handleNavigate} />
            
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

      {/* Modal de suporte para plano Professor */}
      <SupportModal
        isOpen={shouldShowSupportModal}
        onClose={dismissSupportModal}
        currentPlanName={currentPlan.name}
        remainingDays={calculateRemainingDays()}
      />

      {/* Modal de login do administrador */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={() => {
          setShowAdminLogin(false);
          // Redirecionar para a página solicitada após login bem-sucedido
        }}
      />
    </>
  );
};

export default Index;
