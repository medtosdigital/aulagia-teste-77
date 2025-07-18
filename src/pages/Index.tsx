import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
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
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { useFirstAccess } from '@/hooks/useFirstAccess';
import { useFeedback } from '@/hooks/useFeedback';
import { supabase } from '@/integrations/supabase/client';
import AdminUsersPage from '@/components/AdminUsersPage';
import AdminConfigPage from '@/components/AdminConfigPage';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/materiais': 'Meus Materiais',
  '/criar': 'Criar Material',
  '/agenda': 'Calendário',
  '/escola': 'Escola',
  '/perfil': 'Perfil',
  '/assinatura': 'Assinatura',
  '/configuracoes': 'Configurações',
  '/api-keys': 'Chaves de API',
};

const Index = () => {
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
  } = usePlanPermissions();

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

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const openFeedbackModal = () => setShowFeedbackModal(true);
  const closeFeedbackModal = () => setShowFeedbackModal(false);

  useEffect(() => {
    const handleOpenFeedbackModal = () => openFeedbackModal();
    window.addEventListener('openFeedbackModal', handleOpenFeedbackModal);
    return () => {
      window.removeEventListener('openFeedbackModal', handleOpenFeedbackModal);
    };
  }, []);

  // Integrar sistema de feedback
  const { submitFeedback, getUserFeedbacks, loading } = useFeedback();

  useEffect(() => {
    const handleNavigateToProfile = () => {
      navigate('/perfil');
    };
    const handleNavigateToSubscription = () => {
      navigate('/assinatura');
    };
    // Se veio do magic link com plano, já associa ao plano
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    if (user && plan === 'grupo_escolar') {
      supabase.auth.updateUser({ data: { plano_ativo: 'grupo_escolar' } });
    }
    return () => {
      window.removeEventListener('navigateToProfile', handleNavigateToProfile);
      window.removeEventListener('navigateToSubscription', handleNavigateToSubscription);
    };
  }, [user, isFirstAccess, navigate]);

  // Resetar scroll do container principal ao trocar de rota
  useEffect(() => {
    document.querySelector('.flex-1')?.scrollTo(0, 0);
  }, [location.pathname]);

  // O currentPlan já vem no formato correto do hook usePlanPermissions
  const mappedCurrentPlan = currentPlan;

  // Função para proteger rotas que exigem login
  const requireAuth = (element: React.ReactNode) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return element;
  };

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
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (!canAccessSchool()) {
      return <Navigate to="/assinatura" replace />;
    }
    return element;
  };

  // Título dinâmico baseado na rota
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/material/')) return 'Visualizar Material';
    return pageTitles[path] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full flex flex-col">
      <Sidebar />
      <div className="md:ml-64 min-h-screen flex flex-col flex-1 h-full overflow-y-auto">
        <Header title={getPageTitle()} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={requireAuth(<Dashboard />)} />
            <Route path="/materiais" element={requireAuth(<MaterialsList />)} />
            <Route path="/criar" element={requireAuth(<CreateLesson />)} />
            <Route path="/agenda" element={requireAuth(<CalendarPage />)} />
            <Route path="/escola" element={requireSchool(<SchoolPage />)} />
            <Route path="/perfil" element={requireAuth(<ProfilePage />)} />
            <Route path="/assinatura" element={requireAuth(<SubscriptionPage />)} />
            <Route path="/configuracoes" element={requireAdmin(<AdminConfigPage />)} />
            <Route path="/admin/usuarios" element={requireAdmin(<AdminUsersPage />)} />
            <Route path="/api-keys" element={requireAdmin(<div className="p-4"><h2>Chaves de API - Em desenvolvimento</h2></div>)} />
            <Route path="/material/:id" element={requireAuth(<MaterialViewer />)} />
            <Route path="*" element={<Navigate to={user ? "/" : "/landing"} replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
      {/* Modais globais */}
      <FirstAccessModal
        isOpen={showFirstAccessModal}
        onClose={closeFirstAccessModal}
        onComplete={completeFirstAccess}
        initialName={user?.user_metadata?.full_name || user?.user_metadata?.name || ''}
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
          showDontShowOption={true}
        />
      )}
    </div>
  );
};

export default Index;
