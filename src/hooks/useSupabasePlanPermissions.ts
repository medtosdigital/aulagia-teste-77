import { useState, useEffect, useCallback, useRef } from 'react';
import { supabasePlanService, TipoPlano } from '@/services/supabasePlanService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PerformanceOptimizer } from '@/utils/performanceOptimizations';

// Cache global para evitar múltiplas consultas
const planCache = new Map<string, { data: PlanoUsuario | null; timestamp: number; materials: number }>();
const CACHE_DURATION = 60000; // 60 segundos

export interface PlanoUsuario {
  id: string;
  user_id: string;
  plano_ativo: TipoPlano;
  data_inicio_plano: string;
  data_expiracao_plano: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
  full_name?: string;
  nome_preferido?: string;
  materiais_criados_mes_atual?: number;
  ano_atual?: number;
  mes_atual?: number;
  ultimo_reset_materiais?: string;
}

export const useSupabasePlanPermissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<PlanoUsuario | null>(null);
  const [remainingMaterials, setRemainingMaterials] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [shouldShowUpgrade, setShouldShowUpgrade] = useState(false);
  const loadingRef = useRef(false);

  // Função otimizada de carregamento com cache
  const loadPlanData = useCallback(async (forceReload = false) => {
    if (!user?.id) {
      console.log('Nenhum usuário autenticado, definindo valores padrão');
      setCurrentPlan(null);
      setRemainingMaterials(0);
      setLoading(false);
      return;
    }

    // Verificar cache primeiro
    const cacheKey = `plan_${user.id}`;
    const cached = planCache.get(cacheKey);
    const now = Date.now();
    
    if (!forceReload && cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('Usando dados do cache para plano');
      setCurrentPlan(cached.data);
      setRemainingMaterials(cached.materials);
      setLoading(false);
      return;
    }

    // Evitar múltiplas consultas simultâneas
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setLoading(true);
      console.log('Carregando dados do plano para usuário (otimizado):', user.id);
      
      // Carregar dados em paralelo com timeout
      const loadPromise = Promise.all([
        supabasePlanService.getCurrentUserPlan(),
        supabasePlanService.getRemainingMaterials()
      ]);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 30000)
      );

      const [plan, remaining] = await Promise.race([loadPromise, timeoutPromise]) as [PlanoUsuario | null, number];
      
      console.log('Plano carregado (otimizado):', plan);
      console.log('Materiais restantes (otimizado):', remaining);
      
      // Log específico para usuário admin
      if (user.email === 'medtosdigital@gmail.com') {
        console.log('ADMIN USER DETECTED - Plan data:', plan);
        console.log('ADMIN USER DETECTED - plano_ativo:', plan?.plano_ativo);
        console.log('ADMIN USER DETECTED - remaining materials:', remaining);
      }
      
      let finalPlan = plan;
      let finalRemaining = remaining;

      if (!plan) {
        // Plano padrão mais simples
        console.log('Usando plano gratuito como padrão (otimizado)');
        finalPlan = {
          id: 'default',
          user_id: user.id,
          plano_ativo: 'gratuito',
          data_inicio_plano: new Date().toISOString(),
          data_expiracao_plano: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        finalRemaining = 5; // Limite do plano gratuito
      }

      // Atualizar cache
      planCache.set(cacheKey, {
        data: finalPlan,
        timestamp: now,
        materials: finalRemaining
      });

      setCurrentPlan(finalPlan);
      setRemainingMaterials(finalRemaining);

    } catch (error) {
      console.error('Erro ao carregar dados do plano (usando fallback):', error);
      
      // Fallback rápido
      const fallbackPlan = {
        id: 'error-fallback',
        user_id: user.id,
        plano_ativo: 'gratuito' as TipoPlano,
        data_inicio_plano: new Date().toISOString(),
        data_expiracao_plano: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setCurrentPlan(fallbackPlan);
      setRemainingMaterials(5);
      
      console.warn('Usando configurações padrão devido ao erro');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [user, toast]);

  // Carregar dados apenas quando necessário
  useEffect(() => {
    if (user?.id) {
      console.log('useSupabasePlanPermissions - Carregando dados para usuário:', user.email);
      loadPlanData();
    }
  }, [user?.id, loadPlanData]);

  // Atualizar dados em tempo real ao trocar de plano
  useEffect(() => {
    const handlePlanChanged = () => {
      if (user?.id) {
        planCache.delete(`plan_${user.id}`);
        loadPlanData(true);
      }
    };
    window.addEventListener('planChanged', handlePlanChanged);
    return () => {
      window.removeEventListener('planChanged', handlePlanChanged);
    };
  }, [user?.id, loadPlanData]);

  // Limpeza automática do cache a cada 5 minutos
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      PerformanceOptimizer.cleanupExpiredEntries(planCache, CACHE_DURATION);
    }, 300000);

    return () => clearInterval(cleanupInterval);
  }, []);

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
        const newRemaining = await supabasePlanService.getRemainingMaterials();
        setRemainingMaterials(newRemaining);
        
        const cacheKey = `plan_${user.id}`;
        const cached = planCache.get(cacheKey);
        if (cached) {
          cached.materials = newRemaining;
          cached.timestamp = Date.now();
        }
        
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
      return false;
    }
  }, [user, toast]);

  const changePlan = useCallback(async (newPlan: TipoPlano, expirationDate?: Date): Promise<boolean> => {
    try {
      const success = await supabasePlanService.updateUserPlan(newPlan, expirationDate);
      
      if (success) {
        if (user?.id) {
          planCache.delete(`plan_${user.id}`);
        }
        await loadPlanData(true);
        window.dispatchEvent(new CustomEvent('planChanged'));
        setShouldShowUpgrade(false);
        
        const planNames: Record<TipoPlano, string> = {
          'gratuito': 'Gratuito',
          'professor': 'Professor',
          'grupo_escolar': 'Grupo Escolar',
          'admin': 'Administrador'
        };
        
        toast({
          title: "Plano atualizado",
          description: `Seu plano foi alterado para ${planNames[newPlan]}.`,
        });
      }
      return success;
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      return false;
    }
  }, [user?.id, loadPlanData, toast]);

  // Verificações de permissões otimizadas
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
    const result = currentPlan?.plano_ativo === 'grupo_escolar' || currentPlan?.plano_ativo === 'admin';
    return result;
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

  const canAccessSettings = useCallback((): boolean => {
    const result = currentPlan?.plano_ativo === 'admin';
    return result;
  }, [currentPlan?.plano_ativo]);

  const isAdminAuthenticated = useCallback((): boolean => {
    const result = currentPlan?.plano_ativo === 'admin';
    return result;
  }, [currentPlan?.plano_ativo]);

  const dismissUpgradeModal = useCallback((): void => {
    setShouldShowUpgrade(false);
  }, []);

  const dismissSupportModal = useCallback((): void => {
    // Função vazia por enquanto
  }, []);

  const getNextResetDate = useCallback((): Date => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    return nextMonth;
  }, []);

  const refreshData = useCallback(() => {
    if (user?.id) {
      planCache.delete(`plan_${user.id}`);
      loadPlanData(true);
    }
  }, [user?.id, loadPlanData]);

  return {
    // Estado
    currentPlan,
    remainingMaterials,
    loading,
    shouldShowUpgrade,
    shouldShowSupportModal: false,
    
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
    canAccessSettings,
    getNextResetDate,
    isAdminAuthenticated
  };
};
