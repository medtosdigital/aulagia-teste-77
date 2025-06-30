
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabasePlanService, TipoPlano, PlanoUsuario } from '@/services/supabasePlanService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSupabasePlanPermissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<PlanoUsuario | null>(null);
  const [remainingMaterials, setRemainingMaterials] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [shouldShowUpgrade, setShouldShowUpgrade] = useState(false);
  const loadingRef = useRef(false);
  const dataLoadedRef = useRef(false);

  // Função super otimizada de carregamento
  const loadPlanData = useCallback(async (forceReload = false) => {
    if (!user?.id) {
      setCurrentPlan(null);
      setRemainingMaterials(0);
      setLoading(false);
      dataLoadedRef.current = true;
      return;
    }

    // Se já carregou e não é force reload, não fazer nada
    if (dataLoadedRef.current && !forceReload) {
      return;
    }

    // Evitar múltiplas consultas simultâneas
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setLoading(true);
      
      // Carregar dados em paralelo com timeout agressivo
      const loadPromise = Promise.all([
        supabasePlanService.getCurrentUserPlan(),
        supabasePlanService.getRemainingMaterials()
      ]);

      // Timeout de 5 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const [plan, remaining] = await Promise.race([loadPromise, timeoutPromise]) as [PlanoUsuario | null, number];
      
      let finalPlan = plan;
      let finalRemaining = remaining;

      if (!plan) {
        // Plano padrão super rápido
        finalPlan = {
          id: 'default',
          user_id: user.id,
          plano_ativo: 'gratuito',
          data_inicio: new Date().toISOString(),
          data_expiracao: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        finalRemaining = 5;
      }

      setCurrentPlan(finalPlan);
      setRemainingMaterials(finalRemaining);
      dataLoadedRef.current = true;

    } catch (error) {
      console.error('Erro ao carregar dados do plano (usando fallback rápido):', error);
      
      // Fallback instantâneo
      const fallbackPlan = {
        id: 'error-fallback',
        user_id: user.id,
        plano_ativo: 'gratuito' as TipoPlano,
        data_inicio: new Date().toISOString(),
        data_expiracao: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setCurrentPlan(fallbackPlan);
      setRemainingMaterials(5);
      dataLoadedRef.current = true;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [user]);

  // Carregar dados apenas uma vez
  useEffect(() => {
    if (user?.id && !dataLoadedRef.current) {
      loadPlanData();
      
      // Pré-carregar dados em background
      supabasePlanService.preloadCriticalData();
    }
  }, [user?.id, loadPlanData]);

  // Criar material super otimizado
  const createMaterial = useCallback(async (): Promise<boolean> => {
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
        // Atualizar estado local imediatamente para responsividade
        setRemainingMaterials(prev => Math.max(0, prev - 1));
        
        // Atualizar dados reais em background
        supabasePlanService.getRemainingMaterials().then(setRemainingMaterials).catch(console.error);
        
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
  }, [user, toast]);

  // Atualizar plano otimizado
  const changePlan = useCallback(async (newPlan: TipoPlano, expirationDate?: Date): Promise<boolean> => {
    try {
      const success = await supabasePlanService.updateUserPlan(newPlan, expirationDate);
      
      if (success) {
        // Atualizar estado local imediatamente
        if (currentPlan) {
          setCurrentPlan(prev => prev ? { ...prev, plano_ativo: newPlan } : null);
        }
        
        // Recarregar dados em background
        setTimeout(() => loadPlanData(true), 100);
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
  }, [currentPlan, loadPlanData, toast]);

  // Verificações de permissões super rápidas (usando apenas estado local)
  const canDownloadWord = useCallback((): boolean => {
    return currentPlan?.plano_ativo !== 'gratuito';
  }, [currentPlan?.plano_ativo]);

  const canDownloadPPT = useCallback((): boolean => {
    return currentPlan?.plano_ativo !== 'gratuito';
  }, [currentPlan?.plano_ativo]);

  const canEditMaterials = useCallback((): boolean => {
    return currentPlan?.plano_ativo !== 'gratuito';
  }, [currentPlan?.plano_ativo]);

  const canCreateSlides = useCallback((): boolean => {
    return currentPlan?.plano_ativo !== 'gratuito';
  }, [currentPlan?.plano_ativo]);

  const canCreateAssessments = useCallback((): boolean => {
    return currentPlan?.plano_ativo !== 'gratuito';
  }, [currentPlan?.plano_ativo]);

  const hasCalendar = useCallback((): boolean => {
    return currentPlan?.plano_ativo !== 'gratuito';
  }, [currentPlan?.plano_ativo]);

  const canAccessSchool = useCallback((): boolean => {
    return currentPlan?.plano_ativo === 'grupo_escolar';
  }, [currentPlan?.plano_ativo]);

  const canAccessCreateMaterial = useCallback((): boolean => {
    return !!user;
  }, [user]);

  const canAccessMaterials = useCallback((): boolean => {
    return !!user;
  }, [user]);

  const canAccessCalendarPage = useCallback((): boolean => {
    return !!user;
  }, [user]);

  const isLimitReached = useCallback((): boolean => {
    return remainingMaterials <= 0;
  }, [remainingMaterials]);

  const getPlanDisplayName = useCallback((): string => {
    if (loading && !currentPlan) return 'Carregando...';
    if (!currentPlan) return 'Plano Gratuito';
    
    switch (currentPlan.plano_ativo) {
      case 'gratuito':
        return 'Plano Gratuito';
      case 'professor':
        return 'Plano Professor';
      case 'grupo_escolar':
        return 'Grupo Escolar';
      default:
        return 'Plano Gratuito';
    }
  }, [loading, currentPlan]);

  const dismissUpgradeModal = useCallback((): void => {
    setShouldShowUpgrade(false);
  }, []);

  // Função de refresh super otimizada
  const refreshData = useCallback(() => {
    if (user?.id) {
      dataLoadedRef.current = false;
      supabasePlanService.clearCache(user.id);
      loadPlanData(true);
    }
  }, [user?.id, loadPlanData]);

  // Funções auxiliares otimizadas
  const canAccessSettings = useCallback((): boolean => {
    return false;
  }, []);

  const getNextResetDate = useCallback((): Date => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    return nextMonth;
  }, []);

  const isAdminAuthenticated = useCallback((): boolean => {
    return false;
  }, []);

  return {
    // Estado
    currentPlan,
    remainingMaterials,
    loading: loading && !dataLoadedRef.current, // Mostrar loading apenas se não tiver dados
    shouldShowUpgrade,
    shouldShowSupportModal: false,
    
    // Ações
    createMaterial,
    changePlan,
    dismissUpgradeModal,
    dismissSupportModal: () => {},
    refreshData,
    
    // Verificações de permissões (todas super rápidas)
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
