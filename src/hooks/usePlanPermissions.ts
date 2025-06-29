
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
      changePlan: () => {},
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

  // Mapear dados do Supabase para o formato esperado
  const mappedCurrentPlan = {
    id: supabasePermissions.currentPlan?.plano_ativo || 'gratuito',
    name: supabasePermissions.getPlanDisplayName(),
    limits: {
      materialsPerMonth: supabasePermissions.currentPlan?.plano_ativo === 'gratuito' ? 5 : 
                        supabasePermissions.currentPlan?.plano_ativo === 'professor' ? 50 : 300,
      canDownloadWord: supabasePermissions.canDownloadWord(),
      canDownloadPPT: supabasePermissions.canDownloadPPT(),
      canEditMaterials: supabasePermissions.canEditMaterials(),
      canCreateSlides: supabasePermissions.canCreateSlides(),
      canCreateAssessments: supabasePermissions.canCreateAssessments(),
      hasCalendar: supabasePermissions.hasCalendar(),
      hasHistory: supabasePermissions.currentPlan?.plano_ativo !== 'gratuito'
    },
    price: {
      monthly: supabasePermissions.currentPlan?.plano_ativo === 'gratuito' ? 0 :
               supabasePermissions.currentPlan?.plano_ativo === 'professor' ? 29.90 : 89.90,
      yearly: supabasePermissions.currentPlan?.plano_ativo === 'gratuito' ? 0 :
              supabasePermissions.currentPlan?.plano_ativo === 'professor' ? 299 : 849
    }
  };

  const mappedUsage = {
    materialsThisMonth: mappedCurrentPlan.limits.materialsPerMonth - supabasePermissions.remainingMaterials
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
    
    // Permissões
    canEditMaterials: supabasePermissions.canEditMaterials,
    canDownloadWord: supabasePermissions.canDownloadWord,
    canDownloadPPT: supabasePermissions.canDownloadPPT,
    canCreateSlides: supabasePermissions.canCreateSlides,
    canCreateAssessments: supabasePermissions.canCreateAssessments,
    hasCalendar: supabasePermissions.hasCalendar,
    canAccessCalendarPage: supabasePermissions.canAccessCalendarPage,
    canAccessSchool: supabasePermissions.canAccessSchool,
    canAccessCreateMaterial: supabasePermissions.canAccessCreateMaterial,
    canAccessMaterials: supabasePermissions.canAccessMaterials,
    
    // Funções auxiliares
    canPerformAction: () => false,
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
    
    // Grupo escolar (implementar quando necessário)
    isSchoolOwner: () => mappedCurrentPlan.id === 'grupo-escolar',
    getRemainingMaterialsToDistribute: () => 0,
    getTotalMaterialsUsedBySchool: () => 0,
    updateUserMaterialLimit: () => {},
    redistributeMaterialLimits: () => {}
  };
};
