
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
    refreshData
  };
};
