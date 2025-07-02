import { useState, useEffect } from 'react';

type PageType = 'dashboard' | 'create' | 'materials' | 'calendar';

export const usePageTutorial = (page: PageType) => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Verificar se o tutorial para esta página já foi visto
    const tutorialSeen = localStorage.getItem(`tutorial-${page}-seen`);
    const firstAccessCompleted = localStorage.getItem('firstAccessCompleted');
    
    // Mostrar tutorial apenas se:
    // 1. O primeiro acesso foi completado
    // 2. O tutorial desta página ainda não foi visto
    if (firstAccessCompleted && !tutorialSeen) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000); // Pequeno delay para a página carregar

      return () => clearTimeout(timer);
    }
  }, [page]);

  const closeTutorial = () => {
    // Marcar tutorial como visto
    localStorage.setItem(`tutorial-${page}-seen`, 'true');
    setShowTutorial(false);
  };

  const openTutorial = () => {
    setShowTutorial(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem(`tutorial-${page}-seen`);
    setShowTutorial(true);
  };

  return {
    showTutorial,
    closeTutorial,
    openTutorial,
    resetTutorial
  };
};
