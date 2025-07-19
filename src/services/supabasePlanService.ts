import { supabase } from '@/integrations/supabase/client';

export type TipoPlano = 'gratuito' | 'professor' | 'grupo_escolar' | 'admin';

export interface PlanoUsuario {
  id: string;
  user_id: string;
  plano_ativo: TipoPlano;
  data_inicio_plano: string;
  data_expiracao_plano: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
  full_name?: string;
  nome_preferido?: string;
  materiais_criados_mes_atual?: number;
  ano_atual?: number;
  mes_atual?: number;
  ultimo_reset_materiais?: string;
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
          .from('perfis')
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
        
        // Log específico para usuário admin
        if (user.email === 'medtosdigital@gmail.com') {
          console.log('ADMIN USER DETECTED - Plan data:', data);
          console.log('ADMIN USER DETECTED - plano_ativo:', data.plano_ativo);
        }
        
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
        .from('perfis')
        .insert({
          user_id: userId,
          plano_ativo: 'gratuito' as any,
          data_inicio_plano: new Date().toISOString()
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

      const cacheKey = `usage_${user.id}`;
      
      return await this.cachedQuery(cacheKey, async () => {
        const { data, error } = await supabase
          .from('perfis')
          .select('materiais_criados_mes_atual')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erro ao obter uso mensal:', error);
          return 0;
        }

        console.log('Uso mensal atual (cache):', data.materiais_criados_mes_atual);
        return data.materiais_criados_mes_atual || 0;
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

  // Resetar o uso mensal de materiais ao fazer upgrade de plano
  async resetMonthlyMaterialUsage(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const { error } = await supabase
        .from('perfis')
        .update({ materiais_criados_mes_atual: 0, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('ano_atual', currentYear)
        .eq('mes_atual', currentMonth);
      if (error) {
        console.error('Erro ao resetar uso mensal de materiais:', error);
        return false;
      }
      // Limpar cache relacionado
      queryCache.delete(`usage_${user.id}_${currentYear}_${currentMonth}`);
      queryCache.delete(`remaining_${user.id}`);
      return true;
    } catch (error) {
      console.error('Erro em resetMonthlyMaterialUsage:', error);
      return false;
    }
  }

  // Atualizar plano do usuário
  async updateUserPlan(newPlan: TipoPlano, expirationDate?: Date): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const updateData: any = {
        plano_ativo: newPlan,
        updated_at: new Date().toISOString()
      };

      if (expirationDate) {
        updateData.data_expiracao_plano = expirationDate.toISOString();
      }

      const { error } = await supabase
        .from('perfis')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar plano:', error);
        return false;
      }

      // Limpar caches relacionados
      queryCache.delete(`plan_${user.id}`);
      queryCache.delete(`usage_${user.id}`);
      queryCache.delete(`can_create_${user.id}`);

      console.log('Plano atualizado com sucesso:', newPlan);
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
      if (!plan || !plan.data_expiracao_plano) return false;

      const expirationDate = new Date(plan.data_expiracao_plano);
      const isExpired = expirationDate < new Date();
      
      console.log('Verificação de expiração:', { expirationDate, isExpired });
      return isExpired;
    } catch (error) {
      console.error('Erro ao verificar expiração do plano:', error);
      return false;
    }
  }

  // Obter histórico de uso (simplificado - não há tabela de histórico)
  async getUsageHistory(months: number = 12): Promise<UsoMensalMateriais[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Como não há tabela de histórico, retornar array vazio
      // Em uma implementação futura, isso poderia ser baseado em logs de atividades
      console.log('Histórico de uso não implementado - retornando array vazio');
      return [];
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
