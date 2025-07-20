
import { supabase } from '@/integrations/supabase/client';

export type TipoPlano = 'gratuito' | 'professor' | 'grupo_escolar' | 'admin';

export interface PerfilUsuario {
  id: string;
  user_id: string;
  plano_ativo: TipoPlano;
  data_inicio_plano: string;
  data_expiracao_plano: string | null;
  materiais_criados_mes_atual: number;
  ano_atual: number;
  mes_atual: number;
  ultimo_reset_materiais: string;
  created_at: string;
  updated_at: string;
  email?: string;
  full_name?: string;
  nome_preferido?: string;
}

// Cache global otimizado
const unifiedCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 20000; // 20 segundos

class SupabaseUnifiedPlanService {
  private async cachedQuery<T>(key: string, queryFn: () => Promise<T>, cacheDuration = CACHE_DURATION): Promise<T> {
    const cached = unifiedCache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < cacheDuration) {
      console.log(`Cache hit para: ${key}`);
      return cached.data;
    }
    
    const result = await queryFn();
    unifiedCache.set(key, { data: result, timestamp: now });
    console.log(`Cache atualizado para: ${key}`);
    return result;
  }

  // Obter perfil completo do usuário otimizado
  async getCurrentUserProfile(): Promise<PerfilUsuario | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Nenhum usuário autenticado');
        return null;
      }

      const cacheKey = `profile_${user.id}`;
      
      return await this.cachedQuery(cacheKey, async () => {
        console.log('Buscando perfil para usuário:', user.id);

        // Timeout mais agressivo para queries específicas
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const { data, error } = await supabase
            .from('perfis')
            .select('*')
            .eq('user_id', user.id)
            .limit(1)
            .abortSignal(controller.signal)
            .maybeSingle();

          clearTimeout(timeoutId);

          if (error) {
            console.error('Erro ao buscar perfil do usuário:', error);
            return null;
          }

          console.log('Perfil encontrado:', data);
          
          // Log específico para usuário admin
          if (data?.email === 'medtosdigital@gmail.com') {
            console.log('ADMIN USER DETECTED - Profile data:', data);
          }
          
          return data;
        } catch (abortError) {
          clearTimeout(timeoutId);
          console.warn('Query abortada por timeout');
          return null;
        }
      }, 15000); // Cache mais longo para perfis
    } catch (error) {
      console.error('Erro em getCurrentUserProfile:', error);
      return null;
    }
  }

  // Verificar se usuário pode criar material otimizado
  async canCreateMaterial(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado para criar material');
        return false;
      }

      // Admin sempre pode criar
      if (user.email === 'medtosdigital@gmail.com') {
        console.log('Admin user can always create materials');
        return true;
      }

      const cacheKey = `can_create_${user.id}`;
      
      return await this.cachedQuery(cacheKey, async () => {
        try {
          // Usar timeout mais agressivo
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const { data, error } = await supabase
            .rpc('can_create_material', { p_user_id: user.id })
            .abortSignal(controller.signal);

          clearTimeout(timeoutId);

          if (error) {
            console.error('Erro ao verificar permissão de criação:', error);
            // Fallback: usar verificação local
            return await this.fallbackCanCreate(user.id);
          }

          console.log('Pode criar material:', data);
          return data || false;
        } catch (abortError) {
          console.warn('RPC timeout, usando fallback');
          return await this.fallbackCanCreate(user.id);
        }
      }, 10000);
    } catch (error) {
      console.error('Erro em canCreateMaterial:', error);
      return false;
    }
  }

  // Fallback para verificação local
  private async fallbackCanCreate(userId: string): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) return true; // Se não tem perfil, permitir (será criado)
      
      const limit = this.getPlanLimits(profile.plano_ativo);
      const used = profile.materiais_criados_mes_atual || 0;
      
      return used < limit;
    } catch {
      return true; // Em caso de erro, permitir criação
    }
  }

  // Incrementar uso de materiais otimizado
  async incrementMaterialUsage(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Timeout mais agressivo
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const { data, error } = await supabase
        .rpc('increment_material_usage', { p_user_id: user.id })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error('Erro ao incrementar uso de material:', error);
        return false;
      }

      // Limpar caches relacionados
      this.clearUserCache(user.id);

      console.log('Uso de material incrementado:', data);
      return data || false;
    } catch (error) {
      console.error('Erro em incrementMaterialUsage:', error);
      return false;
    }
  }

  // Obter limites do plano (função pura)
  getPlanLimits(planType: TipoPlano): number {
    switch (planType) {
      case 'gratuito':
        return 5;
      case 'professor':
        return 50;
      case 'grupo_escolar':
        return 300;
      case 'admin':
        return Infinity;
      default:
        return 0;
    }
  }

  // Obter materiais restantes otimizado
  async getRemainingMaterials(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Nenhum usuário para calcular materiais restantes');
        return 0;
      }

      // Admin tem materiais ilimitados
      if (user.email === 'medtosdigital@gmail.com') {
        console.log('Admin user has unlimited materials');
        return Infinity;
      }

      const cacheKey = `remaining_${user.id}`;
      
      return await this.cachedQuery(cacheKey, async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const { data, error } = await supabase
            .rpc('get_remaining_materials', { p_user_id: user.id })
            .abortSignal(controller.signal);

          clearTimeout(timeoutId);

          if (error) {
            console.error('Erro ao obter materiais restantes:', error);
            return await this.fallbackRemainingMaterials(user.id);
          }

          const remaining = data || 0;
          console.log(`Materiais restantes: ${remaining}`);
          return remaining;
        } catch (abortError) {
          console.warn('RPC timeout para materiais restantes, usando fallback');
          return await this.fallbackRemainingMaterials(user.id);
        }
      }, 10000);
    } catch (error) {
      console.error('Erro em getRemainingMaterials:', error);
      return 5;
    }
  }

  // Fallback para cálculo local de materiais restantes
  private async fallbackRemainingMaterials(userId: string): Promise<number> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) return 5;
      
      const limit = this.getPlanLimits(profile.plano_ativo);
      const used = profile.materiais_criados_mes_atual || 0;
      
      return Math.max(0, limit - used);
    } catch {
      return 5; // Fallback seguro
    }
  }

  // Atualizar plano do usuário otimizado
  async updateUserPlan(newPlan: TipoPlano, expirationDate?: Date): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado para atualizar plano');
        return false;
      }

      const { data, error } = await supabase.rpc('update_user_plan', {
        p_user_id: user.id,
        p_new_plan: newPlan,
        p_expiration_date: expirationDate?.toISOString()
      });

      if (error) {
        console.error('Erro ao atualizar plano do usuário:', error);
        return false;
      }

      // Limpar cache do usuário
      this.clearUserCache(user.id);

      console.log('Plano atualizado com sucesso para:', newPlan);
      return data || false;
    } catch (error) {
      console.error('Erro em updateUserPlan:', error);
      return false;
    }
  }

  // Verificar se plano expirou
  async isPlanExpired(): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile || !profile.data_expiracao_plano) return false;

      const expirationDate = new Date(profile.data_expiracao_plano);
      const isExpired = expirationDate < new Date();
      
      console.log('Verificação de expiração:', { expirationDate, isExpired });
      return isExpired;
    } catch (error) {
      console.error('Erro ao verificar expiração do plano:', error);
      return false;
    }
  }

  // Limpar cache específico do usuário
  private clearUserCache(userId: string): void {
    const keysToDelete = Array.from(unifiedCache.keys()).filter(key => key.includes(userId));
    keysToDelete.forEach(key => unifiedCache.delete(key));
    console.log(`Cache limpo para usuário: ${userId}`);
  }

  // Método para limpar cache
  clearCache(userId?: string): void {
    if (userId) {
      this.clearUserCache(userId);
    } else {
      unifiedCache.clear();
      console.log('Cache completamente limpo');
    }
  }
}

export const supabaseUnifiedPlanService = new SupabaseUnifiedPlanService();
