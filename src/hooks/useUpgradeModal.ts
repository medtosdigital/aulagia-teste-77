
import { useState } from 'react';
import { useActivityTracker } from './useActivityTracker';

export const useUpgradeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  const { trackActivity } = useActivityTracker();

  const openModal = (upgradeReason: string) => {
    setReason(upgradeReason);
    setIsOpen(true);
    
    // Track modal opening with proper parameters
    trackActivity('created', { // Primeiro parâmetro: tipo da atividade
      type: 'upgrade_modal', // Segundo parâmetro: objeto com detalhes
      title: 'Modal de upgrade aberto',
      description: `Motivo: ${upgradeReason}`,
      grade: '',
      subject: ''
    });
  };

  const closeModal = () => {
    setIsOpen(false);
    setReason('');
  };

  return {
    isOpen,
    reason,
    openModal,
    closeModal
  };
};
