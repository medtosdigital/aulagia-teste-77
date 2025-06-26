
import { useState, useEffect } from 'react';

interface FeedbackState {
  materialsCreated: number;
  showFeedbackModal: boolean;
  dontShowAgain: boolean;
  lastShownAt: string | null;
}

export const useFeedback = () => {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    materialsCreated: 0,
    showFeedbackModal: false,
    dontShowAgain: false,
    lastShownAt: null
  });

  // Carregar estado do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('feedbackState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setFeedbackState(parsed);
      } catch (error) {
        console.error('Error loading feedback state:', error);
      }
    }
  }, []);

  // Salvar estado no localStorage
  const saveFeedbackState = (newState: Partial<FeedbackState>) => {
    const updatedState = { ...feedbackState, ...newState };
    setFeedbackState(updatedState);
    localStorage.setItem('feedbackState', JSON.stringify(updatedState));
  };

  // Incrementar contador de materiais criados
  const incrementMaterialsCreated = () => {
    const newCount = feedbackState.materialsCreated + 1;
    console.log('📊 Materials created count:', newCount);
    
    saveFeedbackState({ materialsCreated: newCount });
    
    // Verificar se deve mostrar o modal (a cada 3 materiais se não foi marcado para não mostrar)
    if (!feedbackState.dontShowAgain && newCount % 3 === 0) {
      const shouldShow = checkShouldShowModal();
      console.log('🔔 Should show feedback modal:', shouldShow);
      
      if (shouldShow) {
        saveFeedbackState({ showFeedbackModal: true });
      }
    }
  };

  // Verificar se deve mostrar o modal baseado no tempo
  const checkShouldShowModal = (): boolean => {
    if (feedbackState.dontShowAgain) return false;
    
    // Se nunca foi mostrado, mostrar
    if (!feedbackState.lastShownAt) return true;
    
    // Mostrar novamente após 7 dias
    const lastShown = new Date(feedbackState.lastShownAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastShown.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff >= 7;
  };

  // Abrir modal manualmente (botão ?)
  const openFeedbackModal = () => {
    console.log('🔔 Opening feedback modal manually');
    saveFeedbackState({ showFeedbackModal: true });
  };

  // Fechar modal
  const closeFeedbackModal = () => {
    console.log('❌ Closing feedback modal');
    saveFeedbackState({ 
      showFeedbackModal: false,
      lastShownAt: new Date().toISOString()
    });
  };

  // Marcar para não mostrar novamente
  const dontShowAgain = () => {
    console.log('🚫 User selected dont show again');
    saveFeedbackState({ 
      showFeedbackModal: false,
      dontShowAgain: true,
      lastShownAt: new Date().toISOString()
    });
  };

  // Resetar configurações (para desenvolvimento/testes)
  const resetFeedbackSettings = () => {
    console.log('🔄 Resetting feedback settings');
    const resetState: FeedbackState = {
      materialsCreated: 0,
      showFeedbackModal: false,
      dontShowAgain: false,
      lastShownAt: null
    };
    setFeedbackState(resetState);
    localStorage.setItem('feedbackState', JSON.stringify(resetState));
  };

  return {
    ...feedbackState,
    incrementMaterialsCreated,
    openFeedbackModal,
    closeFeedbackModal,
    dontShowAgain,
    resetFeedbackSettings
  };
};
