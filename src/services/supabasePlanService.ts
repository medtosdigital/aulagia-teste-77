
import { supabase } from '@/integrations/supabase/client';

export type TipoPlano = 'gratuito' | 'professor' | 'grupo_escolar';

export interface PlanoUsuario {
  id: string;
  user_id: string;
  plano_ativo: TipoPlano;
  data_inicio: string;
  data_expiracao: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsoMensalMateriais {
  id: string;
  user_id: string;
  ano: number;
  mes: number;
  materiais_criados: number;
  created_at: string;
  updated_at: string;
}

// Cache otimizado com TTL mais agressivo
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 segundos para dados críticos
const LONG_CACHE_DURATION = 30000; // 30 segundos para dados estáticos

// Cache global para evitar múltiplas consultas simultâneas
const pendingQueries = new Map<string, Promise<any>>();

class SupabasePlanService {
  private async cachedQuery<T>(
    key: string, 
    queryFn: () => Promise<T>, 
    cacheDuration = CACHE_DURATION,
    usePendingCache = true
  ): Promise<T> {
    const cached = queryCache.get(key);
    const now = Date.now();
    
    // Verificar cache primeiro
    if (cached && (now - cached.timestamp) < cacheDuration) {
      return cached.data;
    }
    
    // Verificar se já há uma query pendente para evitar duplicação
    if (usePendingCache && pendingQueries.has(key)) {
      return await pendingQueries.get(key);
    }
    
    // Executar query e cachear resultado
    const queryPromise = queryFn();
    if (usePendingCache) {
      pendingQueries.set(key, queryPromise);
    }
    
    try {
      const result = await queryPromise;
      queryCache.set(key, { data: result, timestamp: now });
      return result;
    } finally {
      if (usePendingCache) {
        pendingQueries.delete(key);
      }
    }
  }

  // Obter plano atual super otimizado
  async getCurrentUserPlan(): Promise<PlanoUsuario | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const cacheKey = `plan_${user.id}`;
      
