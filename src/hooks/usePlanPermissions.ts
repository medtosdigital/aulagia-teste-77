
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
    return canPerformAction('hasCalendar');
  };

  // Todos os planos podem acessar a página do calendário
  const canAccessCalendarPage = (): boolean => {
    return true;
  };

  // Permissões específicas para páginas administrativas
  const canAccessSchool = (): boolean => {
    return currentPlan.id === 'grupo-escolar';
  };

  const canAccessSettings = (): boolean => {
    return planPermissionsService.isAdminAuthenticated();
  };

  // Para plano Grupo Escolar, o acesso é sempre liberado
  const canAccessCreateMaterial = (): boolean => {
    const plan = currentPlan;
    
    // Plano grupo escolar tem acesso total
    if (plan.id === 'grupo-escolar') {
      return true;
    }
    
    // Plano gratuito e professor tem acesso normal
    if (plan.id === 'gratuito' || plan.id === 'professor') {
      return true;
    }
    
    return false;
  };

  const canAccessMaterials = (): boolean => {
    const plan = currentPlan;
    
    // Plano grupo escolar tem acesso total
    if (plan.id === 'grupo-escolar') {
      return true;
    }
    
    // Plano gratuito e professor tem acesso normal
    if (plan.id === 'gratuito' || plan.id === 'professor') {
      return true;
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

  // Novas funções para gerenciamento do plano Grupo Escolar
  const isSchoolOwner = (): boolean => {
    return planPermissionsService.isSchoolOwner();
  };

  const getRemainingMaterialsToDistribute = (): number => {
    return planPermissionsService.getRemainingMaterialsToDistribute();
  };

  const getTotalMaterialsUsedBySchool = (): number => {
    return planPermissionsService.getTotalMaterialsUsedBySchool();
  };

  const updateUserMaterialLimit = (userId: string, newLimit: number): boolean => {
    const success = planPermissionsService.updateUserMaterialLimit(userId, newLimit);
    if (success) {
      refreshData();
    }
    return success;
  };

  const redistributeMaterialLimits = (distribution: { [userId: string]: number }): boolean => {
    const success = planPermissionsService.redistributeMaterialLimits(distribution);
    if (success) {
      refreshData();
    }
    return success;
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
    canAccessCalendarPage,
    canAccessSchool,
    canAccessSettings,
    canAccessCreateMaterial,
    canAccessMaterials,
    // Funções de administrador
    isAdminAuthenticated,
    authenticateAdmin,
    logoutAdmin,
    // Novas funções para Grupo Escolar
    isSchoolOwner,
    getRemainingMaterialsToDistribute,
    getTotalMaterialsUsedBySchool,
    updateUserMaterialLimit,
    redistributeMaterialLimits
  };
};
