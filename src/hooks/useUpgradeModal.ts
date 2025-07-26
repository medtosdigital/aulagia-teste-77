
import { useState } from 'react';

interface UseUpgradeModalReturn {
  isUpgradeModalOpen: boolean;
  openUpgradeModal: (requiredPlan?: string) => void;
  closeUpgradeModal: () => void;
  requiredPlan: string | null;
}

export const useUpgradeModal = (): UseUpgradeModalReturn => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [requiredPlan, setRequiredPlan] = useState<string | null>(null);

  const openUpgradeModal = (requiredPlan?: string) => {
    setRequiredPlan(requiredPlan || null);
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setRequiredPlan(null);
  };

  return {
    isUpgradeModalOpen,
    openUpgradeModal,
    closeUpgradeModal,
    requiredPlan
  };
};