      return await this.cachedQuery(cacheKey, async () => {
        const { data, error } = await supabase
          .from('planos_usuarios')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Criar plano padrão sem esperar
          this.createDefaultPlan(user.id).catch(console.error);
          return {
            id: 'temp',
            user_id: user.id,
            plano_ativo: 'gratuito' as TipoPlano,
            data_inicio: new Date().toISOString(),
            data_expiracao: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }

        if (error) throw error;
        return data;
      }, CACHE_DURATION);
    } catch (error) {
      console.error('Erro em getCurrentUserPlan:', error);
      return null;
    }
  }

  // Criar plano padrão de forma assíncrona
  private async createDefaultPlan(userId: string): Promise<void> {
    try {
      await supabase
        .from('planos_usuarios')
        .insert({
          user_id: userId,
          plano_ativo: 'gratuito' as TipoPlano,
          data_inicio: new Date().toISOString()
        });
      
      // Limpar cache após criar
      queryCache.delete(`plan_${userId}`);
    } catch (error) {
      console.error('Erro ao criar plano padrão:', error);
    }
  }

  // Verificação super rápida usando cache
  async canCreateMaterial(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const cacheKey = `can_create_${user.id}`;
      
      return await this.cachedQuery(cacheKey, async () => {
        // Buscar dados em paralelo
        const [plan, usage] = await Promise.all([
          this.getCurrentUserPlan(),
          this.getCurrentMonthUsage()
        ]);

        if (!plan) return false;
        
        const limit = this.getPlanLimits(plan.plano_ativo);
        return usage < limit;
      }, 3000); // Cache mais curto para verificação crítica
    } catch (error) {
      console.error('Erro em canCreateMaterial:', error);
      return false;
    }
  }

  // Incrementar uso otimizado
  async incrementMaterialUsage(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('increment_material_usage', {
        p_user_id: user.id
      });

      if (!error && data) {
        // Limpar caches relacionados imediatamente
        const keysToDelete = Array.from(queryCache.keys()).filter(key => 
          key.includes(user.id) && (key.includes('usage') || key.includes('can_create') || key.includes('remaining'))
        );
        keysToDelete.forEach(key => queryCache.delete(key));
      }

      return !error && data;
    } catch (error) {
      console.error('Erro em incrementMaterialUsage:', error);
      return false;
    }
  }

  // Uso mensal super otimizado
  async getCurrentMonthUsage(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const cacheKey = `usage_${user.id}_${currentYear}_${currentMonth}`;

      return await this.cachedQuery(cacheKey, async () => {
        const { data, error } = await supabase
          .from('uso_mensal_materiais')
          .select('materiais_criados')
          .eq('user_id', user.id)
          .eq('ano', currentYear)
          .eq('mes', currentMonth)
          .maybeSingle();

        if (error) throw error;
        return data?.materiais_criados || 0;
      }, CACHE_DURATION);
    } catch (error) {
      console.error('Erro em getCurrentMonthUsage:', error);
      return 0;
    }
  }

  // Limites do plano (função pura, sem consultas)
  getPlanLimits(planType: TipoPlano): number {
    switch (planType) {
      case 'gratuito': return 5;
      case 'professor': return 50;
      case 'grupo_escolar': return 300;
      default: return 0;
    }
  }

  // Materiais restantes super otimizado
  async getRemainingMaterials(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const cacheKey = `remaining_${user.id}`;
      
      return await this.cachedQuery(cacheKey, async () => {
        const [plan, currentUsage] = await Promise.all([
          this.getCurrentUserPlan(),
          this.getCurrentMonthUsage()
        ]);

        if (!plan) return 0;
        
        const planLimit = this.getPlanLimits(plan.plano_ativo);
        return Math.max(0, planLimit - currentUsage);
      }, 3000); // Cache mais curto para dados críticos
    } catch (error) {
      console.error('Erro em getRemainingMaterials:', error);
      return 0;
    }
  }

  // Atualizar plano otimizado
  async updateUserPlan(newPlan: TipoPlano, expirationDate?: Date): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const updateData: any = {
        plano_ativo: newPlan,
        updated_at: new Date().toISOString()
      };

      if (expirationDate) {
        updateData.data_expiracao = expirationDate.toISOString();
      }

      const { error } = await supabase
        .from('planos_usuarios')
        .update(updateData)
        .eq('user_id', user.id);

      if (!error) {
        // Limpar todo o cache do usuário
        this.clearCache(user.id);
      }

      return !error;
    } catch (error) {
      console.error('Erro em updateUserPlan:', error);
      return false;
    }
  }

  // Verificar expiração com cache
  async isPlanExpired(): Promise<boolean> {
    try {
      const plan = await this.getCurrentUserPlan();
      if (!plan || !plan.data_expiracao) return false;
      
      return new Date(plan.data_expiracao) < new Date();
    } catch (error) {
      console.error('Erro ao verificar expiração:', error);
      return false;
    }
  }

  // Histórico com cache longo
  async getUsageHistory(months: number = 12): Promise<UsoMensalMateriais[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const cacheKey = `history_${user.id}_${months}`;
      
      return await this.cachedQuery(cacheKey, async () => {
        const { data, error } = await supabase
          .from('uso_mensal_materiais')
          .select('*')
          .eq('user_id', user.id)
          .order('ano', { ascending: false })
          .order('mes', { ascending: false })
          .limit(months);

        if (error) throw error;
        return data || [];
      }, LONG_CACHE_DURATION);
    } catch (error) {
      console.error('Erro em getUsageHistory:', error);
      return [];
    }
  }

  // Limpar cache otimizado
  clearCache(userId?: string): void {
    if (userId) {
      const keysToDelete = Array.from(queryCache.keys()).filter(key => key.includes(userId));
      keysToDelete.forEach(key => queryCache.delete(key));
      
      // Limpar queries pendentes também
      const pendingKeysToDelete = Array.from(pendingQueries.keys()).filter(key => key.includes(userId));
      pendingKeysToDelete.forEach(key => pendingQueries.delete(key));
    } else {
      queryCache.clear();
      pendingQueries.clear();
    }
  }

  // Método para pré-carregar dados críticos
  async preloadCriticalData(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar dados críticos em paralelo sem esperar
      Promise.all([
        this.getCurrentUserPlan(),
        this.getCurrentMonthUsage(),
        this.getRemainingMaterials()
      ]).catch(console.error);
    } catch (error) {
      console.error('Erro ao pré-carregar dados:', error);
    }
  }
}

export const supabasePlanService = new SupabasePlanService();
