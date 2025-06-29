
import { useState, useEffect } from 'react';
import { planPermissionsService, UserPlan, UserUsage } from '@/services/planPermissionsService';
import { useSupabasePlanPermissions } from './useSupabasePlanPermissions';
import { useFeedback } from './useFeedback';
import { useAuth } from '@/contexts/AuthContext';

export const usePlanPermissions = () => {
  const { user } = useAuth();
  const supabasePermissions = useSupabasePlanPermissions();
  const { incrementMaterialsCreated } = useFeedback();
  
  // Estados do sistema antigo (localStorage) - mantidos para compatibilidade
  const [currentPlan, setCurrentPlan] = useState<UserPlan>(planPermissionsService.getCurrentPlan());
  const [usage, setUsage] = useState<UserUsage>(planPermissionsService.getUserUsage());
  const [shouldShowUpgrade, setShouldShowUpgrade] = useState(false);
  const [shouldShowSupportModal, setShouldShowSupportModal] = useState(false);

  // Se o usuário estiver logado, usar o Supabase. Caso contrário, usar o localStorage
  const useSupabase = !!user;

  const refreshData = () => {
    if (useSupabase) {
      supabasePermissions.refreshData();
    } else {
      setCurrentPlan(planPermissionsService.getCurrentPlan());
      setUsage(planPermissionsService.getUserUsage());
    }
  };

  const createMaterial = async (): Promise<boolean> => {
    if (useSupabase) {
      const success = await supabasePermissions.createMaterial();
      if (!success && supabasePermissions.currentPlan?.plano_ativo === 'gratuito') {
        incrementMaterialsCreated();
      }
      return success;
    } else {
      // Lógica original para usuários não logados
      const canCreate = planPermissionsService.incrementMaterialUsage();
      
      if (!canCreate) {
        if (planPermissionsService.shouldShowSupportModal()) {
          setShouldShowSupportModal(true);
        } else {
          setShouldShowUpgrade(true);
        }
        return false;
      }
      
      if (currentPlan.id === 'gratuito') {
        incrementMaterialsCreated();
      }
      
      refreshData();
      return true;
    }
  };

  const getRemainingMaterials = (): number => {
    if (useSupabase) {
      return supabasePermissions.remainingMaterials;
    } else {
      return planPermissionsService.getRemainingMaterials();
    }
  };

  const isLimitReached = (): boolean => {
    if (useSupabase) {
      return supabasePermissions.isLimitReached();
    } else {
      return planPermissionsService.isLimitReached();
    }
  };

  const changePlan = (planId: string): void => {
    if (useSupabase) {
      // Para usuários logados, usar a função do Supabase
      supabasePermissions.changePlan(planId as any);
    } else {
      planPermissionsService.setCurrentPlan(planId);
      refreshData();
      setShouldShowUpgrade(false);
      setShouldShowSupportModal(false);
    }
  };

  // Funções de permissão - usar Supabase se logado, senão localStorage
  const canEditMaterials = (): boolean => {
    return useSupabase ? supabasePermissions.canEditMaterials() : planPermissionsService.canPerformAction('canEditMaterials');
  };

  const canDownloadWord = (): boolean => {
    return useSupabase ? supabasePermissions.canDownloadWord() : planPermissionsService.canPerformAction('canDownloadWord');
  };

  const canDownloadPPT = (): boolean => {
    return useSupabase ? supabasePermissions.canDownloadPPT() : planPermissionsService.canPerformAction('canDownloadPPT');
  };

  const canCreateSlides = (): boolean => {
    return useSupabase ? supabasePermissions.canCreateSlides() : planPermissionsService.canPerformAction('canCreateSlides');
  };

  const canCreateAssessments = (): boolean => {
    return useSupabase ? supabasePermissions.canCreateAssessments() : planPermissionsService.canPerformAction('canCreateAssessments');
  };

  const hasCalendar = (): boolean => {
    return useSupabase ? supabasePermissions.hasCalendar() : planPermissionsService.canPerformAction('hasCalendar');
  };

  const canAccessCalendarPage = (): boolean => {
    return useSupabase ? supabasePermissions.canAccessCalendarPage() : true;
  };

  const canAccessSchool = (): boolean => {
    return useSupabase ? supabasePermissions.canAccessSchool() : currentPlan.id === 'grupo-escolar';
  };

  const canAccessCreateMaterial = (): boolean => {
    return useSupabase ? supabasePermissions.canAccessCreateMaterial() : true;
  };

  const canAccessMaterials = (): boolean => {
    return useSupabase ? supabasePermissions.canAccessMaterials() : true;
  };

  // Manter compatibilidade com funções do sistema antigo
  const dismissUpgradeModal = (): void => {
    if (useSupabase) {
      supabasePermissions.dismissUpgradeModal();
    } else {
      setShouldShowUpgrade(false);
    }
  };

  const dismissSupportModal = (): void => {
    setShouldShowSupportModal(false);
  };

  // Estados combinados
  const combinedShouldShowUpgrade = useSupabase ? supabasePermissions.shouldShowUpgrade : shouldShowUpgrade;

  useEffect(() => {
    if (!useSupabase) {
      const plan = planPermissionsService.getCurrentPlan();
      
      if (planPermissionsService.isLimitReached()) {
        if (plan.id === 'professor') {
          setShouldShowSupportModal(true);
        } else if (plan.id === 'gratuito') {
          setShouldShowUpgrade(true);
        }
      }
    }
  }, [useSupabase]);

  return {
    // Estados - usar Supabase se disponível
    currentPlan: useSupabase ? {
      id: supabasePermissions.currentPlan?.plano_ativo || 'gratuito',
      name: supabasePermissions.getPlanDisplayName(),
      limits: {} as any,
      price: { monthly: 0, yearly: 0 }
    } : currentPlan,
    usage,
    shouldShowUpgrade: combinedShouldShowUpgrade,
    shouldShowSupportModal,
    loading: useSupabase ? supabasePermissions.loading : false,
    
    // Ações
    createMaterial,
    getRemainingMaterials,
    isLimitReached,
    changePlan,
    dismissUpgradeModal,
    dismissSupportModal,
    refreshData,
    
    // Permissões
    canEditMaterials,
    canDownloadWord,
    canDownloadPPT,
    canCreateSlides,
    canCreateAssessments,
    hasCalendar,
    canAccessCalendarPage,
    canAccessSchool,
    canAccessCreateMaterial,
    canAccessMaterials,
    
    // Manter funções do sistema antigo para compatibilidade
    canPerformAction: (action: any) => useSupabase ? false : planPermissionsService.canPerformAction(action),
    getNextResetDate: () => useSupabase ? new Date() : planPermissionsService.getNextResetDate(),
    getAvailablePlansForUpgrade: () => useSupabase ? [] : planPermissionsService.getAvailablePlansForUpgrade(),
    
    // Funções administrativas (manter do sistema antigo)
    canAccessSettings: () => planPermissionsService.isAdminAuthenticated(),
    isAdminAuthenticated: () => planPermissionsService.isAdminAuthenticated(),
    authenticateAdmin: planPermissionsService.authenticateAdmin.bind(planPermissionsService),
    logoutAdmin: planPermissionsService.logoutAdmin.bind(planPermissionsService),
    
    // Grupo escolar (manter do sistema antigo por enquanto)
    isSchoolOwner: () => planPermissionsService.isSchoolOwner(),
    getRemainingMaterialsToDistribute: () => planPermissionsService.getRemainingMaterialsToDistribute(),
    getTotalMaterialsUsedBySchool: () => planPermissionsService.getTotalMaterialsUsedBySchool(),
    updateUserMaterialLimit: planPermissionsService.updateUserMaterialLimit.bind(planPermissionsService),
    redistributeMaterialLimits: planPermissionsService.redistributeMaterialLimits.bind(planPermissionsService)
  };
};
