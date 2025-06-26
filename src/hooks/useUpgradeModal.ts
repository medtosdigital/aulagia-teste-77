
import { useState } from 'react';
import { usePlanPermissions } from './usePlanPermissions';

export const useUpgradeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const { canCreateMaterial, canDownloadFormat, canEditMaterials } = usePlanPermissions();

  const checkAndShowUpgradeModal = (action: 'create' | 'download' | 'edit', materialType?: string, format?: string) => {
    let shouldShow = false;
    let modalReason = '';

    switch (action) {
      case 'create':
        const createCheck = canCreateMaterial(materialType);
        if (!createCheck.allowed) {
          shouldShow = true;
          modalReason = createCheck.reason || 'Limite de criação atingido';
        }
        break;
      
      case 'download':
        if (format && !canDownloadFormat(format)) {
          shouldShow = true;
          modalReason = `Download em ${format.toUpperCase()} não disponível no seu plano atual`;
        }
        break;
      
      case 'edit':
        if (!canEditMaterials()) {
          shouldShow = true;
          modalReason = 'Edição de materiais não disponível no seu plano atual';
        }
        break;
    }

    if (shouldShow) {
      setReason(modalReason);
      setIsOpen(true);
      return false; // Bloqueia a ação
    }
    
    return true; // Permite a ação
  };

  const closeModal = () => {
    setIsOpen(false);
    setReason('');
  };

  return {
    isOpen,
    reason,
    checkAndShowUpgradeModal,
    closeModal
  };
};
