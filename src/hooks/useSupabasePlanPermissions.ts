
import { useState, useEffect, useCallback } from 'react';
import { supabasePlanService, TipoPlano, PlanoUsuario } from '@/services/supabasePlanService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSupabasePlanPermissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<PlanoUsuario | null>(null);
  const [remainingMaterials, setRemainingMaterials] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [shouldShowUpgrade, setShouldShowUpgrade] = useState(false);

  // Função de carregamento dos dados do plano
  const loadPlanData = useCallback(async () => {
    if (!user) {
      console.log('Nenhum usuário autenticado, definindo valores padrão');
      setCurrentPlan(null);
      setRemainingMaterials(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Carregando dados do plano para usuário:', user.id);
      
      // Carregar plano e materiais restantes em paralelo
      const [plan, remaining] = await Promise.all([
        supabasePlanService.getCurrentUserPlan(),
        supabasePlanService.getRemainingMaterials()
      ]);
      
      console.log('Plano carregado:', plan);
      console.log('Materiais restantes:', remaining);
      
      if (plan) {
        setCurrentPlan(plan);
        setRemainingMaterials(remaining);
      } else {
        // Se não conseguiu carregar o plano, definir valores padrão
        console.log('Nenhum plano encontrado, definindo plano gratuito como padrão');
        setCurrentPlan({
          id: 'default',
          user_id: user.id,
          plano_ativo: 'gratuito',
          data_inicio: new Date().toISOString(),
          data_expiracao: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setRemainingMaterials(5); // Limite do plano gratuito
      }
    } catch (error) {
      console.error('Erro ao carregar dados do plano:', error);
      
      // Em caso de erro, definir plano gratuito como padrão
      setCurrentPlan({
        id: 'error-fallback',
        user_id: user.id,
        plano_ativo: 'gratuito',
        data_inicio: new Date().toISOString(),
        data_expiracao: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setRemainingMaterials(5);
      
      toast({
        title: "Erro ao carregar dados do plano",
        description: "Usando configurações padrão do plano gratuito.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Carregar dados quando o usuário mudar
  useEffect(() => {
    loadPlanData();
  }, [loadPlanData]);

  // Criar material (verifica permissões e incrementa uso)
  const createMaterial = async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para criar materiais.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const canCreate = await supabasePlanService.canCreateMaterial();
      
      if (!canCreate) {
        setShouldShowUpgrade(true);
        return false;
      }

      const success = await supabasePlanService.incrementMaterialUsage();
      
      if (success) {
        // Recarregar apenas os materiais restantes
        const newRemaining = await supabasePlanService.getRemainingMaterials();
        setRemainingMaterials(newRemaining);
        return true;
      } else {
        toast({
          title: "Erro ao criar material",
          description: "Não foi possível registrar a criação do material.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao criar material:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar criar o material.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Atualizar plano
  const changePlan = async (newPlan: TipoPlano, expirationDate?: Date): Promise<boolean> => {
    try {
      const success = await supabasePlanService.updateUserPlan(newPlan, expirationDate);
      
      if (success) {
        // Recarregar dados após mudança de plano
        await loadPlanData();
        setShouldShowUpgrade(false);
        
        const planNames: Record<TipoPlano, string> = {
          'gratuito': 'Gratuito',
          'professor': 'Professor',
          'grupo_escolar': 'Grupo Escolar'
        };
        
        toast({
          title: "Plano atualizado",
          description: `Seu plano foi alterado para ${planNames[newPlan]}.`,
        });
        return true;
      } else {
        toast({
          title: "Erro ao atualizar plano",
          description: "Não foi possível alterar seu plano.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao alterar plano:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao alterar o plano.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Verificar permissões específicas baseadas no plano
  const canDownloadWord = (): boolean => {
    if (!currentPlan) return false;
    return currentPlan.plano_ativo !== 'gratuito';
  };

  const canDownloadPPT = (): boolean => {
    if (!currentPlan) return false;
    return currentPlan.plano_ativo !== 'gratuito';
  };

  const canEditMaterials = (): boolean => {
    if (!currentPlan) return false;
    return currentPlan.plano_ativo !== 'gratuito';
  };

  const canCreateSlides = (): boolean => {
    if (!currentPlan) return false;
    return currentPlan.plano_ativo !== 'gratuito';
  };

  const canCreateAssessments = (): boolean => {
    if (!currentPlan) return false;
    return currentPlan.plano_ativo !== 'gratuito';
  };

  const hasCalendar = (): boolean => {
    if (!currentPlan) return false;
    return currentPlan.plano_ativo !== 'gratuito';
  };

  const canAccessSchool = (): boolean => {
    if (!currentPlan) return false;
    return currentPlan.plano_ativo === 'grupo_escolar';
  };

  const canAccessCreateMaterial = (): boolean => {
    return !!user; // Todos os usuários logados podem tentar criar
  };

  const canAccessMaterials = (): boolean => {
    return !!user; // Todos os usuários logados podem ver materiais
  };

  const canAccessCalendarPage = (): boolean => {
    return !!user; // Todos podem acessar a página do calendário
  };

  const isLimitReached = (): boolean => {
    return remainingMaterials <= 0;
  };

  const getPlanDisplayName = (): string => {
    if (loading) return 'Carregando...';
    if (!currentPlan) return 'Plano Gratuito';
    
    switch (currentPlan.plano_ativo) {
      case 'gratuito':
        return 'Plano Gratuito';
      case 'professor':
        return 'Plano Professor';
      case 'grupo_escolar':
        return 'Grupo Escolar';
      default:
        return 'Plano Desconhecido';
    }
  };

  const dismissUpgradeModal = (): void => {
    setShouldShowUpgrade(false);
  };

  // Função de refresh que pode ser chamada externamente
  const refreshData = useCallback(() => {
    if (user) {
      loadPlanData();
    }
  }, [user, loadPlanData]);

  // Funções administrativas e de suporte que estavam faltando
  const canAccessSettings = (): boolean => {
    // Por enquanto, retornar false - implementar lógica admin depois se necessário
    return false;
  };

  const shouldShowSupportModal = false; // Desabilitado por enquanto

  const dismissSupportModal = (): void => {
    // Função vazia por enquanto
  };

  const getNextResetDate = (): Date => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    return nextMonth;
  };

  const isAdminAuthenticated = (): boolean => {
    // Por enquanto, retornar false - implementar lógica admin depois se necessário
    return false;
  };

  return {
    // Estado
    currentPlan,
    remainingMaterials,
    loading,
    shouldShowUpgrade,
    shouldShowSupportModal,
    
    // Ações
    createMaterial,
    changePlan,
    dismissUpgradeModal,
    dismissSupportModal,
    refreshData,
    
    // Verificações de permissões
    canDownloadWord,
    canDownloadPPT,
    canEditMaterials,
    canCreateSlides,
    canCreateAssessments,
    hasCalendar,
    canAccessSchool,
    canAccessCreateMaterial,
    canAccessMaterials,
    canAccessCalendarPage,
    isLimitReached,
    
    // Utilitários
    getPlanDisplayName,
    canAccessSettings,
    getNextResetDate,
    isAdminAuthenticated
  };
};
