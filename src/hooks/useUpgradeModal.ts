
import { useState } from 'react';
import { usePlanPermissions } from './usePlanPermissions';
import { useToast } from './use-toast';

export const useUpgradeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    shouldShowUpgrade, 
    currentPlan, 
    getAvailablePlansForUpgrade,
    changePlan,
    dismissUpgradeModal 
  } = usePlanPermissions();
  const { toast } = useToast();

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    dismissUpgradeModal();
  };

  const handlePlanSelection = (planId: string) => {
    changePlan(planId);
    
    const planNames: Record<string, string> = {
      'professor': 'Professor',
      'grupo-escolar': 'Grupo Escolar'
    };
    
    toast({
      title: 'Plano atualizado com sucesso!',
      description: `Você agora tem o plano ${planNames[planId]}. Aproveite todos os recursos!`,
    });
    
    setIsOpen(false);
  };

  return {
    isOpen: isOpen || shouldShowUpgrade,
    openModal,
    closeModal,
    handlePlanSelection,
    currentPlan,
    availablePlans: getAvailablePlansForUpgrade()
  };
};
