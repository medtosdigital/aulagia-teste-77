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

export interface SchoolUser {
  id: string;
  email: string;
  name: string;
  hasProfessorAccess: boolean;
  addedToSchool: boolean;
}

class PlanPermissionsService {
  private readonly STORAGE_KEYS = {
    CURRENT_PLAN: 'user_current_plan',
    USAGE: 'user_usage',
    SUBSCRIPTION_HISTORY: 'subscription_history',
    ADMIN_SESSION: 'admin_session',
    SCHOOL_USERS: 'school_users',
    CURRENT_USER: 'current_user'
  };

  private readonly ADMIN_CREDENTIALS = {
    email: 'medtosdigital@gmail.com',
    password: '344192So!'
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
        materialsPerMonth: 300,
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

  isAdminAuthenticated(): boolean {
    const adminSession = localStorage.getItem(this.STORAGE_KEYS.ADMIN_SESSION);
    if (!adminSession) return false;
    
    try {
      const session = JSON.parse(adminSession);
      const now = new Date().getTime();
      return session.authenticated && session.expiresAt > now;
    } catch {
      return false;
    }
  }

  authenticateAdmin(email: string, password: string): boolean {
    if (email === this.ADMIN_CREDENTIALS.email && password === this.ADMIN_CREDENTIALS.password) {
      const session = {
        authenticated: true,
        expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 horas
      };
      localStorage.setItem(this.STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
      return true;
    }
    return false;
  }

  logoutAdmin(): void {
    localStorage.removeItem(this.STORAGE_KEYS.ADMIN_SESSION);
  }

  getCurrentUser(): SchoolUser | null {
    const stored = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  setCurrentUser(user: SchoolUser): void {
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  getSchoolUsers(): SchoolUser[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.SCHOOL_USERS);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  addUserToSchool(user: Omit<SchoolUser, 'id'>): SchoolUser {
    const users = this.getSchoolUsers();
    const newUser: SchoolUser = {
      ...user,
      id: Date.now().toString()
    };
    
    users.push(newUser);
    localStorage.setItem(this.STORAGE_KEYS.SCHOOL_USERS, JSON.stringify(users));
    return newUser;
  }

  isUserAddedToSchool(): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser ? currentUser.addedToSchool : false;
  }

  hasUserProfessorAccess(): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser ? currentUser.hasProfessorAccess : false;
  }

  canAccessProfessorFeaturesWithSchoolPlan(): boolean {
    const currentPlan = this.getCurrentPlan();
    if (currentPlan.id !== 'grupo-escolar') return false;
    
    return this.isUserAddedToSchool() && this.hasUserProfessorAccess();
  }

  getCurrentPlan(): UserPlan {
    const stored = localStorage.getItem(this.STORAGE_KEYS.CURRENT_PLAN);
    const planId = stored || 'gratuito';
    return this.plans[planId] || this.plans.gratuito;
  }

  setCurrentPlan(planId: string): void {
    const currentPlan = this.getCurrentPlan();
    
    // Se está mudando de plano, resetar o contador de materiais
    if (currentPlan.id !== planId) {
      this.resetMaterialUsage();
    }
    
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_PLAN, planId);
    this.addToSubscriptionHistory('plan_changed', planId);
  }

  private resetMaterialUsage(): void {
    const now = new Date();
    const usage: UserUsage = {
      materialsThisMonth: 0,
      lastResetDate: new Date(now.getFullYear(), now.getMonth(), 1),
      totalMaterials: this.getUserUsage().totalMaterials // Manter o total histórico
    };
    
    this.saveUsage(usage);
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

    const now = new Date();
    const usage: UserUsage = {
      materialsThisMonth: 0,
      lastResetDate: new Date(now.getFullYear(), now.getMonth(), 1),
      totalMaterials: 0
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
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
    return nextMonth;
  }

  hasActiveSubscription(): boolean {
    const currentPlan = this.getCurrentPlan();
    return currentPlan.id !== 'gratuito';
  }

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

  // Método específico para verificar se deve mostrar modal de suporte para plano Professor
  shouldShowSupportModal(): boolean {
    const currentPlan = this.getCurrentPlan();
    return currentPlan.id === 'professor' && this.isLimitReached();
  }
}

export const planPermissionsService = new PlanPermissionsService();
