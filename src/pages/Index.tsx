import React, { useState, useEffect } from 'react';
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

const Index = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { user } = useAuth();
  
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
    showModal: showFirstAccessModal,
    completeFirstAccess,
    closeModal: closeFirstAccessModal
  } = useFirstAccess();

  // Integrar sistema de feedback
  const {
    showFeedbackModal,
    closeFeedbackModal,
    dontShowAgain,
    checkDailyModal
  } = useFeedback();

  useEffect(() => {
    const handleNavigateToProfile = () => {
      setActiveItem('profile');
    };

    const handleNavigateToSubscription = () => {
      setActiveItem('subscription');
    };

    window.addEventListener('navigateToProfile', handleNavigateToProfile);
    window.addEventListener('navigateToSubscription', handleNavigateToSubscription);

    // Verificar modal diário de feedback ao montar o componente
    checkDailyModal();

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
  }, [checkDailyModal, user]);

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
      case 'profile':
        return 'Perfil';
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
        // Verificar apenas se o usuário está logado
        if (!user) {
          return (
            <PageBlockedOverlay
              title="Acesso Restrito"
              description="Você precisa estar logado para acessar a criação de materiais."
              icon="plus"
              onUpgrade={() => {}} // Não precisa de upgrade, apenas login
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
        // Verificar apenas se o usuário está logado
        if (!user) {
          return (
            <PageBlockedOverlay
              title="Acesso Restrito"
              description="Você precisa estar logado para acessar seus materiais."
              icon="book"
              onUpgrade={() => {}} // Não precisa de upgrade, apenas login
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
        // Verificar apenas se o usuário está logado
        if (!user) {
          return (
            <PageBlockedOverlay
              title="Acesso Restrito"
              description="Você precisa estar logado para acessar o calendário."
              icon="calendar"
              onUpgrade={() => {}} // Não precisa de upgrade, apenas login
            >
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Calendário</h2>
                <p className="text-gray-600">Organize seus materiais pedagogicos</p>
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

      case 'profile':
        return <ProfilePage />;
        
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

  return (
    <>
      <Routes>
        {/* Rota para visualização de material específico */}
        <Route path="/material/:id" element={<MaterialViewer />} />
        
        {/* Rota principal com sidebar */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 w-full flex flex-col">
            <Sidebar activeItem={activeItem} onItemClick={handleNavigate} />
            
            <div className="md:ml-64 min-h-screen flex flex-col">
              <Header title={getPageTitle()} />
              <div className="flex-1">
                {renderContent()}
              </div>
              <Footer />
            </div>
          </div>
        } />
      </Routes>

      {/* Modal de primeiro acesso */}
      <FirstAccessModal
        isOpen={showFirstAccessModal}
        onClose={closeFirstAccessModal}
        onComplete={completeFirstAccess}
      />

      {/* Modal de upgrade global */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentPlan={mappedCurrentPlan}
        onPlanSelect={handlePlanSelection}
      />

      {/* Modal de suporte para plano Professor */}
      <SupportModal
        isOpen={shouldShowSupportModal}
        onClose={dismissSupportModal}
        currentPlanName={mappedCurrentPlan.name}
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

      {/* Modal de Feedback automático */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={closeFeedbackModal}
        onDontShowAgain={dontShowAgain}
        showDontShowOption={true}
      />
    </>
  );
};

function OnboardingPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', subject: '', grade: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Se veio do magic link com plano, já associa ao plano
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    if (user && plan === 'grupo_escolar') {
      supabase.auth.updateUser({ data: { plano_ativo: 'grupo_escolar' } });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Atualiza perfil do usuário
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: form.name,
          subject: form.subject,
          grade: form.grade,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Faça login pelo link mágico enviado ao seu e-mail.</div>;
  }

  if (success) {
    return <div className="min-h-screen flex items-center justify-center text-green-600 text-xl font-bold">Cadastro concluído! Bem-vindo à plataforma.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center mb-2">Complete seu cadastro</h2>
        <p className="text-gray-600 text-center mb-4">Preencha seus dados para acessar o Grupo Escolar.</p>
        <div>
          <label className="block text-sm font-medium mb-1">Nome completo</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Matéria lecionada</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Série(s)</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} required />
        </div>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded font-semibold mt-2" disabled={loading}>{loading ? 'Salvando...' : 'Concluir cadastro'}</button>
      </form>
    </div>
  );
}

export default Index;
