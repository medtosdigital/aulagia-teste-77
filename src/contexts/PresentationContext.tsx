import React, { createContext, useContext, useState } from 'react';
import { GeneratedMaterial } from '@/services/materialService';

interface PresentationState {
  open: boolean;
  material: GeneratedMaterial | null;
}

interface PresentationContextType extends PresentationState {
  present: (material: GeneratedMaterial) => void;
  close: () => void;
}

const PresentationContext = createContext<PresentationContextType | undefined>(undefined);

export const PresentationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PresentationState>({ open: false, material: null });

  const present = (material: GeneratedMaterial) => {
    console.log('[PresentationContext] Ativando apresentação para material:', material);
    setState({ open: true, material });
  };
  const close = () => {
    console.log('[PresentationContext] Fechando apresentação');
    setState({ open: false, material: null });
  };

  return (
    <PresentationContext.Provider value={{ ...state, present, close }}>
      {children}
    </PresentationContext.Provider>
  );
};

export function usePresentation() {
  const ctx = useContext(PresentationContext);
  if (!ctx) throw new Error('usePresentation must be used within PresentationProvider');
  return ctx;
}

export { PresentationContext }; 