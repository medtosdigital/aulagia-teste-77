
import { useState, useEffect } from 'react';

interface UserInfo {
  grade: string;
  subject: string;
  school: string;
  materialTypes: string[];
}

interface FirstAccessState {
  isFirstAccess: boolean;
  showModal: boolean;
  userInfo: UserInfo | null;
}

export const useFirstAccess = () => {
  const [state, setState] = useState<FirstAccessState>({
    isFirstAccess: false,
    showModal: false,
    userInfo: null
  });

  useEffect(() => {
    // Verificar se é o primeiro acesso
    const hasCompletedFirstAccess = localStorage.getItem('firstAccessCompleted');
    const storedUserInfo = localStorage.getItem('userFirstAccessInfo');

    if (!hasCompletedFirstAccess) {
      setState({
        isFirstAccess: true,
        showModal: true,
        userInfo: null
      });
    } else if (storedUserInfo) {
      setState({
        isFirstAccess: false,
        showModal: false,
        userInfo: JSON.parse(storedUserInfo)
      });
    }
  }, []);

  const completeFirstAccess = (userInfo: UserInfo) => {
    // Salvar informações no localStorage
    localStorage.setItem('firstAccessCompleted', 'true');
    localStorage.setItem('userFirstAccessInfo', JSON.stringify(userInfo));

    // Atualizar também as informações do perfil
    const profileInfo = {
      educationalInfo: {
        grade: userInfo.grade,
        subject: userInfo.subject,
        school: userInfo.school,
        preferredMaterials: userInfo.materialTypes
      },
      completedAt: new Date().toISOString()
    };

    localStorage.setItem('userProfile', JSON.stringify(profileInfo));

    // Atualizar estado
    setState({
      isFirstAccess: false,
      showModal: false,
      userInfo
    });

    console.log('✅ First access completed with user info:', userInfo);
  };

  const resetFirstAccess = () => {
    localStorage.removeItem('firstAccessCompleted');
    localStorage.removeItem('userFirstAccessInfo');
    localStorage.removeItem('userProfile');
    
    setState({
      isFirstAccess: true,
      showModal: true,
      userInfo: null
    });
  };

  return {
    isFirstAccess: state.isFirstAccess,
    showModal: state.showModal,
    userInfo: state.userInfo,
    completeFirstAccess,
    resetFirstAccess,
    closeModal: () => setState(prev => ({ ...prev, showModal: false }))
  };
};
