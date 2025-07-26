
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { usePlanPermissions } from './usePlanPermissions';

export const useUpgradeModal = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth();
  const { currentPlan } = usePlanPermissions();

  const triggerUpgradeModal = (feature: string = 'premium') => {
    if (!user || currentPlan === 'gratuito') {
      setShowUpgradeModal(true);
    }
  };

  const closeUpgradeModal = () => {
    setShowUpgradeModal(false);
  };

  return {
    showUpgradeModal,
    triggerUpgradeModal,
    closeUpgradeModal
  };
};
