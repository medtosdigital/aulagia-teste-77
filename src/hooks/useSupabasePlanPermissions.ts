
import { useState, useEffect } from 'react';
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

  // Carregar dados do plano
  const loadPlanData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const plan = await supabasePlanService.getCurrentUserPlan();
      const remaining = await supabasePlanService.getRemainingMaterials();
      
      setCurrentPlan(plan);
      setRemainingMaterials(remaining);
    } catch (error) {
      console.error('Error loading plan data:', error);
      toast({
        title: "Erro ao carregar dados do plano",
        description: "Não foi possível carregar as informações do seu plano.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
        // Recarregar dados após criar material
        await loadPlanData();
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
      console.error('Error creating material:', error);
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
        await loadPlanData();
        setShouldShowUpgrade(false);
        toast({
          title: "Plano atualizado",
          description: `Seu plano foi alterado para ${newPlan}.`,
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
      console.error('Error changing plan:', error);
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
    if (!currentPlan) return 'Carregando...';
    
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

  // Carregar dados quando o usuário mudar
  useEffect(() => {
    loadPlanData();
  }, [user]);

  return {
    // Estado
    currentPlan,
    remainingMaterials,
    loading,
    shouldShowUpgrade,
    
    // Ações
    createMaterial,
    changePlan,
    dismissUpgradeModal,
    refreshData: loadPlanData,
    
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
    getPlanDisplayName
  };
};
