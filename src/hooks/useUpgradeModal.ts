
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { usePlanPermissions } from './usePlanPermissions';

export const useUpgradeModal = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth();
  const { currentPlan } = usePlanPermissions();

  const triggerUpgradeModal = (feature: string = 'premium') => {
    if (!user || currentPlan.id === 'gratuito') {
      setShowUpgradeModal(true);
    }
  };

  const closeUpgradeModal = () => {
    setShowUpgradeModal(false);
  };

  const handlePlanSelection = async (planId: string, billingType: 'monthly' | 'yearly') => {
    // This would handle plan selection logic
    console.log('Plan selected:', planId, billingType);
    setShowUpgradeModal(false);
  };

  // Mock available plans
  const availablePlans = [
    { id: 'professor', name: 'Professor', price: { monthly: 29.90, yearly: 299 } },
    { id: 'grupo-escolar', name: 'Grupo Escolar', price: { monthly: 89.90, yearly: 849 } }
  ];

  return {
    showUpgradeModal,
    isOpen: showUpgradeModal, // Alias for compatibility
    triggerUpgradeModal,
    closeUpgradeModal,
    closeModal: closeUpgradeModal, // Alias for compatibility
    openModal: () => setShowUpgradeModal(true), // New method for compatibility
    handlePlanSelection,
    currentPlan,
    availablePlans
  };
};
