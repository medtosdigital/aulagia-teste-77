
import { useState, useEffect } from 'react';
import { planPermissionsService, UserPlan, UserUsage } from '@/services/planPermissionsService';

export const usePlanPermissions = () => {
  const [currentPlan, setCurrentPlan] = useState<UserPlan>(planPermissionsService.getCurrentPlan());
  const [usage, setUsage] = useState<UserUsage>(planPermissionsService.getUserUsage());
  const [shouldShowUpgrade, setShouldShowUpgrade] = useState(false);

  const refreshData = () => {
    setCurrentPlan(planPermissionsService.getCurrentPlan());
    setUsage(planPermissionsService.getUserUsage());
  };

  const createMaterial = (): boolean => {
    const canCreate = planPermissionsService.incrementMaterialUsage();
    
    if (!canCreate) {
      setShouldShowUpgrade(true);
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
  };

  const dismissUpgradeModal = (): void => {
    setShouldShowUpgrade(false);
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

  const canAccessSchool = (): boolean => {
    return currentPlan.id === 'grupo-escolar';
  };

  const canAccessSettings = (): boolean => {
    return currentPlan.id === 'grupo-escolar';
  };

  useEffect(() => {
    // Check if limit is reached on component mount
    if (planPermissionsService.isLimitReached() && currentPlan.id === 'gratuito') {
      setShouldShowUpgrade(true);
    }
  }, [currentPlan.id]);

  return {
    currentPlan,
    usage,
    shouldShowUpgrade,
    createMaterial,
    canPerformAction,
    getRemainingMaterials,
    isLimitReached,
    getNextResetDate,
    getAvailablePlansForUpgrade,
    changePlan,
    dismissUpgradeModal,
    refreshData,
    // Permissões específicas
    canEditMaterials,
    canDownloadWord,
    canDownloadPPT,
    canCreateSlides,
    canCreateAssessments,
    hasCalendar,
    canAccessSchool,
    canAccessSettings
  };
};
