
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

// Cache local para melhorar performance - aumentando duração do cache
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 segundos para reduzir consultas frequentes
const CRITICAL_CACHE_DURATION = 15000; // 15 segundos para dados críticos

class SupabasePlanService {
  private async cachedQuery<T>(key: string, queryFn: () => Promise<T>, cacheDuration = CACHE_DURATION): Promise<T> {
    const cached = queryCache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < cacheDuration) {
      console.log(`Cache hit para: ${key}`);
      return cached.data;
    }
    
    const result = await queryFn();
    queryCache.set(key, { data: result, timestamp: now });
    console.log(`Cache miss, dados carregados para: ${key}`);
    return result;
  }

  // Obter plano atual do usuário com cache e otimizações
  async getCurrentUserPlan(): Promise<PlanoUsuario | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Nenhum usuário autenticado');
        return null;
      }

      const cacheKey = `plan_${user.id}`;
      
      return await this.cachedQuery(cacheKey, async () => {
        console.log('Buscando plano para usuário (otimizado):', user.id);

        const { data, error } = await supabase
          .from('planos_usuarios')
          .select('*')
          .eq('user_id', user.id)
          .limit(1) // Adicionar limite para otimizar
          .single();

        if (error) {
          console.error('Erro ao buscar plano do usuário:', error);
          
          // Se não encontrou o plano, criar um plano gratuito
          if (error.code === 'PGRST116') {
            console.log('Plano não encontrado, criando plano gratuito');
            return await this.createDefaultPlan(user.id);
          }
          
          return null;
        }

        console.log('Plano encontrado (cache):', data);
        return data;
      });
    } catch (error) {
      console.error('Erro em getCurrentUserPlan:', error);
      return null;
    }
  }

  // Criar plano padrão gratuito otimizado
  private async createDefaultPlan(userId: string): Promise<PlanoUsuario | null> {
    try {
      const { data, error } = await supabase
        .from('planos_usuarios')
        .insert({
          user_id: userId,
          plano_ativo: 'gratuito' as TipoPlano,
          data_inicio: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar plano padrão:', error);
        return null;
      }

      console.log('Plano padrão criado:', data);
      
      // Limpar cache relacionado
      queryCache.delete(`plan_${userId}`);
      queryCache.delete(`usage_${userId}`);
      
      return data;
    } catch (error) {
      console.error('Erro em createDefaultPlan:', error);
      return null;
    }
  }

  // Verificar se usuário pode criar material com cache otimizado
  async canCreateMaterial(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado para criar material');
        return false;
      }

      const cacheKey = `can_create_${user.id}`;
      
      return await this.cachedQuery(cacheKey, async () => {
        // Usar timeout para evitar consultas longas
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const queryPromise = supabase.rpc('can_create_material', {
          p_user_id: user.id
        });

        try {
          const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

          if (error) {
            console.error('Erro ao verificar permissão de criação:', error);
            return false;
          }

          console.log('Pode criar material (cache):', data);
          return data || false;
        } catch (timeoutError) {
          console.warn('Timeout na verificação de permissão, usando fallback');
          // Fallback rápido baseado no plano atual
          const plan = await this.getCurrentUserPlan();
          if (!plan) return true; // Usuário sem plano = plano gratuito
          
          const usage = await this.getCurrentMonthUsage();
          const limit = this.getPlanLimits(plan.plano_ativo);
          return usage < limit;
        }
      }, CRITICAL_CACHE_DURATION); // Cache mais longo para reduzir verificações
    } catch (error) {
      console.error('Erro em canCreateMaterial:', error);
      return false;
    }
  }

  // Incrementar uso de materiais com limpeza de cache
  async incrementMaterialUsage(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('increment_material_usage', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Erro ao incrementar uso de material:', error);
        return false;
      }

      // Limpar caches relacionados
      queryCache.delete(`usage_${user.id}`);
      queryCache.delete(`can_create_${user.id}`);
      queryCache.delete(`remaining_${user.id}`);

      console.log('Uso de material incrementado:', data);
      return data || false;
    } catch (error) {
      console.error('Erro em incrementMaterialUsage:', error);
      return false;
    }
  }

  // Obter uso mensal atual com cache
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
          .limit(1) // Otimização
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar uso atual:', error);
          return 0;
        }

        const usage = data?.materiais_criados || 0;
        console.log('Uso atual do mês (cache):', usage);
        return usage;
      });
    } catch (error) {
      console.error('Erro em getCurrentMonthUsage:', error);
      return 0;
    }
  }

  // Obter limites do plano (função pura, sem consultas)
  getPlanLimits(planType: TipoPlano): number {
    switch (planType) {
      case 'gratuito':
        return 5;
      case 'professor':
        return 50;
      case 'grupo_escolar':
        return 300;
      default:
        return 0;
    }
  }

  // Obter materiais restantes no mês com cache otimizado e timeout
  async getRemainingMaterials(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Nenhum usuário para calcular materiais restantes');
        return 0;
      }

      const cacheKey = `remaining_${user.id}`;
      
      return await this.cachedQuery(cacheKey, async () => {
        // Adicionar timeout para evitar lentidão
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        );
        
        const dataPromise = Promise.all([
          this.getCurrentUserPlan(),
          this.getCurrentMonthUsage()
        ]);

        try {
          const [plan, currentUsage] = await Promise.race([dataPromise, timeoutPromise]) as any;

          if (!plan) {
            console.log('Nenhum plano encontrado, usando plano gratuito');
            return Math.max(0, 5 - currentUsage); // Plano gratuito = 5 materiais
          }

          const planLimit = this.getPlanLimits(plan.plano_ativo);
          const remaining = Math.max(0, planLimit - currentUsage);

          console.log(`Plano: ${plan.plano_ativo}, Limite: ${planLimit}, Usado: ${currentUsage}, Restante: ${remaining}`);
          return remaining;
        } catch (timeoutError) {
          console.warn('Timeout ao calcular materiais restantes, usando fallback');
          // Fallback rápido: assumir plano gratuito
          return 5;
        }
      }, CRITICAL_CACHE_DURATION); // Cache mais longo para dados críticos
    } catch (error) {
      console.error('Erro em getRemainingMaterials:', error);
      return 5; // Fallback padrão
    }
  }

  // Atualizar plano do usuário com limpeza de cache
  async updateUserPlan(newPlan: TipoPlano, expirationDate?: Date): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado para atualizar plano');
        return false;
      }

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

      if (error) {
        console.error('Erro ao atualizar plano do usuário:', error);
        return false;
      }

      // Limpar todos os caches relacionados ao usuário
      const keysToDelete = Array.from(queryCache.keys()).filter(key => key.includes(user.id));
      keysToDelete.forEach(key => queryCache.delete(key));

      console.log('Plano atualizado com sucesso para:', newPlan);
      return true;
    } catch (error) {
      console.error('Erro em updateUserPlan:', error);
      return false;
    }
  }

  // Verificar se plano expirou com cache
  async isPlanExpired(): Promise<boolean> {
    try {
      const plan = await this.getCurrentUserPlan();
      if (!plan || !plan.data_expiracao) return false;

      const expirationDate = new Date(plan.data_expiracao);
      const isExpired = expirationDate < new Date();
      
      console.log('Verificação de expiração:', { expirationDate, isExpired });
      return isExpired;
    } catch (error) {
      console.error('Erro ao verificar expiração do plano:', error);
      return false;
    }
  }

  // Obter histórico de uso com cache
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

        if (error) {
          console.error('Erro ao buscar histórico de uso:', error);
          return [];
        }

        return data || [];
      }, 30000); // Cache mais longo para histórico
    } catch (error) {
      console.error('Erro em getUsageHistory:', error);
      return [];
    }
  }

  // Método para limpar cache quando necessário
  clearCache(userId?: string): void {
    if (userId) {
      const keysToDelete = Array.from(queryCache.keys()).filter(key => key.includes(userId));
      keysToDelete.forEach(key => queryCache.delete(key));
    } else {
      queryCache.clear();
    }
    console.log('Cache limpo', userId ? `para usuário: ${userId}` : 'completamente');
  }
}

export const supabasePlanService = new SupabasePlanService();
