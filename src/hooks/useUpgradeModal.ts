
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

  const handlePlanSelection = async (planId: string, billingType: 'mensal' | 'anual' = 'mensal') => {
    try {
      const success = await changePlan(planId, billingType); // Fixed: added billingType parameter
      
      if (success) {
        const planNames: Record<string, string> = {
          'professor': 'Professor',
          'grupo-escolar': 'Grupo Escolar'
        };
        
        toast({
          title: 'Plano atualizado com sucesso!',
          description: `Você agora tem o plano ${planNames[planId]}. Aproveite todos os recursos!`,
        });
        
        setIsOpen(false);
      } else {
        toast({
          title: 'Erro ao atualizar plano',
          description: 'Não foi possível alterar seu plano. Tente novamente.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao alterar o plano.',
        variant: 'destructive'
      });
    }
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
