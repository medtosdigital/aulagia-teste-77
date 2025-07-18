
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseUnifiedPlanService, TipoPlano, PerfilUsuario } from '@/services/supabaseUnifiedPlanService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PerformanceOptimizer } from '@/utils/performanceOptimizations';

// Cache global
const unifiedCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 60 segundos

export const useUnifiedPlanPermissions = () => {
  const { user } = useAuth();
  console.log('Usuário autenticado no hook useUnifiedPlanPermissions:', user);
  const { toast } = useToast();
  const [currentProfile, setCurrentProfile] = useState<PerfilUsuario | null>(null);
  const [remainingMaterials, setRemainingMaterials] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [shouldShowUpgrade, setShouldShowUpgrade] = useState(false);
  const loadingRef = useRef(false);

  // Função otimizada de carregamento
  const loadProfileData = useCallback(async (forceReload = false) => {
    if (!user?.id) {
      console.log('Nenhum usuário autenticado, definindo valores padrão');
      setCurrentProfile(null);
      setRemainingMaterials(0);
      setLoading(false);
      return;
    }

    // Verificar cache primeiro
    const cacheKey = `unified_profile_${user.id}`;
    const cached = unifiedCache.get(cacheKey);
    const now = Date.now();
    
    if (!forceReload && cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('Usando dados do cache para perfil unificado');
      setCurrentProfile(cached.data.profile);
      setRemainingMaterials(cached.data.remaining);
      setLoading(false);
      return;
    }

    // Evitar múltiplas consultas simultâneas
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setLoading(true);
      console.log('Carregando dados unificados do perfil para usuário:', user.id);
      
      // Carregar dados em paralelo com timeout
      const loadPromise = Promise.all([
        supabaseUnifiedPlanService.getCurrentUserProfile(),
        supabaseUnifiedPlanService.getRemainingMaterials()
      ]);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 30000)
      );

      const [profile, remaining] = await Promise.race([loadPromise, timeoutPromise]) as [PerfilUsuario | null, number];
      
      console.log('Perfil unificado carregado:', profile);
      console.log('Materiais restantes:', remaining);
      
      let finalProfile = profile;
      let finalRemaining = remaining;

      if (!profile) {
        console.log('Perfil não encontrado, será criado automaticamente');
        finalRemaining = 5; // Limite do plano gratuito
      }

      // Atualizar cache
      unifiedCache.set(cacheKey, {
        data: { profile: finalProfile, remaining: finalRemaining },
        timestamp: now
      });

      setCurrentProfile(finalProfile);
      setRemainingMaterials(finalRemaining);

    } catch (error) {
      console.error('Erro ao carregar dados do perfil unificado (usando fallback):', error);
      
      // Fallback rápido
      setCurrentProfile(null);
      setRemainingMaterials(5);
      
      console.warn('Usando configurações padrão devido ao erro');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [user]);

  // Carregar dados apenas quando necessário
  useEffect(() => {
    if (user?.id) {
      loadProfileData();
    }
  }, [user?.id]);

  // Atualizar dados em tempo real ao trocar de plano
  useEffect(() => {
    const handlePlanChanged = () => {
      if (user?.id) {
        unifiedCache.delete(`unified_profile_${user.id}`);
        loadProfileData(true);
      }
    };
    window.addEventListener('planChanged', handlePlanChanged);
    return () => {
      window.removeEventListener('planChanged', handlePlanChanged);
    };
  }, [user?.id]); // Removido loadProfileData das dependências

  // Limpeza automática do cache
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      PerformanceOptimizer.cleanupExpiredEntries(unifiedCache, CACHE_DURATION);
    }, 300000); // 5 minutos

    return () => clearInterval(cleanupInterval);
  }, []);

  // Criar material otimizado
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
      const canCreate = await supabaseUnifiedPlanService.canCreateMaterial();
      
      if (!canCreate) {
        setShouldShowUpgrade(true);
        return false;
      }

      const success = await supabaseUnifiedPlanService.incrementMaterialUsage();
      
      if (success) {
        // Atualizar apenas materiais restantes e cache
        const newRemaining = await supabaseUnifiedPlanService.getRemainingMaterials();
        setRemainingMaterials(newRemaining);
        
        // Atualizar cache
        const cacheKey = `unified_profile_${user.id}`;
        const cached = unifiedCache.get(cacheKey);
        if (cached) {
          cached.data.remaining = newRemaining;
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
      const success = await supabaseUnifiedPlanService.updateUserPlan(newPlan, expirationDate);
      
      if (success) {
        // Limpar cache e recarregar
        if (user?.id) {
          unifiedCache.delete(`unified_profile_${user.id}`);
        }
        await loadProfileData(true);
        // Disparar evento global para atualização em tempo real
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
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao alterar o plano.",
        variant: "destructive"
      });
      return false;
    }
  }, [user?.id, toast]); // Removido loadProfileData das dependências

  // Verificações de permissões otimizadas
  const canDownloadWord = useCallback((): boolean => {
    return currentProfile?.plano_ativo !== 'gratuito';
  }, [currentProfile?.plano_ativo]);

  const canDownloadPPT = useCallback((): boolean => {
    return currentProfile?.plano_ativo !== 'gratuito';
  }, [currentProfile?.plano_ativo]);

  const canEditMaterials = useCallback((): boolean => {
    return currentProfile?.plano_ativo !== 'gratuito';
  }, [currentProfile?.plano_ativo]);

  const canCreateSlides = useCallback((): boolean => {
    return currentProfile?.plano_ativo !== 'gratuito';
  }, [currentProfile?.plano_ativo]);

  const canCreateAssessments = useCallback((): boolean => {
    return currentProfile?.plano_ativo !== 'gratuito';
  }, [currentProfile?.plano_ativo]);

  const hasCalendar = useCallback((): boolean => {
    return currentProfile?.plano_ativo !== 'gratuito';
  }, [currentProfile?.plano_ativo]);

  const canAccessSchool = useCallback((): boolean => {
    return currentProfile?.plano_ativo === 'grupo_escolar' || currentProfile?.plano_ativo === 'admin';
  }, [currentProfile?.plano_ativo]);

  const isLimitReached = useCallback((): boolean => {
    return remainingMaterials <= 0;
  }, [remainingMaterials]);

  const getPlanDisplayName = useCallback((): string => {
    if (loading) return 'Carregando...';
    if (!currentProfile) return 'Plano Gratuito';
    
    // Usar o plano_ativo real da tabela perfis
    const planoAtivo = currentProfile.plano_ativo;
    
    switch (planoAtivo) {
      case 'gratuito':
        return 'Plano Gratuito';
      case 'professor':
        return 'Plano Professor';
      case 'grupo_escolar':
        return 'Grupo Escolar';
      case 'admin':
        return 'Plano Administrador';
      default:
        return 'Plano Gratuito';
    }
  }, [loading, currentProfile]);

  const dismissUpgradeModal = useCallback((): void => {
    setShouldShowUpgrade(false);
  }, []);

  // Função de refresh otimizada
  const refreshData = useCallback(() => {
    if (user?.id) {
      unifiedCache.delete(`unified_profile_${user.id}`);
      loadProfileData(true);
    }
  }, [user?.id, loadProfileData]);

  // Função para forçar recarregamento do plano
  const forceRefreshPlan = useCallback(() => {
    if (user?.id) {
      unifiedCache.delete(`unified_profile_${user.id}`);
      unifiedCache.delete(`profile_${user.id}`);
      loadProfileData(true);
    }
  }, [user?.id, loadProfileData]);

  // Função para forçar recarregamento do perfil via serviço
  const forceRefreshProfile = useCallback(async () => {
    if (user?.id) {
      const newProfile = await supabaseUnifiedPlanService.forceRefreshProfile();
      if (newProfile) {
        setCurrentProfile(newProfile);
        console.log('Perfil recarregado via serviço:', newProfile);
      }
    }
  }, [user?.id]);

  const canAccessSettings = useCallback((): boolean => {
    return currentProfile?.plano_ativo === 'admin';
  }, [currentProfile?.plano_ativo]);

  const isAdminAuthenticated = useCallback((): boolean => {
    return currentProfile?.plano_ativo === 'admin';
  }, [currentProfile?.plano_ativo]);

  return {
    // Estado
    currentProfile,
    remainingMaterials,
    loading,
    shouldShowUpgrade,
    
    // Ações
    createMaterial,
    changePlan,
    dismissUpgradeModal,
    refreshData,
    forceRefreshPlan,
    forceRefreshProfile,
    
    // Verificações de permissões
    canDownloadWord,
    canDownloadPPT,
    canEditMaterials,
    canCreateSlides,
    canCreateAssessments,
    hasCalendar,
    canAccessSchool,
    isLimitReached,
    
    // Utilitários
    getPlanDisplayName,
    canAccessSettings,
    isAdminAuthenticated
  };
};
