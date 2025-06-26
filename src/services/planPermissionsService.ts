
export interface PlanLimits {
  materialsPerMonth: number;
  downloadFormats: string[];
  canEditMaterials: boolean;
  canUseSlides: boolean;
  canUseEvaluations: boolean;
  hasAdvancedFeatures: boolean;
  hasSupport: 'basic' | 'email' | 'priority';
  maxUsers?: number;
}

export interface UserUsage {
  materialsThisMonth: number;
  materialsCreatedDates: string[];
  lastResetDate: string;
}

export interface PlanPermissions {
  planId: string;
  planName: string;
  limits: PlanLimits;
  usage: UserUsage;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  'gratuito': {
    materialsPerMonth: 5,
    downloadFormats: ['pdf'],
    canEditMaterials: false,
    canUseSlides: false,
    canUseEvaluations: false,
    hasAdvancedFeatures: false,
    hasSupport: 'basic'
  },
  'professor': {
    materialsPerMonth: 60,
    downloadFormats: ['pdf', 'word', 'ppt'],
    canEditMaterials: true,
    canUseSlides: true,
    canUseEvaluations: true,
    hasAdvancedFeatures: true,
    hasSupport: 'email'
  },
  'grupo-escolar': {
    materialsPerMonth: 60,
    downloadFormats: ['pdf', 'word', 'ppt'],
    canEditMaterials: true,
    canUseSlides: true,
    canUseEvaluations: true,
    hasAdvancedFeatures: true,
    hasSupport: 'priority',
    maxUsers: 5
  }
};

class PlanPermissionsService {
  private storageKey = 'user_plan_permissions';
  private usageKey = 'user_usage_data';

  getCurrentPlan(): string {
    // Por enquanto retorna 'professor', mas pode ser integrado com autenticação real
    const stored = localStorage.getItem('current_user_plan');
    return stored || 'professor';
  }

  setCurrentPlan(planId: string): void {
    localStorage.setItem('current_user_plan', planId);
  }

  getPlanLimits(planId: string): PlanLimits {
    return PLAN_LIMITS[planId] || PLAN_LIMITS['gratuito'];
  }

  getUserUsage(): UserUsage {
    const stored = localStorage.getItem(this.usageKey);
    if (stored) {
      const usage = JSON.parse(stored);
      // Reset usage if it's a new month
      const lastReset = new Date(usage.lastResetDate);
      const now = new Date();
      if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
        return this.resetMonthlyUsage();
      }
      return usage;
    }
    return this.resetMonthlyUsage();
  }

  private resetMonthlyUsage(): UserUsage {
    const usage: UserUsage = {
      materialsThisMonth: 0,
      materialsCreatedDates: [],
      lastResetDate: new Date().toISOString()
    };
    localStorage.setItem(this.usageKey, JSON.stringify(usage));
    return usage;
  }

  incrementMaterialUsage(): void {
    const usage = this.getUserUsage();
    usage.materialsThisMonth += 1;
    usage.materialsCreatedDates.push(new Date().toISOString());
    localStorage.setItem(this.usageKey, JSON.stringify(usage));
  }

  canCreateMaterial(materialType?: string): { allowed: boolean; reason?: string } {
    const currentPlan = this.getCurrentPlan();
    const limits = this.getPlanLimits(currentPlan);
    const usage = this.getUserUsage();

    // Check monthly limit
    if (usage.materialsThisMonth >= limits.materialsPerMonth) {
      return { 
        allowed: false, 
        reason: `Limite mensal de ${limits.materialsPerMonth} materiais atingido` 
      };
    }

    // Check material type permissions
    if (materialType === 'slides' && !limits.canUseSlides) {
      return { 
        allowed: false, 
        reason: 'Slides não disponíveis no seu plano atual' 
      };
    }

    if (materialType === 'avaliacao' && !limits.canUseEvaluations) {
      return { 
        allowed: false, 
        reason: 'Avaliações não disponíveis no seu plano atual' 
      };
    }

    return { allowed: true };
  }

  canDownloadFormat(format: string): boolean {
    const currentPlan = this.getCurrentPlan();
    const limits = this.getPlanLimits(currentPlan);
    return limits.downloadFormats.includes(format);
  }

  canEditMaterials(): boolean {
    const currentPlan = this.getCurrentPlan();
    const limits = this.getPlanLimits(currentPlan);
    return limits.canEditMaterials;
  }

  getPlanPermissions(): PlanPermissions {
    const currentPlan = this.getCurrentPlan();
    return {
      planId: currentPlan,
      planName: this.getPlanName(currentPlan),
      limits: this.getPlanLimits(currentPlan),
      usage: this.getUserUsage()
    };
  }

  private getPlanName(planId: string): string {
    const names = {
      'gratuito': 'Gratuito',
      'professor': 'Professor',
      'grupo-escolar': 'Grupo Escolar'
    };
    return names[planId as keyof typeof names] || 'Desconhecido';
  }

  getRemainingMaterials(): number {
    const permissions = this.getPlanPermissions();
    return Math.max(0, permissions.limits.materialsPerMonth - permissions.usage.materialsThisMonth);
  }

  getUsagePercentage(): number {
    const permissions = this.getPlanPermissions();
    return Math.min(100, (permissions.usage.materialsThisMonth / permissions.limits.materialsPerMonth) * 100);
  }
}

export const planPermissionsService = new PlanPermissionsService();
