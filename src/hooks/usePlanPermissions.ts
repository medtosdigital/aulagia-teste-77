import { useSupabasePlanPermissions, planCache } from './useSupabasePlanPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export const usePlanPermissions = () => {
  const { user } = useAuth();
  const supabasePermissions = useSupabasePlanPermissions();

  // Memoizar valores computados para evitar recálculos desnecessários
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

    if (supabasePermissions.loading) {
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

    // Mapear dados do Supabase para o formato esperado
    // Normalizar o id do plano para manter um padrão "kebab-case" na interface.
    // Dessa forma evitamos inconsistências como o bug que exibia o plano grupo-escolar como gratuito.
    const rawPlanId = supabasePermissions.currentPlan?.plano_ativo || 'gratuito';

    // Converte "grupo_escolar" (vindo do banco) para "grupo-escolar" (usado na UI)
    const planId = rawPlanId === 'grupo_escolar' ? 'grupo-escolar' : rawPlanId;
    const planLimits = {
      materialsPerMonth: planId === 'gratuito' ? 5 : planId === 'professor' ? 50 : 300,
      canDownloadWord: supabasePermissions.canDownloadWord(),
      canDownloadPPT: supabasePermissions.canDownloadPPT(),
      canEditMaterials: supabasePermissions.canEditMaterials(),
      canCreateSlides: supabasePermissions.canCreateSlides(),
      canCreateAssessments: supabasePermissions.canCreateAssessments(),
      hasCalendar: supabasePermissions.hasCalendar(),
      hasHistory: planId !== 'gratuito'
    };

    return {
      id: planId,
      name: supabasePermissions.getPlanDisplayName(),
      limits: planLimits,
      price: {
        monthly: planId === 'gratuito' ? 0 : planId === 'professor' ? 29.90 : 89.90,
        yearly: planId === 'gratuito' ? 0 : planId === 'professor' ? 299 : 849
      }
    };
  }, [user, supabasePermissions.loading, supabasePermissions.currentPlan, supabasePermissions.getPlanDisplayName, supabasePermissions.canDownloadWord, supabasePermissions.canDownloadPPT, supabasePermissions.canEditMaterials, supabasePermissions.canCreateSlides, supabasePermissions.canCreateAssessments, supabasePermissions.hasCalendar]);

  const memoizedUsage = useMemo(() => ({
    materialsThisMonth: Math.max(0, memoizedPlan.limits.materialsPerMonth - supabasePermissions.remainingMaterials)
  }), [memoizedPlan.limits.materialsPerMonth, supabasePermissions.remainingMaterials]);

  // Memoizar funções para evitar recriações desnecessárias
  const memoizedFunctions = useMemo(() => ({
    changePlan: async (planId: string) => {
      const planTypeMap: Record<string, 'gratuito' | 'professor' | 'grupo_escolar'> = {
        'gratuito': 'gratuito',
        'professor': 'professor',
        'grupo-escolar': 'grupo_escolar'
      };
      const mappedPlanType = planTypeMap[planId] || 'gratuito';
      return await supabasePermissions.changePlan(mappedPlanType);
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
    }
  }), [supabasePermissions.changePlan, memoizedPlan.id]);

  // Se não estiver logado, retornar valores padrão otimizados
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

  // Retornar dados otimizados
  return {
    // Estados - usar apenas dados do Supabase
    currentPlan: memoizedPlan,
    usage: memoizedUsage,
    shouldShowUpgrade: supabasePermissions.shouldShowUpgrade,
    shouldShowSupportModal: false,
    loading: supabasePermissions.loading,
    
    // Ações (já otimizadas)
    createMaterial: supabasePermissions.createMaterial,
    getRemainingMaterials: () => supabasePermissions.remainingMaterials,
    isLimitReached: supabasePermissions.isLimitReached,
    changePlan: memoizedFunctions.changePlan,
    dismissUpgradeModal: supabasePermissions.dismissUpgradeModal,
    dismissSupportModal: () => {},
    refreshData: supabasePermissions.refreshData,
    
    // Permissões (já otimizadas com useCallback)
    canEditMaterials: supabasePermissions.canEditMaterials,
    canDownloadWord: supabasePermissions.canDownloadWord,
    canDownloadPPT: supabasePermissions.canDownloadPPT,
    canCreateSlides: supabasePermissions.canCreateSlides,
    canCreateAssessments: supabasePermissions.canCreateAssessments,
    hasCalendar: supabasePermissions.hasCalendar,
    canAccessCalendarPage: () => true,
    canAccessSchool: supabasePermissions.canAccessSchool,
    canAccessCreateMaterial: () => true,
    canAccessMaterials: () => true,
    
    // Funções auxiliares otimizadas
    canPerformAction: () => !supabasePermissions.isLimitReached(),
    getNextResetDate: memoizedFunctions.getNextResetDate,
    getAvailablePlansForUpgrade: memoizedFunctions.getAvailablePlansForUpgrade,
    
    // Funções administrativas
    canAccessSettings: () => false,
    isAdminAuthenticated: () => false,
    authenticateAdmin: () => false,
    logoutAdmin: () => {},
    
    // Grupo escolar
    isSchoolOwner: () => memoizedPlan.id === 'grupo-escolar',
    getRemainingMaterialsToDistribute: () => 0,
    getTotalMaterialsUsedBySchool: () => 0,
    updateUserMaterialLimit: () => {},
    redistributeMaterialLimits: () => {}
  };
};
