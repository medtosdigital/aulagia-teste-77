
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserInfo {
  teachingLevel: string;
  grades: string[];
  subjects: string[];
  school: string;
  materialTypes: string[];
  name: string;
  celular: string;
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
  const { user } = useAuth();
  const [state, setState] = useState<FirstAccessState>({
    isFirstAccess: false,
    showModal: false,
    userInfo: null
  });

  useEffect(() => {
    const checkFirstAccess = async () => {
      if (!user?.id) return;

      try {
        // Verificar se já existe perfil completo no Supabase
        const { data: profile, error } = await supabase
          .from('perfis')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Perfil não encontrado, é primeiro acesso
          setState({
            isFirstAccess: true,
            showModal: true,
            userInfo: null
          });
        } else if (profile) {
          // Verificar se é realmente primeiro acesso (sem dados pessoais preenchidos)
          const isReallyFirstAccess = !profile.nome_preferido && 
                                     !profile.celular && 
                                     (!profile.etapas_ensino || profile.etapas_ensino.length === 0);
          
          if (isReallyFirstAccess) {
            setState({
              isFirstAccess: true,
              showModal: true,
              userInfo: null
            });
          } else {
            // Perfil existe e está completo, não é primeiro acesso
            setState({
              isFirstAccess: false,
              showModal: false,
              userInfo: {
                name: profile.nome_preferido || profile.full_name || 'Professor(a)',
                teachingLevel: profile.etapas_ensino?.[0] || '',
                grades: profile.anos_serie || [],
                subjects: profile.disciplinas || [],
                school: profile.escola || '',
                materialTypes: profile.tipo_material_favorito || [],
                celular: profile.celular || ''
              }
            });
          }
        }
      } catch (error) {
        console.error('Error checking first access:', error);
        // Em caso de erro, assumir que é primeiro acesso
        setState({
          isFirstAccess: true,
          showModal: true,
          userInfo: null
        });
      }
    };

    checkFirstAccess();
  }, [user]);

  const completeFirstAccess = async (userInfo: UserInfo) => {
    if (!user?.id) return;

    try {
      // Salvar perfil completo no Supabase
      const profileData = {
        user_id: user.id,
        nome_preferido: userInfo.name,
        etapas_ensino: userInfo.teachingLevel ? [userInfo.teachingLevel] : [],
        anos_serie: userInfo.grades,
        disciplinas: userInfo.subjects,
        tipo_material_favorito: userInfo.materialTypes,
        preferencia_bncc: false,
        celular: userInfo.celular,
        escola: userInfo.school,
        // Garantir que o plano seja gratuito e billing seja monthly
        plano_ativo: 'gratuito',
        billing_type: 'monthly'
      };

      const { error } = await supabase
        .from('perfis')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving profile:', error);
        throw error;
      }

      // Atualizar estado
      setState({
        isFirstAccess: false,
        showModal: false,
        userInfo
      });

      console.log('✅ First access completed with user info:', userInfo);

      // Disparar evento para atualizar outras partes da aplicação
      window.dispatchEvent(new CustomEvent('profileUpdated'));

    } catch (error) {
      console.error('Error completing first access:', error);
      throw error;
    }
  };

  const resetFirstAccess = async () => {
    if (!user?.id) return;

    try {
      // Limpar dados específicos do perfil (mantendo plano e billing)
      await supabase
        .from('perfis')
        .update({
          nome_preferido: null,
          etapas_ensino: null,
          anos_serie: null,
          disciplinas: null,
          tipo_material_favorito: null,
          celular: null,
          escola: null
        })
        .eq('user_id', user.id);

      setState({
        isFirstAccess: true,
        showModal: true,
        userInfo: null
      });
    } catch (error) {
      console.error('Error resetting first access:', error);
      setState({
        isFirstAccess: true,
        showModal: true,
        userInfo: null
      });
    }
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
