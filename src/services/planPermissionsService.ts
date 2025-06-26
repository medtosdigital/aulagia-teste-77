
export interface PlanLimits {
  materialsPerMonth: number;
  canDownloadWord: boolean;
  canDownloadPPT: boolean;
  canEditMaterials: boolean;
  canCreateSlides: boolean;
  canCreateAssessments: boolean;
  hasAdvancedTemplates: boolean;
  hasCalendar: boolean;
  hasHistory: boolean;
  maxUsers: number;
  hasCollaboration: boolean;
  hasPrioritySupport: boolean;
}

export interface UserPlan {
  id: 'gratuito' | 'professor' | 'grupo-escolar';
  name: string;
  limits: PlanLimits;
  price: {
    monthly: number;
    yearly: number;
  };
}

export interface UserUsage {
  materialsThisMonth: number;
  lastResetDate: Date;
  totalMaterials: number;
}

class PlanPermissionsService {
  private readonly STORAGE_KEYS = {
    CURRENT_PLAN: 'user_current_plan',
    USAGE: 'user_usage',
    SUBSCRIPTION_HISTORY: 'subscription_history'
  };

  private readonly plans: Record<string, UserPlan> = {
    gratuito: {
      id: 'gratuito',
      name: 'Gratuito',
      limits: {
        materialsPerMonth: 5,
        canDownloadWord: false,
        canDownloadPPT: false,
        canEditMaterials: false,
        canCreateSlides: false,
        canCreateAssessments: false,
        hasAdvancedTemplates: false,
        hasCalendar: false,
        hasHistory: false,
        maxUsers: 1,
        hasCollaboration: false,
        hasPrioritySupport: false
      },
      price: { monthly: 0, yearly: 0 }
    },
    professor: {
      id: 'professor',
      name: 'Professor',
      limits: {
        materialsPerMonth: 60,
        canDownloadWord: true,
        canDownloadPPT: true,
        canEditMaterials: true,
        canCreateSlides: true,
        canCreateAssessments: true,
        hasAdvancedTemplates: true,
        hasCalendar: true,
        hasHistory: true,
        maxUsers: 1,
        hasCollaboration: false,
        hasPrioritySupport: false
      },
      price: { monthly: 29.90, yearly: 299 }
    },
    'grupo-escolar': {
      id: 'grupo-escolar',
      name: 'Grupo Escolar',
      limits: {
        materialsPerMonth: 300, // 60 per user * 5 users
        canDownloadWord: true,
        canDownloadPPT: true,
        canEditMaterials: true,
        canCreateSlides: true,
        canCreateAssessments: true,
        hasAdvancedTemplates: true,
        hasCalendar: true,
        hasHistory: true,
        maxUsers: 5,
        hasCollaboration: true,
        hasPrioritySupport: true
      },
      price: { monthly: 89.90, yearly: 849 }
    }
  };

  getCurrentPlan(): UserPlan {
    const stored = localStorage.getItem(this.STORAGE_KEYS.CURRENT_PLAN);
    const planId = stored || 'gratuito'; // Default to gratuito (free plan)
    return this.plans[planId] || this.plans.gratuito;
  }

  setCurrentPlan(planId: string): void {
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_PLAN, planId);
    this.addToSubscriptionHistory('plan_changed', planId);
  }

  getUserUsage(): UserUsage {
    const stored = localStorage.getItem(this.STORAGE_KEYS.USAGE);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        lastResetDate: new Date(parsed.lastResetDate)
      };
    }

    // Initialize with real zero values for new users
    const now = new Date();
    const usage: UserUsage = {
      materialsThisMonth: 0, // Start with 0 materials generated
      lastResetDate: new Date(now.getFullYear(), now.getMonth(), 1),
      totalMaterials: 0 // Start with 0 total materials
    };
    
    this.saveUsage(usage);
    return usage;
  }

  private saveUsage(usage: UserUsage): void {
    localStorage.setItem(this.STORAGE_KEYS.USAGE, JSON.stringify(usage));
  }

  incrementMaterialUsage(): boolean {
    const usage = this.getUserUsage();
    const plan = this.getCurrentPlan();
    
    // Check if we need to reset monthly count
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    if (usage.lastResetDate < currentMonth) {
      usage.materialsThisMonth = 0;
      usage.lastResetDate = currentMonth;
    }

    // Check if user has reached limit
    if (usage.materialsThisMonth >= plan.limits.materialsPerMonth) {
      return false; // Cannot create more materials
    }

    // Increment usage
    usage.materialsThisMonth++;
    usage.totalMaterials++;
    this.saveUsage(usage);
    
    this.addToSubscriptionHistory('material_created');
    return true;
  }

  canPerformAction(action: keyof PlanLimits): boolean {
    const plan = this.getCurrentPlan();
    return plan.limits[action] as boolean;
  }

  getRemainingMaterials(): number {
    const usage = this.getUserUsage();
    const plan = this.getCurrentPlan();
    return Math.max(0, plan.limits.materialsPerMonth - usage.materialsThisMonth);
  }

  isLimitReached(): boolean {
    return this.getRemainingMaterials() === 0;
  }

  getNextResetDate(): Date {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15); // 15th of next month
    return nextMonth;
  }

  // Method to check if user has active subscription (for payment status)
  hasActiveSubscription(): boolean {
    const currentPlan = this.getCurrentPlan();
    return currentPlan.id !== 'gratuito';
  }

  // Method to get subscription status
  getSubscriptionStatus(): 'active' | 'inactive' {
    return this.hasActiveSubscription() ? 'active' : 'inactive';
  }

  private addToSubscriptionHistory(action: string, details?: string): void {
    const history = this.getSubscriptionHistory();
    history.push({
      id: Date.now().toString(),
      action,
      details,
      timestamp: new Date(),
      planId: this.getCurrentPlan().id
    });
    
    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.SUBSCRIPTION_HISTORY, JSON.stringify(history));
  }

  getSubscriptionHistory(): Array<{
    id: string;
    action: string;
    details?: string;
    timestamp: Date;
    planId: string;
  }> {
    const stored = localStorage.getItem(this.STORAGE_KEYS.SUBSCRIPTION_HISTORY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    }
    return [];
  }

  getAvailablePlansForUpgrade(): UserPlan[] {
    const currentPlan = this.getCurrentPlan();
    
    if (currentPlan.id === 'gratuito') {
      return [this.plans.professor, this.plans['grupo-escolar']];
    }
    
    if (currentPlan.id === 'professor') {
      return [this.plans['grupo-escolar']];
    }
    
    return [];
  }
}

export const planPermissionsService = new PlanPermissionsService();
