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
  materialLimit: number; // Limite específico para este usuário
}

export interface SchoolUser {
  id: string;
  email: string;
  name: string;
  hasProfessorAccess: boolean;
  addedToSchool: boolean;
  materialLimit: number; // Limite de materiais atribuído a este usuário
  materialsUsed: number; // Materiais utilizados por este usuário no mês
}

class PlanPermissionsService {
  private readonly STORAGE_KEYS = {
    CURRENT_PLAN: 'user_current_plan',
    USAGE: 'user_usage',
    SUBSCRIPTION_HISTORY: 'subscription_history',
    ADMIN_SESSION: 'admin_session',
    SCHOOL_USERS: 'school_users',
    CURRENT_USER: 'current_user',
    SCHOOL_OWNER: 'school_owner'
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

  // Verifica se o usuário atual é o dono da escola (quem assinou o plano grupo escolar)
  isSchoolOwner(): boolean {
    const currentUser = this.getCurrentUser();
    const schoolOwner = localStorage.getItem(this.STORAGE_KEYS.SCHOOL_OWNER);
    
    if (!currentUser || !schoolOwner) return false;
    
    try {
      const owner = JSON.parse(schoolOwner);
      return currentUser.id === owner.id;
    } catch {
      return false;
    }
  }

  // Define o dono da escola (chamado quando alguém assina o plano grupo escolar)
  setSchoolOwner(user: SchoolUser): void {
    localStorage.setItem(this.STORAGE_KEYS.SCHOOL_OWNER, JSON.stringify(user));
  }

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
    if (!stored) {
      // Se não existe usuário atual, criar um usuário padrão
      const defaultUser: SchoolUser = {
        id: 'user-' + Date.now(),
        email: 'usuario@escola.com',
        name: 'Usuário Escola',
        hasProfessorAccess: false,
        addedToSchool: false,
        materialLimit: 5,
        materialsUsed: 0
      };
      this.setCurrentUser(defaultUser);
      return defaultUser;
    }
    
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

  addUserToSchool(user: Omit<SchoolUser, 'id' | 'materialsUsed'>, materialLimit?: number): SchoolUser {
    const users = this.getSchoolUsers();
    const plan = this.getCurrentPlan();
    
    // Calcular limite padrão se não especificado
    const defaultLimit = materialLimit || Math.floor(plan.limits.materialsPerMonth / (users.length + 1));
    
    const newUser: SchoolUser = {
      ...user,
      id: Date.now().toString(),
      materialLimit: defaultLimit,
      materialsUsed: 0
    };
    
    users.push(newUser);
    localStorage.setItem(this.STORAGE_KEYS.SCHOOL_USERS, JSON.stringify(users));
    return newUser;
  }

  updateUserMaterialLimit(userId: string, newLimit: number): boolean {
    const users = this.getSchoolUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    users[userIndex].materialLimit = newLimit;
    localStorage.setItem(this.STORAGE_KEYS.SCHOOL_USERS, JSON.stringify(users));
    
    // Se for o usuário atual, atualizar o usage também
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const usage = this.getUserUsage();
      usage.materialLimit = newLimit;
      this.saveUsage(usage);
    }
    
    return true;
  }

  redistributeMaterialLimits(distribution: { [userId: string]: number }): boolean {
    const users = this.getSchoolUsers();
    const plan = this.getCurrentPlan();
    
    // Verificar se a soma não excede o limite total
    const totalDistributed = Object.values(distribution).reduce((sum, limit) => sum + limit, 0);
    if (totalDistributed > plan.limits.materialsPerMonth) {
      return false;
    }
    
    // Atualizar os limites
    users.forEach(user => {
      if (distribution[user.id] !== undefined) {
        user.materialLimit = distribution[user.id];
      }
    });
    
    localStorage.setItem(this.STORAGE_KEYS.SCHOOL_USERS, JSON.stringify(users));
    
    // Atualizar o usuário atual se necessário
    const currentUser = this.getCurrentUser();
    if (currentUser && distribution[currentUser.id] !== undefined) {
      const usage = this.getUserUsage();
      usage.materialLimit = distribution[currentUser.id];
      this.saveUsage(usage);
    }
    
    return true;
  }

