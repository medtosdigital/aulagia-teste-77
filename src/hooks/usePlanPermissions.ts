
import { useState, useEffect } from 'react';
import { planPermissionsService, UserPlan, UserUsage } from '@/services/planPermissionsService';

export const usePlanPermissions = () => {
  const [currentPlan, setCurrentPlan] = useState<UserPlan>(planPermissionsService.getCurrentPlan());
  const [usage, setUsage] = useState<UserUsage>(planPermissionsService.getUserUsage());
  const [shouldShowUpgrade, setShouldShowUpgrade] = useState(false);
  const [shouldShowSupportModal, setShouldShowSupportModal] = useState(false);

  const refreshData = () => {
    setCurrentPlan(planPermissionsService.getCurrentPlan());
    setUsage(planPermissionsService.getUserUsage());
  };

  const createMaterial = (): boolean => {
    const canCreate = planPermissionsService.incrementMaterialUsage();
    
    if (!canCreate) {
      // Para o plano Professor, mostrar modal de suporte
      if (planPermissionsService.shouldShowSupportModal()) {
        setShouldShowSupportModal(true);
      } else {
        setShouldShowUpgrade(true);
      }
      return false;
    }
    
    refreshData();
    return true;
  };

  const canPerformAction = (action: keyof UserPlan['limits']): boolean => {
    return planPermissionsService.canPerformAction(action);
  };

  const getRemainingMaterials = (): number => {
    return planPermissionsService.getRemainingMaterials();
  };

  const isLimitReached = (): boolean => {
    return planPermissionsService.isLimitReached();
  };

  const getNextResetDate = (): Date => {
    return planPermissionsService.getNextResetDate();
  };

  const getAvailablePlansForUpgrade = (): UserPlan[] => {
    return planPermissionsService.getAvailablePlansForUpgrade();
  };

  const changePlan = (planId: string): void => {
    planPermissionsService.setCurrentPlan(planId);
    refreshData();
    setShouldShowUpgrade(false);
    setShouldShowSupportModal(false);
  };

  const dismissUpgradeModal = (): void => {
    setShouldShowUpgrade(false);
  };

  const dismissSupportModal = (): void => {
    setShouldShowSupportModal(false);
  };

  // Funções específicas para verificar permissões
  const canEditMaterials = (): boolean => {
    return canPerformAction('canEditMaterials');
  };

  const canDownloadWord = (): boolean => {
    return canPerformAction('canDownloadWord');
  };

  const canDownloadPPT = (): boolean => {
    return canPerformAction('canDownloadPPT');
  };

  const canCreateSlides = (): boolean => {
    return canPerformAction('canCreateSlides');
  };

  const canCreateAssessments = (): boolean => {
    return canPerformAction('canCreateAssessments');
  };

  const hasCalendar = (): boolean => {
    const plan = currentPlan;
    
    // Para plano Professor, acesso normal
    if (plan.id === 'professor') {
      return canPerformAction('hasCalendar');
    }
    
    // Para plano Grupo Escolar, precisa ter acesso Professor
    if (plan.id === 'grupo-escolar') {
      return planPermissionsService.canAccessProfessorFeaturesWithSchoolPlan();
    }
    
    return false;
  };

  // Nova função para verificar se pode acessar a página do calendário (diferente de usar as funcionalidades)
  const canAccessCalendarPage = (): boolean => {
    // Todos os planos podem acessar a página do calendário
    // O bloqueio visual é feito dentro da própria página
    return true;
  };

  // Permissões específicas para páginas administrativas
  const canAccessSchool = (): boolean => {
    return currentPlan.id === 'grupo-escolar';
  };

  const canAccessSettings = (): boolean => {
    return planPermissionsService.isAdminAuthenticated();
  };

  // Novas permissões para plano Grupo Escolar
  const canAccessCreateMaterial = (): boolean => {
    const plan = currentPlan;
    
    // Plano gratuito e professor tem acesso normal
    if (plan.id === 'gratuito' || plan.id === 'professor') {
      return true;
    }
    
    // Plano grupo escolar precisa ter acesso professor
    if (plan.id === 'grupo-escolar') {
      return planPermissionsService.canAccessProfessorFeaturesWithSchoolPlan();
    }
    
    return false;
  };

  const canAccessMaterials = (): boolean => {
    const plan = currentPlan;
    
    // Plano gratuito e professor tem acesso normal
    if (plan.id === 'gratuito' || plan.id === 'professor') {
      return true;
    }
    
    // Plano grupo escolar precisa ter acesso professor
    if (plan.id === 'grupo-escolar') {
      return planPermissionsService.canAccessProfessorFeaturesWithSchoolPlan();
    }
    
    return false;
  };

  // Funções de administrador
  const isAdminAuthenticated = (): boolean => {
    return planPermissionsService.isAdminAuthenticated();
  };

  const authenticateAdmin = (email: string, password: string): boolean => {
    return planPermissionsService.authenticateAdmin(email, password);
  };

  const logoutAdmin = (): void => {
    planPermissionsService.logoutAdmin();
  };

  useEffect(() => {
    const plan = planPermissionsService.getCurrentPlan();
    
    if (planPermissionsService.isLimitReached()) {
      if (plan.id === 'professor') {
        setShouldShowSupportModal(true);
      } else if (plan.id === 'gratuito') {
        setShouldShowUpgrade(true);
      }
    }
  }, []);

  return {
    currentPlan,
    usage,
    shouldShowUpgrade,
    shouldShowSupportModal,
    createMaterial,
    canPerformAction,
    getRemainingMaterials,
    isLimitReached,
    getNextResetDate,
    getAvailablePlansForUpgrade,
    changePlan,
    dismissUpgradeModal,
    dismissSupportModal,
    refreshData,
    // Permissões específicas
    canEditMaterials,
    canDownloadWord,
    canDownloadPPT,
    canCreateSlides,
    canCreateAssessments,
    hasCalendar,
    canAccessCalendarPage, // Nova função para acesso à página
    canAccessSchool,
    canAccessSettings,
    // Novas permissões para Grupo Escolar
    canAccessCreateMaterial,
    canAccessMaterials,
    // Funções de administrador
    isAdminAuthenticated,
    authenticateAdmin,
    logoutAdmin
  };
};
