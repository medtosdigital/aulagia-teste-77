
import { useState, useEffect } from 'react';

interface UserInfo {
  teachingLevel: string;
  grades: string[];
  subjects: string[];
  school: string;
  materialTypes: string[];
  name: string;
  educationalInfo?: {
    teachingLevel: string;
    grades: string[];
    subjects: string[];
    school: string;
    materialTypes: string[];
  };
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

    // Integrar as informações com o perfil do usuário
    const profileInfo = {
      name: userInfo.name || 'Professor(a)',
      teachingLevel: userInfo.teachingLevel,
      grades: userInfo.grades || [],
      subjects: userInfo.subjects || [],
      school: userInfo.school,
      materialTypes: userInfo.materialTypes || [],
      photo: '',
      completedAt: new Date().toISOString()
    };

    // Salvar perfil integrado
    localStorage.setItem('userProfile', JSON.stringify(profileInfo));

    // Atualizar estado
    setState({
      isFirstAccess: false,
      showModal: false,
      userInfo
    });

    console.log('✅ First access completed with integrated user info:', profileInfo);

    // Disparar evento para atualizar outras partes da aplicação
    window.dispatchEvent(new CustomEvent('profileUpdated'));
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

  const openModal = () => {
    setState(prev => ({ ...prev, showModal: true }));
  };

  return {
    isFirstAccess: state.isFirstAccess,
    showModal: state.showModal,
    userInfo: state.userInfo,
    completeFirstAccess,
    resetFirstAccess,
    openModal,
    closeModal: () => setState(prev => ({ ...prev, showModal: false }))
  };
};
