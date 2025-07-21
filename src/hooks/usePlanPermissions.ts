import { useUnifiedPlanPermissions } from './useUnifiedPlanPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo, useCallback } from 'react';

// Updated interface to match the expected structure
export interface PlanPermissionsProfile {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  nome_preferido?: string;
  plano_ativo: 'gratuito' | 'professor' | 'grupo_escolar' | 'admin';
  billing_type?: string;
  data_inicio_plano: string;
  data_expiracao_plano: string | null;
  status_plano: 'ativo' | 'atrasado' | 'cancelado';
  ultima_renovacao: string;
  customer_id?: string;
  subscription_id?: string;
  materiais_criados_mes_atual: number;
  ano_atual: number;
  mes_atual: number;
  ultimo_reset_materiais: string;
  created_at: string;
  updated_at: string;
}

export const usePlanPermissions = () => {
  const { user } = useAuth();
  const unifiedPermissions = useUnifiedPlanPermissions();

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
    
    // Verificar admin por email primeiro
    if (user && user.email === 'medtosdigital@gmail.com') {
      planId = 'admin';
    }
    
    const planLimits = planId === 'admin'
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
          materialsPerMonth: planId === 'gratuito' ? 5 : planId === 'professor' ? 50 : 300,
          canDownloadWord: unifiedPermissions.canDownloadWord(),
          canDownloadPPT: unifiedPermissions.canDownloadPPT(),
          canEditMaterials: unifiedPermissions.canEditMaterials(),
          canCreateSlides: unifiedPermissions.canCreateSlides(),
          canCreateAssessments: unifiedPermissions.canCreateAssessments(),
          hasCalendar: unifiedPermissions.hasCalendar(),
          hasHistory: planId !== 'gratuito'
        };
        
    return {
      id: planId,
      name: planId === 'admin' ? 'Plano Administrador' : unifiedPermissions.getPlanDisplayName(),
      limits: planLimits,
      price: planId === 'admin'
        ? { monthly: 0, yearly: 0 }
        : {
            monthly: planId === 'gratuito' ? 0 : planId === 'professor' ? 29.90 : 89.90,
            yearly: planId === 'gratuito' ? 0 : planId === 'professor' ? 299 : 849
          }
    };
  }, [user, unifiedPermissions]);

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
    }
  }), [unifiedPermissions, memoizedPlan.id]);

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
      refreshData: async () => Promise.resolve(),
      
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
    currentProfile: unifiedPermissions.currentProfile,
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
    refreshData: async () => {
      if (typeof unifiedPermissions.refreshData === 'function') {
        return await unifiedPermissions.refreshData();
      }
      return Promise.resolve();
    },
    
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
    
    // Funções administrativas otimizadas
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
