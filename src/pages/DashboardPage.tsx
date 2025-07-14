
import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import CreateLesson from '@/components/CreateLesson';
import MaterialsList from '@/components/MaterialsList';
import MaterialViewer from '@/components/MaterialViewer';
import CalendarPage from '@/components/CalendarPage';
import SchoolPage from '@/components/SchoolPage';
import SubscriptionPage from '@/components/SubscriptionPage';
import ProfilePage from '@/components/ProfilePage';
import PageBlockedOverlay from '@/components/PageBlockedOverlay';
import { UpgradeModal } from '@/components/UpgradeModal';
import SupportModal from '@/components/SupportModal';
import AdminLoginModal from '@/components/AdminLoginModal';
import FirstAccessModal from '@/components/FirstAccessModal';
import FeedbackModal from '@/components/FeedbackModal';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabasePlanPermissions } from '@/hooks/useSupabasePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { useFirstAccess } from '@/hooks/useFirstAccess';
import { useFeedback } from '@/hooks/useFeedback';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/materiais': 'Meus Materiais',
  '/dashboard/criar': 'Criar Material',
  '/dashboard/agenda': 'Calendário',
  '/dashboard/escola': 'Escola',
  '/dashboard/perfil': 'Perfil',
  '/dashboard/assinatura': 'Assinatura',
  '/dashboard/configuracoes': 'Configurações',
  '/dashboard/api-keys': 'Chaves de API',
};

