import { useState, useEffect, useCallback, useRef } from 'react';
import { supabasePlanService, TipoPlano, PlanoUsuario } from '@/services/supabasePlanService';
import { planService } from '@/services/planService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PerformanceOptimizer } from '@/utils/performanceOptimizations';

// Cache global otimizado
const planCache = new Map<string, { data: PlanoUsuario | null; materials: number; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 segundos para dados críticos

export const useSupabasePlanPermissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<PlanoUsuario | null>(null);
  const [remainingMaterials, setRemainingMaterials] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [shouldShowUpgrade, setShouldShowUpgrade] = useState(false);
  const loadingRef = useRef(false);
  const retryCountRef = useRef(0);

  // Função otimizada de carregamento com cache
  const loadPlanData = useCallback(async (forceReload = false) => {
    if (!user?.id) {
      console.log('Nenhum usuário autenticado, definindo valores padrão');
      setCurrentPlan(null);
      setRemainingMaterials(5);
      setLoading(false);
      return;
    }

    // Evitar múltiplas consultas simultâneas
    if (loadingRef.current && !forceReload) return;

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

    loadingRef.current = true;
    setLoading(true);

    try {
      console.log('Carregando dados do plano para usuário:', user.id);
      
      // Verificar se é usuário admin primeiro (sem consulta ao banco)
      const isAdminUser = user.email === 'medtosdigital@gmail.com';
      
      if (isAdminUser) {
        console.log('ADMIN USER DETECTED - Using admin plan');
        const adminPlan: PlanoUsuario = {
          id: 'admin-plan',
          user_id: user.id,
          plano_ativo: 'admin' as TipoPlano,
          data_inicio_plano: new Date().toISOString(),
          data_expiracao_plano: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email: user.email,
          full_name: user.email,
          nome_preferido: 'Admin'
        };
        
        // Cache admin data
        planCache.set(cacheKey, {
          data: adminPlan,
          timestamp: now,
          materials: Infinity
        });
        
        setCurrentPlan(adminPlan);
        setRemainingMaterials(Infinity);
        setLoading(false);
        loadingRef.current = false;
        retryCountRef.current = 0;
        return;
      }

      // Para usuários normais, usar o novo planService
      console.log('Carregando dados do plano via planService...');
      const userPlanData = await planService.getUserPlanData(user.id);
      
      if (userPlanData) {
        // Converter para o formato esperado
        const plan: PlanoUsuario = {
          id: `plan-${userPlanData.planName}`,
          user_id: user.id,
          plano_ativo: userPlanData.planName as TipoPlano,
          data_inicio_plano: new Date().toISOString(),
          data_expiracao_plano: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email: user.email,
          full_name: user.email,
          nome_preferido: user.email
        };

        // Cache data
        planCache.set(cacheKey, {
          data: plan,
          timestamp: now,
          materials: userPlanData.materialsRemaining
        });

        setCurrentPlan(plan);
        setRemainingMaterials(userPlanData.materialsRemaining);
        retryCountRef.current = 0;
      } else {
        // Fallback para plano gratuito
        const fallbackPlan: PlanoUsuario = {
          id: 'fallback-plan',
          user_id: user.id,
          plano_ativo: 'gratuito' as TipoPlano,
          data_inicio_plano: new Date().toISOString(),
          data_expiracao_plano: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setCurrentPlan(fallbackPlan);
        setRemainingMaterials(5);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do plano (usando fallback):', error);
      
      // Sistema de retry simplificado
      if (retryCountRef.current < 2) {
        retryCountRef.current++;
        console.log(`Tentativa ${retryCountRef.current + 1} de 3`);
        setTimeout(() => {
          loadingRef.current = false;
          loadPlanData(true);
        }, 2000 * retryCountRef.current);
        return;
      }
      
      // Fallback final após esgotadas as tentativas
      console.warn('Usando configurações padrão devido ao erro');
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
      retryCountRef.current = 0;
      
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