  isUserAddedToSchool(): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser ? currentUser.addedToSchool : false;
  }

  hasUserProfessorAccess(): boolean {
    const currentUser = this.getCurrentUser();
    const plan = this.getCurrentPlan();
    
    // Se é plano grupo escolar, o usuário já tem acesso professor automaticamente
    if (plan.id === 'grupo-escolar') {
      return true;
    }
    
    return currentUser ? currentUser.hasProfessorAccess : false;
  }

  // Para o plano grupo escolar, o acesso às funcionalidades é sempre liberado
  canAccessProfessorFeaturesWithSchoolPlan(): boolean {
    const currentPlan = this.getCurrentPlan();
    if (currentPlan.id !== 'grupo-escolar') return false;
    
    return true; // Sempre verdadeiro para plano grupo escolar
  }

  getCurrentPlan(): UserPlan {
    const stored = localStorage.getItem(this.STORAGE_KEYS.CURRENT_PLAN);
    const planId = stored || 'gratuito';
    return this.plans[planId] || this.plans.gratuito;
  }

  setCurrentPlan(planId: string): void {
    const currentPlan = this.getCurrentPlan();
    
    // Se está mudando para plano grupo escolar, configurar o usuário como dono da escola
    if (planId === 'grupo-escolar' && currentPlan.id !== 'grupo-escolar') {
      let currentUser = this.getCurrentUser();
      
      // Se não há usuário atual, criar um
      if (!currentUser) {
        currentUser = {
          id: 'user-' + Date.now(),
          email: 'usuario@escola.com',
          name: 'Usuário Escola',
          hasProfessorAccess: true,
          addedToSchool: true,
          materialLimit: this.plans['grupo-escolar'].limits.materialsPerMonth,
          materialsUsed: 0
        };
        this.setCurrentUser(currentUser);
      } else {
        // Atualizar usuário existente
        currentUser.hasProfessorAccess = true;
        currentUser.addedToSchool = true;
        currentUser.materialLimit = this.plans['grupo-escolar'].limits.materialsPerMonth;
        this.setCurrentUser(currentUser);
      }
      
      // Definir como dono da escola
      this.setSchoolOwner(currentUser);
      
      // Adicionar à lista de usuários da escola se não estiver lá
      const schoolUsers = this.getSchoolUsers();
      if (!schoolUsers.find(u => u.id === currentUser.id)) {
        schoolUsers.push(currentUser);
        localStorage.setItem(this.STORAGE_KEYS.SCHOOL_USERS, JSON.stringify(schoolUsers));
      }
    }
    
    // Se está mudando de plano, resetar o contador de materiais
    if (currentPlan.id !== planId) {
      this.resetMaterialUsage(planId);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_PLAN, planId);
    this.addToSubscriptionHistory('plan_changed', planId);
  }

  private resetMaterialUsage(newPlanId?: string): void {
    const now = new Date();
    const plan = newPlanId ? this.plans[newPlanId] : this.getCurrentPlan();
    
    let materialLimit = plan?.limits.materialsPerMonth || 5;
    
    // Para usuários do plano grupo escolar, usar o limite específico
    const currentUser = this.getCurrentUser();
    if (currentUser && plan?.id === 'grupo-escolar') {
      materialLimit = currentUser.materialLimit || materialLimit;
    }
    
    const usage: UserUsage = {
      materialsThisMonth: 0,
      lastResetDate: new Date(now.getFullYear(), now.getMonth(), 1),
      totalMaterials: this.getUserUsage().totalMaterials,
      materialLimit: materialLimit
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
    const plan = this.getCurrentPlan();
    let materialLimit = plan.limits.materialsPerMonth;
    
    // Para usuários do plano grupo escolar, usar o limite específico
    const currentUser = this.getCurrentUser();
    if (currentUser && plan.id === 'grupo-escolar') {
      materialLimit = currentUser.materialLimit || materialLimit;
    }
    
    const usage: UserUsage = {
      materialsThisMonth: 0,
      lastResetDate: new Date(now.getFullYear(), now.getMonth(), 1),
      totalMaterials: 0,
      materialLimit: materialLimit
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

    // Check if user has reached limit (usar o limite específico do usuário)
    if (usage.materialsThisMonth >= usage.materialLimit) {
      return false; // Cannot create more materials
    }

    // Increment usage
    usage.materialsThisMonth++;
    usage.totalMaterials++;
    this.saveUsage(usage);
    
    // Para plano grupo escolar, atualizar também o contador do usuário na escola
    const currentUser = this.getCurrentUser();
    if (plan.id === 'grupo-escolar' && currentUser) {
      this.updateSchoolUserMaterialUsage(currentUser.id);
    }
    
    this.addToSubscriptionHistory('material_created');
    return true;
  }

  private updateSchoolUserMaterialUsage(userId: string): void {
    const users = this.getSchoolUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].materialsUsed = (users[userIndex].materialsUsed || 0) + 1;
      localStorage.setItem(this.STORAGE_KEYS.SCHOOL_USERS, JSON.stringify(users));
    }
  }

  canPerformAction(action: keyof PlanLimits): boolean {
    const plan = this.getCurrentPlan();
    return plan.limits[action] as boolean;
  }

  getRemainingMaterials(): number {
    const usage = this.getUserUsage();
    const plan = this.getCurrentPlan();
    
    // Para plano grupo escolar, verificar se o usuário atual tem um limite específico
    if (plan.id === 'grupo-escolar') {
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.materialLimit !== undefined) {
        // Usar o limite específico do usuário
        const remaining = Math.max(0, currentUser.materialLimit - usage.materialsThisMonth);
        console.log('Grupo Escolar - Remaining materials calculation:', {
          userLimit: currentUser.materialLimit,
          materialsThisMonth: usage.materialsThisMonth,
          remaining: remaining
        });
        return remaining;
      } else {
        // Fallback para o limite do plano se não há usuário específico
        const remaining = Math.max(0, plan.limits.materialsPerMonth - usage.materialsThisMonth);
        console.log('Grupo Escolar - Fallback calculation:', {
          planLimit: plan.limits.materialsPerMonth,
          materialsThisMonth: usage.materialsThisMonth,
          remaining: remaining
        });
        return remaining;
      }
    }
    
    // Para outros planos, usar o limite normal
    const remaining = Math.max(0, usage.materialLimit - usage.materialsThisMonth);
    console.log('Regular plan - Remaining materials calculation:', {
      materialLimit: usage.materialLimit,
      materialsThisMonth: usage.materialsThisMonth,
      remaining: remaining
    });
    return remaining;
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

  // Métodos para gerenciar limites de materiais no plano grupo escolar
  getTotalMaterialsUsedBySchool(): number {
    const users = this.getSchoolUsers();
    return users.reduce((total, user) => total + (user.materialsUsed || 0), 0);
  }

  getTotalMaterialLimitDistributed(): number {
    const users = this.getSchoolUsers();
    return users.reduce((total, user) => total + (user.materialLimit || 0), 0);
  }

  getRemainingMaterialsToDistribute(): number {
    const plan = this.getCurrentPlan();
    if (plan.id !== 'grupo-escolar') return 0;
    
    return plan.limits.materialsPerMonth - this.getTotalMaterialLimitDistributed();
  }

  // Método específico para verificar se deve mostrar modal de suporte para plano Professor
  shouldShowSupportModal(): boolean {
    const currentPlan = this.getCurrentPlan();
    return currentPlan.id === 'professor' && this.isLimitReached();
  }
}

export const planPermissionsService = new PlanPermissionsService();