const DashboardPage = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    canAccessSchool,
    canAccessSettings,
    shouldShowSupportModal,
    dismissSupportModal,
    currentPlan,
    getNextResetDate,
    isAdminAuthenticated
  } = useSupabasePlanPermissions();

  const {
    isOpen: isUpgradeModalOpen,
    closeModal: closeUpgradeModal,
    openModal: openUpgradeModal,
    handlePlanSelection,
    availablePlans
  } = useUpgradeModal();

  const {
    isFirstAccess,
    showModal: showFirstAccessModal,
    completeFirstAccess,
    closeModal: closeFirstAccessModal
  } = useFirstAccess();

  // Integrar sistema de feedback
  const {
    showFeedbackModal,
    closeFeedbackModal,
    dontShowAgain,
    incrementMaterialsCreated
  } = useFeedback(currentPlan?.plano_ativo || 'gratuito', isFirstAccess);

  useEffect(() => {
    const handleNavigateToProfile = () => {
      navigate('/dashboard/perfil');
    };
    const handleNavigateToSubscription = () => {
      navigate('/dashboard/assinatura');
    };
    const handleOpenFeedbackModal = () => {
      if (!isFirstAccess) {
        window.localStorage.setItem('feedbackState', JSON.stringify({
          ...JSON.parse(window.localStorage.getItem('feedbackState') || '{}'),
          showFeedbackModal: true
        }));
        window.dispatchEvent(new Event('feedbackModalUpdated'));
      }
    };
    window.addEventListener('navigateToProfile', handleNavigateToProfile);
    window.addEventListener('navigateToSubscription', handleNavigateToSubscription);
    window.addEventListener('openFeedbackModal', handleOpenFeedbackModal);
    // Se veio do magic link com plano, já associa ao plano
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    if (user && plan === 'grupo_escolar') {
      supabase.auth.updateUser({ data: { plano_ativo: 'grupo_escolar' } });
    }
    return () => {
      window.removeEventListener('navigateToProfile', handleNavigateToProfile);
      window.removeEventListener('navigateToSubscription', handleNavigateToSubscription);
      window.removeEventListener('openFeedbackModal', handleOpenFeedbackModal);
    };
  }, [user, isFirstAccess, navigate]);

  // Resetar scroll do container principal ao trocar de rota
  useEffect(() => {
    document.querySelector('.flex-1')?.scrollTo(0, 0);
  }, [location.pathname]);

  const mappedCurrentPlan = currentPlan ? {
    id: currentPlan.plano_ativo,
    name: currentPlan.plano_ativo === 'gratuito' ? 'Plano Gratuito' :
      currentPlan.plano_ativo === 'professor' ? 'Plano Professor' : 'Grupo Escolar',
    limits: {
      materialsPerMonth: currentPlan.plano_ativo === 'gratuito' ? 5 :
        currentPlan.plano_ativo === 'professor' ? 50 : 300,
      canDownloadWord: currentPlan.plano_ativo !== 'gratuito',
      canDownloadPPT: currentPlan.plano_ativo !== 'gratuito',
      canEditMaterials: currentPlan.plano_ativo !== 'gratuito',
      canCreateSlides: currentPlan.plano_ativo !== 'gratuito',
      canCreateAssessments: currentPlan.plano_ativo !== 'gratuito',
      hasCalendar: currentPlan.plano_ativo !== 'gratuito',
      hasHistory: currentPlan.plano_ativo !== 'gratuito'
    },
    price: {
      monthly: currentPlan.plano_ativo === 'gratuito' ? 0 :
        currentPlan.plano_ativo === 'professor' ? 29.90 : 89.90,
      yearly: currentPlan.plano_ativo === 'gratuito' ? 0 :
        currentPlan.plano_ativo === 'professor' ? 299 : 849
    }
  } : {
    id: 'gratuito',
    name: 'Plano Gratuito',
    limits: {
      materialsPerMonth: 5,
      canDownloadWord: false,
      canDownloadPPT: false,
      canEditMaterials: false,
      canCreateSlides: false,
      canCreateAssessments: false,
      hasCalendar: false,
      hasHistory: false
    },
    price: { monthly: 0, yearly: 0 }
  };

  // Função para proteger rotas que exigem login
  // (REMOVIDA pois já está protegida pelo ProtectedRoute)
  // const requireAuth = (element: React.ReactNode) => {
  //   if (!user) {
  //     return (
  //       <PageBlockedOverlay
  //         title="Acesso Restrito"
  //         description="Você precisa estar logado para acessar esta página."
  //         icon="lock"
  //         onUpgrade={() => {}}
  //       >
  //         <div className="p-8 text-center">
  //           <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
  //           <p className="text-gray-600">Faça login para continuar.</p>
  //         </div>
  //       </PageBlockedOverlay>
  //     );
  //   }
  //   return element;
  // };

  // Função para proteger rotas administrativas
  const requireAdmin = (element: React.ReactNode) => {
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
    return element;
  };

  // Função para proteger rota da escola
  const requireSchool = (element: React.ReactNode) => {
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
    return element;
  };

  // Título dinâmico baseado na rota
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard/material/')) return 'Visualizar Material';
    return pageTitles[path] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full flex flex-col">
      <Sidebar />
      <div className="md:ml-64 min-h-screen flex flex-col">
        <Header title={getPageTitle()} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/materiais" element={<MaterialsList />} />
            <Route path="/criar" element={<CreateLesson />} />
            <Route path="/agenda" element={<CalendarPage />} />
            <Route path="/escola" element={<SchoolPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/assinatura" element={<SubscriptionPage />} />
            <Route path="/configuracoes" element={requireAdmin(<div className="p-4"><h2>Configurações - Em desenvolvimento</h2></div>)} />
            <Route path="/api-keys" element={requireAdmin(<div className="p-4"><h2>Chaves de API - Em desenvolvimento</h2></div>)} />
            <Route path="/material/:id" element={<MaterialViewer />} />
          </Routes>
        </div>
        <Footer />
      </div>
      {/* Modais globais */}
      <FirstAccessModal
        isOpen={showFirstAccessModal}
        onClose={closeFirstAccessModal}
        onComplete={completeFirstAccess}
      />
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentPlan={mappedCurrentPlan}
        onPlanSelect={handlePlanSelection}
      />
      <SupportModal
        isOpen={shouldShowSupportModal}
        onClose={dismissSupportModal}
        currentPlanName={mappedCurrentPlan.name}
        remainingDays={15}
      />
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={() => setShowAdminLogin(false)}
      />
      {!isFirstAccess && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={closeFeedbackModal}
          onDontShowAgain={dontShowAgain}
          showDontShowOption={true}
        />
      )}
    </div>
  );
};

export default DashboardPage;
