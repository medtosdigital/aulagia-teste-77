
import { useSupabasePlanPermissions } from './useSupabasePlanPermissions';
import { useAuth } from '@/contexts/AuthContext';

export const usePlanPermissions = () => {
  const { user } = useAuth();
  const supabasePermissions = useSupabasePlanPermissions();

  // Se não estiver logado, retornar valores padrão para plano gratuito
  if (!user) {
    return {
      // Estados
      currentPlan: {
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
      },
      usage: { materialsThisMonth: 0 },
      shouldShowUpgrade: false,
      shouldShowSupportModal: false,
      loading: false,
      
      // Ações
      createMaterial: async () => false,
      getRemainingMaterials: () => 0,
      isLimitReached: () => true,
      changePlan: async () => false,
      dismissUpgradeModal: () => {},
      dismissSupportModal: () => {},
      refreshData: () => {},
      
      // Permissões - todas negativas para não logados
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
      
      // Funções auxiliares
      canPerformAction: () => false,
      getNextResetDate: () => new Date(),
      getAvailablePlansForUpgrade: () => [],
      
      // Funções administrativas
      canAccessSettings: () => false,
      isAdminAuthenticated: () => false,
      authenticateAdmin: () => false,
      logoutAdmin: () => {},
      
      // Grupo escolar
      isSchoolOwner: () => false,
      getRemainingMaterialsToDistribute: () => 0,
      getTotalMaterialsUsedBySchool: () => 0,
      updateUserMaterialLimit: () => {},
      redistributeMaterialLimits: () => {}
    };
  }

  // Se ainda está carregando dados do Supabase
  if (supabasePermissions.loading) {
    return {
      // Estados com loading
      currentPlan: {
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
      },
      usage: { materialsThisMonth: 0 },
      shouldShowUpgrade: false,
      shouldShowSupportModal: false,
      loading: true,
      
      // Ações desabilitadas durante loading
      createMaterial: async () => false,
      getRemainingMaterials: () => 0,
      isLimitReached: () => false,
      changePlan: async () => false,
      dismissUpgradeModal: () => {},
      dismissSupportModal: () => {},
      refreshData: supabasePermissions.refreshData,
      
      // Permissões - permitir acesso básico durante loading para usuários logados
      canEditMaterials: () => false,
      canDownloadWord: () => false,
      canDownloadPPT: () => false,
      canCreateSlides: () => false,
      canCreateAssessments: () => false,
      hasCalendar: () => false,
      canAccessCalendarPage: () => true, // Permitir acesso ao calendário para usuários logados
      canAccessSchool: () => false,
      canAccessCreateMaterial: () => true, // Permitir acesso para criar material para usuários logados
      canAccessMaterials: () => true, // Permitir acesso aos materiais para usuários logados
      
      // Funções auxiliares
      canPerformAction: () => false,
      getNextResetDate: () => new Date(),
      getAvailablePlansForUpgrade: () => [],
      
      // Funções administrativas
      canAccessSettings: () => false,
      isAdminAuthenticated: () => false,
      authenticateAdmin: () => false,
      logoutAdmin: () => {},
      
      // Grupo escolar
      isSchoolOwner: () => false,
      getRemainingMaterialsToDistribute: () => 0,
      getTotalMaterialsUsedBySchool: () => 0,
      updateUserMaterialLimit: () => {},
      redistributeMaterialLimits: () => {}
    };
  }

  // Mapear dados do Supabase para o formato esperado
  const planId = supabasePermissions.currentPlan?.plano_ativo || 'gratuito';
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

  const mappedCurrentPlan = {
    id: planId,
    name: supabasePermissions.getPlanDisplayName(),
    limits: planLimits,
    price: {
      monthly: planId === 'gratuito' ? 0 : planId === 'professor' ? 29.90 : 89.90,
      yearly: planId === 'gratuito' ? 0 : planId === 'professor' ? 299 : 849
    }
  };

  const mappedUsage = {
    materialsThisMonth: Math.max(0, planLimits.materialsPerMonth - supabasePermissions.remainingMaterials)
  };

  return {
    // Estados - usar apenas dados do Supabase
    currentPlan: mappedCurrentPlan,
    usage: mappedUsage,
    shouldShowUpgrade: supabasePermissions.shouldShowUpgrade,
    shouldShowSupportModal: false,
    loading: supabasePermissions.loading,
    
    // Ações
    createMaterial: supabasePermissions.createMaterial,
    getRemainingMaterials: () => supabasePermissions.remainingMaterials,
    isLimitReached: supabasePermissions.isLimitReached,
    changePlan: async (planId: string) => {
      const planTypeMap: Record<string, 'gratuito' | 'professor' | 'grupo_escolar'> = {
        'gratuito': 'gratuito',
        'professor': 'professor',
        'grupo-escolar': 'grupo_escolar'
      };
      const mappedPlanType = planTypeMap[planId] || 'gratuito';
      return await supabasePermissions.changePlan(mappedPlanType);
    },
    dismissUpgradeModal: supabasePermissions.dismissUpgradeModal,
    dismissSupportModal: () => {},
    refreshData: supabasePermissions.refreshData,
    
    // Permissões - simplificadas para melhor performance
    canEditMaterials: supabasePermissions.canEditMaterials,
    canDownloadWord: supabasePermissions.canDownloadWord,
    canDownloadPPT: supabasePermissions.canDownloadPPT,
    canCreateSlides: supabasePermissions.canCreateSlides,
    canCreateAssessments: supabasePermissions.canCreateAssessments,
    hasCalendar: supabasePermissions.hasCalendar,
    canAccessCalendarPage: () => true, // Todos os usuários logados podem acessar
    canAccessSchool: supabasePermissions.canAccessSchool, // Apenas Grupo Escolar
    canAccessCreateMaterial: () => true, // Todos os usuários logados podem acessar
    canAccessMaterials: () => true, // Todos os usuários logados podem acessar
    
    // Funções auxiliares
    canPerformAction: () => !supabasePermissions.isLimitReached(),
    getNextResetDate: () => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      return nextMonth;
    },
    getAvailablePlansForUpgrade: () => {
      const currentPlanId = mappedCurrentPlan.id;
      const allPlans = [
        { id: 'professor', name: 'Professor', price: { monthly: 29.90, yearly: 299 } },
        { id: 'grupo-escolar', name: 'Grupo Escolar', price: { monthly: 89.90, yearly: 849 } }
      ];
      return allPlans.filter(plan => plan.id !== currentPlanId);
    },
    
    // Funções administrativas (mantidas vazias)
    canAccessSettings: () => false,
    isAdminAuthenticated: () => false,
    authenticateAdmin: () => false,
    logoutAdmin: () => {},
    
    // Grupo escolar
    isSchoolOwner: () => mappedCurrentPlan.id === 'grupo_escolar',
    getRemainingMaterialsToDistribute: () => 0,
    getTotalMaterialsUsedBySchool: () => 0,
    updateUserMaterialLimit: () => {},
    redistributeMaterialLimits: () => {}
  };
};
