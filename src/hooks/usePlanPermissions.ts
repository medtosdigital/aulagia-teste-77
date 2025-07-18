
import { useUnifiedPlanPermissions } from './useUnifiedPlanPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo, useCallback } from 'react';

export const usePlanPermissions = () => {
  const { user } = useAuth();
  const unifiedPermissions = useUnifiedPlanPermissions();

  // Padronizar id do plano
  const normalizePlanId = (planId: string | undefined | null): 'gratuito' | 'professor' | 'grupo-escolar' | 'admin' => {
    if (!planId) return 'gratuito';
    if (planId === 'admin') return 'admin';
    if (planId === 'professor') return 'professor';
    if (planId === 'grupo_escolar' || planId === 'grupo-escolar') return 'grupo-escolar';
    return 'gratuito';
  };

  // Memoizar valores computados para manter compatibilidade
  const memoizedPlan = useMemo(() => {
    if (!user) {
      return {
        id: 'gratuito',
        name: 'Plano Gratuito',
        limits: {
          materialsPerMonth: 0,
          canDownloadWord: false,
          canDownloadPPT: false,
          canEditMaterials: false,
          canCreateSlides: false,
          canCreateAssessments: false,
          hasCalendar: false,
          hasHistory: false
        },
        price: { monthly: 0, yearly: 0 }
      };
    }

    if (unifiedPermissions.loading) {
      return {
        id: 'carregando',
        name: 'Carregando...',
        limits: {
          materialsPerMonth: 0,
          canDownloadWord: false,
          canDownloadPPT: false,
          canEditMaterials: false,
          canCreateSlides: false,
          canCreateAssessments: false,
          hasCalendar: false,
          hasHistory: false
        },
        price: { monthly: 0, yearly: 0 }
      };
    }

    // Mapear dados do perfil unificado para o formato esperado
    let planId = unifiedPermissions.currentProfile?.plano_ativo || 'gratuito';
    // Forçar admin para o usuário correto
    if (user && user.email === 'medtosdigital@gmail.com') {
      planId = 'admin';
    }
    // Garantir que o plano seja carregado corretamente da tabela perfis
    if (unifiedPermissions.currentProfile && unifiedPermissions.currentProfile.plano_ativo) {
      planId = unifiedPermissions.currentProfile.plano_ativo;
    }
    const normalizedPlanId = normalizePlanId(planId);
    console.log('[usePlanPermissions] Plano carregado:', planId, '->', normalizedPlanId);

    // Se o perfil existe mas o plano não é reconhecido, mostrar erro
    if (unifiedPermissions.currentProfile && !['gratuito','professor','grupo-escolar','admin'].includes(normalizedPlanId)) {
      console.error('[usePlanPermissions] Plano desconhecido no perfil:', planId);
    }

    const planLimits = normalizedPlanId === 'admin'
      ? {
          materialsPerMonth: Infinity,
          canDownloadWord: true,
          canDownloadPPT: true,
          canEditMaterials: true,
          canCreateSlides: true,
          canCreateAssessments: true,
          hasCalendar: true,
          hasHistory: true
        }
      : {
          materialsPerMonth: normalizedPlanId === 'gratuito' ? 5 : normalizedPlanId === 'professor' ? 50 : 300,
          canDownloadWord: unifiedPermissions.canDownloadWord(),
          canDownloadPPT: unifiedPermissions.canDownloadPPT(),
          canEditMaterials: unifiedPermissions.canEditMaterials(),
          canCreateSlides: unifiedPermissions.canCreateSlides(),
          canCreateAssessments: unifiedPermissions.canCreateAssessments(),
          hasCalendar: unifiedPermissions.hasCalendar(),
          hasHistory: normalizedPlanId !== 'gratuito'
        };
    return {
      id: normalizedPlanId,
      name: normalizedPlanId === 'admin' ? 'Plano Administrador' : unifiedPermissions.getPlanDisplayName(),
      limits: planLimits,
      price: normalizedPlanId === 'admin'
        ? { monthly: 0, yearly: 0 }
        : {
            monthly: normalizedPlanId === 'gratuito' ? 0 : normalizedPlanId === 'professor' ? 29.90 : 89.90,
            yearly: normalizedPlanId === 'gratuito' ? 0 : normalizedPlanId === 'professor' ? 299 : 849
          }
    };
  }, [user?.id, unifiedPermissions.currentProfile?.plano_ativo, unifiedPermissions.loading, unifiedPermissions.remainingMaterials]);

  const memoizedUsage = useMemo(() => ({
    materialsThisMonth: Math.max(0, memoizedPlan.limits.materialsPerMonth - unifiedPermissions.remainingMaterials)
  }), [memoizedPlan.limits.materialsPerMonth, unifiedPermissions.remainingMaterials]);

  // Memoizar funções para compatibilidade
  const memoizedFunctions = useMemo(() => ({
    changePlan: async (planId: string) => {
      const planTypeMap: Record<string, 'gratuito' | 'professor' | 'grupo_escolar'> = {
        'gratuito': 'gratuito',
        'professor': 'professor',
        'grupo-escolar': 'grupo_escolar'
      };
      const mappedPlanType = planTypeMap[planId] || 'gratuito';
      const result = await unifiedPermissions.changePlan(mappedPlanType);
      window.dispatchEvent(new CustomEvent('planChanged'));
      return result;
    },
    getAvailablePlansForUpgrade: () => {
      const currentPlanId = memoizedPlan.id;
      const allPlans = [
        { id: 'professor', name: 'Professor', price: { monthly: 29.90, yearly: 299 } },
        { id: 'grupo-escolar', name: 'Grupo Escolar', price: { monthly: 89.90, yearly: 849 } }
      ];
      return allPlans.filter(plan => plan.id !== currentPlanId);
    },
    getNextResetDate: () => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      return nextMonth;
    },
    forceRefreshPlan: () => {
      console.log('Forçando recarregamento do plano...');
      unifiedPermissions.forceRefreshPlan();
      window.dispatchEvent(new CustomEvent('planChanged'));
    }
  }), [unifiedPermissions.changePlan, unifiedPermissions.forceRefreshPlan, memoizedPlan.id]);

  // Se não estiver logado, retornar valores padrão
  if (!user) {
    return {
      currentPlan: memoizedPlan,
      usage: { materialsThisMonth: 0 },
      shouldShowUpgrade: false,
      shouldShowSupportModal: false,
      loading: false,
      
      createMaterial: async () => false,
      getRemainingMaterials: () => 0,
      isLimitReached: () => true,
      changePlan: async () => false,
      dismissUpgradeModal: () => {},
      dismissSupportModal: () => {},
      refreshData: () => {},
      
      canEditMaterials: () => false,
      canDownloadWord: () => false,
      canDownloadPPT: () => false,
      canCreateSlides: () => false,
      canCreateAssessments: () => false,
      hasCalendar: () => false,
      canAccessCalendarPage: () => false,
      canAccessSchool: () => false,
      canAccessCreateMaterial: () => false,
      canAccessMaterials: () => false,
      
      canPerformAction: () => false,
      getNextResetDate: memoizedFunctions.getNextResetDate,
      getAvailablePlansForUpgrade: () => [],
      
      canAccessSettings: () => false,
      isAdminAuthenticated: () => false,
      authenticateAdmin: () => false,
      logoutAdmin: () => {},
      
      isSchoolOwner: () => false,
      getRemainingMaterialsToDistribute: () => 0,
      getTotalMaterialsUsedBySchool: () => 0,
      updateUserMaterialLimit: () => {},
      redistributeMaterialLimits: () => {}
    };
  }

  // Retornar dados compatíveis usando o serviço unificado
  return {
    // Estados - usar dados unificados
    currentPlan: memoizedPlan,
    usage: memoizedUsage,
    shouldShowUpgrade: unifiedPermissions.shouldShowUpgrade,
    shouldShowSupportModal: false,
    loading: unifiedPermissions.loading,
    
    // Ações
    createMaterial: unifiedPermissions.createMaterial,
    getRemainingMaterials: () => unifiedPermissions.remainingMaterials,
    isLimitReached: unifiedPermissions.isLimitReached,
    changePlan: memoizedFunctions.changePlan,
    dismissUpgradeModal: unifiedPermissions.dismissUpgradeModal,
    dismissSupportModal: () => {},
    refreshData: unifiedPermissions.refreshData,
    forceRefreshPlan: unifiedPermissions.forceRefreshPlan,
    forceRefreshProfile: unifiedPermissions.forceRefreshProfile,
    forceRefreshPlanFromSubscription: memoizedFunctions.forceRefreshPlan,
    
    // Permissões
    canEditMaterials: unifiedPermissions.canEditMaterials,
    canDownloadWord: unifiedPermissions.canDownloadWord,
    canDownloadPPT: unifiedPermissions.canDownloadPPT,
    canCreateSlides: unifiedPermissions.canCreateSlides,
    canCreateAssessments: unifiedPermissions.canCreateAssessments,
    hasCalendar: unifiedPermissions.hasCalendar,
    canAccessCalendarPage: () => true,
    canAccessSchool: unifiedPermissions.canAccessSchool,
    canAccessCreateMaterial: () => true,
    canAccessMaterials: () => true,
    
    // Funções auxiliares
    canPerformAction: () => !unifiedPermissions.isLimitReached(),
    getNextResetDate: memoizedFunctions.getNextResetDate,
    getAvailablePlansForUpgrade: memoizedFunctions.getAvailablePlansForUpgrade,
    
    // Funções administrativas
    canAccessSettings: unifiedPermissions.canAccessSettings,
    isAdminAuthenticated: unifiedPermissions.isAdminAuthenticated,
    authenticateAdmin: () => false,
    logoutAdmin: () => {},
    
    // Grupo escolar
    isSchoolOwner: () => memoizedPlan.id === 'grupo_escolar',
    getRemainingMaterialsToDistribute: () => 0,
    getTotalMaterialsUsedBySchool: () => 0,
    updateUserMaterialLimit: () => {},
    redistributeMaterialLimits: () => {}
  };
};
