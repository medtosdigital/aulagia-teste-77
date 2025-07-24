
import { useState } from 'react';

export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState<string>('');

  const openModal = (featureName: string, description?: string) => {
    setFeature(featureName);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setFeature('');
  };

  return {
    isOpen,
    feature,
    openModal,
    closeModal
  };
}
