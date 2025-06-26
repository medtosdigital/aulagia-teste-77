
import { useState, useEffect } from 'react';

interface FeedbackState {
  materialsCreated: number;
  showFeedbackModal: boolean;
  dontShowAgain: boolean;
  lastShownDate: string | null; // Mudança: armazenar apenas a data (YYYY-MM-DD)
}

export const useFeedback = () => {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    materialsCreated: 0,
    showFeedbackModal: false,
    dontShowAgain: false,
    lastShownDate: null
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

  // Verificar se deve mostrar o modal baseado na data
  const shouldShowTodayModal = (): boolean => {
    if (feedbackState.dontShowAgain) {
      console.log('🚫 Modal disabled by user preference');
      return false;
    }
    
    const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Se nunca foi mostrado, mostrar
    if (!feedbackState.lastShownDate) {
      console.log('🔔 First time showing modal');
      return true;
    }
    
    // Se a última exibição foi em um dia diferente de hoje, mostrar
    const canShowToday = feedbackState.lastShownDate !== today;
    console.log('📅 Last shown:', feedbackState.lastShownDate, '| Today:', today, '| Can show:', canShowToday);
    
    return canShowToday;
  };

  // Incrementar contador de materiais criados
  const incrementMaterialsCreated = () => {
    const newCount = feedbackState.materialsCreated + 1;
    console.log('📊 Materials created count:', newCount);
    
    saveFeedbackState({ materialsCreated: newCount });
    
    // Verificar se deve mostrar o modal (a cada 3 materiais se não foi marcado para não mostrar)
    if (!feedbackState.dontShowAgain && newCount % 3 === 0) {
      const shouldShow = shouldShowTodayModal();
      console.log('🔔 Should show feedback modal:', shouldShow);
      
      if (shouldShow) {
        saveFeedbackState({ showFeedbackModal: true });
      }
    }
  };

  // Verificar e mostrar modal no login (uma vez por dia)
  const checkDailyModal = () => {
    console.log('🔍 Checking daily modal on login');
    
    if (shouldShowTodayModal()) {
      console.log('✅ Showing daily modal');
      saveFeedbackState({ showFeedbackModal: true });
    } else {
      console.log('❌ Daily modal already shown or disabled');
    }
  };

  // Abrir modal manualmente (botão ?)
  const openFeedbackModal = () => {
    console.log('🔔 Opening feedback modal manually');
    saveFeedbackState({ showFeedbackModal: true });
  };

  // Fechar modal
  const closeFeedbackModal = () => {
    console.log('❌ Closing feedback modal');
    const today = new Date().toISOString().split('T')[0];
    saveFeedbackState({ 
      showFeedbackModal: false,
      lastShownDate: today // Marcar que foi mostrado hoje
    });
  };

  // Marcar para não mostrar novamente
  const dontShowAgain = () => {
    console.log('🚫 User selected dont show again');
    const today = new Date().toISOString().split('T')[0];
    saveFeedbackState({ 
      showFeedbackModal: false,
      dontShowAgain: true,
      lastShownDate: today
    });
  };

  // Resetar configurações (para desenvolvimento/testes)
  const resetFeedbackSettings = () => {
    console.log('🔄 Resetting feedback settings');
    const resetState: FeedbackState = {
      materialsCreated: 0,
      showFeedbackModal: false,
      dontShowAgain: false,
      lastShownDate: null
    };
    setFeedbackState(resetState);
    localStorage.setItem('feedbackState', JSON.stringify(resetState));
  };

  return {
    ...feedbackState,
    incrementMaterialsCreated,
    checkDailyModal,
    openFeedbackModal,
    closeFeedbackModal,
    dontShowAgain,
    resetFeedbackSettings
  };
};
