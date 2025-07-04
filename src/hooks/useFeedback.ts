import { useState, useEffect, useRef } from 'react';

interface FeedbackState {
  materialsCreated: number;
  showFeedbackModal: boolean;
  dontShowAgain: boolean;
  lastShownDate: string | null; // Mudança: armazenar apenas a data (YYYY-MM-DD)
}

// Helper para saber se o plano deve mostrar feedback
const isFeedbackEligiblePlan = (plano: string) => ['gratuito', 'professor', 'grupo_escolar'].includes(plano);

export const useFeedback = (planoAtivo: string, isFirstAccess: boolean) => {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    materialsCreated: 0,
    showFeedbackModal: false,
    dontShowAgain: false,
    lastShownDate: null
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    if (feedbackState.dontShowAgain) return false;
    const today = new Date().toISOString().split('T')[0];
    if (!feedbackState.lastShownDate) return true;
    return feedbackState.lastShownDate !== today;
  };

  // Incrementar contador de materiais criados
  const incrementMaterialsCreated = () => {
    if (!isFeedbackEligiblePlan(planoAtivo)) return;
    const newCount = feedbackState.materialsCreated + 1;
    saveFeedbackState({ materialsCreated: newCount });
    if (!feedbackState.dontShowAgain && newCount % 3 === 0) {
      if (shouldShowTodayModal()) {
        saveFeedbackState({ showFeedbackModal: true });
      }
    }
  };

  // Abrir modal manualmente (botão ?)
  const openFeedbackModal = () => {
    saveFeedbackState({ showFeedbackModal: true });
  };

  // Fechar modal
  const closeFeedbackModal = () => {
    const today = new Date().toISOString().split('T')[0];
    saveFeedbackState({ showFeedbackModal: false, lastShownDate: today });
  };

  // Marcar para não mostrar novamente
  const dontShowAgain = () => {
    const today = new Date().toISOString().split('T')[0];
    saveFeedbackState({ showFeedbackModal: false, dontShowAgain: true, lastShownDate: today });
  };

  // Resetar configurações (para desenvolvimento/testes)
  const resetFeedbackSettings = () => {
    const resetState: FeedbackState = {
      materialsCreated: 0,
      showFeedbackModal: false,
      dontShowAgain: false,
      lastShownDate: null
    };
    setFeedbackState(resetState);
    localStorage.setItem('feedbackState', JSON.stringify(resetState));
  };

  // Limpar timer ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Novo: escutar evento para abrir modal manualmente
  useEffect(() => {
    const handleFeedbackModalUpdated = () => {
      const savedState = localStorage.getItem('feedbackState');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setFeedbackState(parsed);
        } catch (error) {
          console.error('Erro ao atualizar feedbackState:', error);
        }
      }
    };
    window.addEventListener('feedbackModalUpdated', handleFeedbackModalUpdated);
    return () => {
      window.removeEventListener('feedbackModalUpdated', handleFeedbackModalUpdated);
    };
  }, []);

  return {
    ...feedbackState,
    incrementMaterialsCreated,
    openFeedbackModal,
    closeFeedbackModal,
    dontShowAgain,
    resetFeedbackSettings
  };
};
