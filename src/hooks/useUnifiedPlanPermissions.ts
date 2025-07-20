
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseUnifiedPlanService, TipoPlano, PerfilUsuario } from '@/services/supabaseUnifiedPlanService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Cache global otimizado
const unifiedCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 segundos para dados críticos

export const useUnifiedPlanPermissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentProfile, setCurrentProfile] = useState<PerfilUsuario | null>(null);
  const [remainingMaterials, setRemainingMaterials] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [shouldShowUpgrade, setShouldShowUpgrade] = useState(false);
  const loadingRef = useRef(false);
  const retryCountRef = useRef(0);

  // Função otimizada com retry e fallback
  const loadProfileData = useCallback(async (forceReload = false) => {
    if (!user?.id) {
      console.log('Nenhum usuário autenticado, definindo valores padrão');
      setCurrentProfile(null);
      setRemainingMaterials(5); // Fallback para plano gratuito
      setLoading(false);
      return;
    }

    // Evitar múltiplas consultas simultâneas
    if (loadingRef.current && !forceReload) return;

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

    loadingRef.current = true;
    setLoading(true);

    try {
      console.log('Carregando dados unificados do perfil para usuário:', user.id);
      
      // Verificar se é usuário admin primeiro (sem consulta ao banco)
      const isAdminUser = user.email === 'medtosdigital@gmail.com';
      
      if (isAdminUser) {
        console.log('ADMIN USER DETECTED - Using admin profile');
        const adminProfile: PerfilUsuario = {
          id: 'admin-profile',
          user_id: user.id,
          plano_ativo: 'admin' as TipoPlano,
          data_inicio_plano: new Date().toISOString(),
          data_expiracao_plano: null,
          materiais_criados_mes_atual: 0,
          ano_atual: new Date().getFullYear(),
          mes_atual: new Date().getMonth() + 1,
          ultimo_reset_materiais: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email: user.email,
          full_name: user.email,
          nome_preferido: 'Admin'
        };
        
        // Cache admin data
        unifiedCache.set(cacheKey, {
          data: { profile: adminProfile, remaining: Infinity },
          timestamp: now
        });
        
        setCurrentProfile(adminProfile);
        setRemainingMaterials(Infinity);
        setLoading(false);
        loadingRef.current = false;
        retryCountRef.current = 0;
        return;
      }

      // Para usuários normais, carregar com timeout otimizado
      const timeoutMs = 8000; // Reduzido de 30s para 8s
      
      const loadPromise = Promise.all([
        supabaseUnifiedPlanService.getCurrentUserProfile(),
        supabaseUnifiedPlanService.getRemainingMaterials()
      ]);

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      );

      const [profile, remaining] = await Promise.race([loadPromise, timeoutPromise]) as [PerfilUsuario | null, number];
      
      console.log('Perfil unificado carregado:', profile);
      console.log('Materiais restantes:', remaining);
      
      // Fallback para perfil não encontrado
      let finalProfile = profile;
      let finalRemaining = remaining;

      if (!profile) {
        console.log('Perfil não encontrado, usando fallback');
        finalRemaining = 5; // Limite do plano gratuito
      }

      // Atualizar cache
      unifiedCache.set(cacheKey, {
        data: { profile: finalProfile, remaining: finalRemaining },
        timestamp: now
      });

      setCurrentProfile(finalProfile);
      setRemainingMaterials(finalRemaining);
      retryCountRef.current = 0; // Reset retry count on success

    } catch (error) {
      console.error('Erro ao carregar dados do perfil unificado:', error);
      
      // Sistema de retry
      if (retryCountRef.current < 2) {
        retryCountRef.current++;
        console.log(`Tentativa ${retryCountRef.current + 1} de 3`);
        setTimeout(() => {
          loadingRef.current = false;
          loadProfileData(true);
        }, 1000 * retryCountRef.current);
        return;
      }
      
      // Fallback final após esgotadas as tentativas
      console.warn('Usando configurações de fallback após erro');
      setCurrentProfile(null);
      setRemainingMaterials(5);
      retryCountRef.current = 0;
      
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
  }, [user?.id, loadProfileData]);

  // Atualizar dados em tempo real ao trocar de plano
  useEffect(() => {
    const handlePlanChanged = () => {
      if (user?.id) {
        const cacheKey = `unified_profile_${user.id}`;
        unifiedCache.delete(cacheKey);
        loadProfileData(true);
      }
    };
    window.addEventListener('planChanged', handlePlanChanged);
    return () => {
      window.removeEventListener('planChanged', handlePlanChanged);
    };
  }, [user?.id, loadProfileData]);

  // Criar material otimizado com fallback local
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
      // Verificação local primeiro para melhor UX
      if (remainingMaterials <= 0) {
        setShouldShowUpgrade(true);
        return false;
      }

      // Verificação no servidor
      const canCreate = await supabaseUnifiedPlanService.canCreateMaterial();
      
      if (!canCreate) {
        setShouldShowUpgrade(true);
        return false;
      }

      const success = await supabaseUnifiedPlanService.incrementMaterialUsage();
      
      if (success) {
        // Atualizar estado local imediatamente
        const newRemaining = Math.max(0, remainingMaterials - 1);
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
  }, [user, remainingMaterials, toast]);

  // Atualizar plano otimizado
  const changePlan = useCallback(async (newPlan: TipoPlano, expirationDate?: Date): Promise<boolean> => {
    try {
      const success = await supabaseUnifiedPlanService.updateUserPlan(newPlan, expirationDate);
      
      if (success) {
        // Limpar cache e recarregar
        if (user?.id) {
          const cacheKey = `unified_profile_${user.id}`;
          unifiedCache.delete(cacheKey);
        }
        await loadProfileData(true);
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
  }, [user?.id, loadProfileData, toast]);

  // Verificações de permissões otimizadas com fallback
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
    const result = currentProfile?.plano_ativo === 'grupo_escolar' || currentProfile?.plano_ativo === 'admin';
    console.log('useUnifiedPlanPermissions Debug - canAccessSchool:', result, 'currentProfile:', currentProfile?.plano_ativo);
    return result;
  }, [currentProfile?.plano_ativo]);

  const isLimitReached = useCallback((): boolean => {
    return remainingMaterials <= 0;
  }, [remainingMaterials]);

  const getPlanDisplayName = useCallback((): string => {
    if (loading) return 'Carregando...';
    if (!currentProfile) return 'Plano Gratuito';
    
    switch (currentProfile.plano_ativo) {
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

  const refreshData = useCallback(() => {
    if (user?.id) {
      const cacheKey = `unified_profile_${user.id}`;
      unifiedCache.delete(cacheKey);
      loadProfileData(true);
    }
  }, [user?.id, loadProfileData]);

  const canAccessSettings = useCallback((): boolean => {
    // Verificar primeiro se é usuário admin por email
    if (user?.email === 'medtosdigital@gmail.com') {
      console.log('ADMIN USER DETECTED by email - canAccessSettings: true');
      return true;
    }
    
    const result = currentProfile?.plano_ativo === 'admin';
    console.log('useUnifiedPlanPermissions Debug - canAccessSettings:', result, 'currentProfile:', currentProfile?.plano_ativo);
    return result;
  }, [currentProfile?.plano_ativo, user?.email]);

  const isAdminAuthenticated = useCallback((): boolean => {
    // Verificar primeiro se é usuário admin por email
    if (user?.email === 'medtosdigital@gmail.com') {
      console.log('ADMIN USER DETECTED by email - isAdminAuthenticated: true');
      return true;
    }
    
    const result = currentProfile?.plano_ativo === 'admin';
    console.log('useUnifiedPlanPermissions Debug - isAdminAuthenticated:', result, 'currentProfile:', currentProfile?.plano_ativo);
    return result;
  }, [currentProfile?.plano_ativo, user?.email]);

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
