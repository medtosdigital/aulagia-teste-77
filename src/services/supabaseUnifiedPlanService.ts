
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

// Cache global para melhorar performance
const unifiedCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 segundos

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
    console.log(`Cache miss, dados carregados para: ${key}`);
    return result;
  }

  // Obter perfil completo do usuário
  async getCurrentUserProfile(): Promise<PerfilUsuario | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[getCurrentUserProfile] Nenhum usuário autenticado');
        return null;
      }

      const cacheKey = `profile_${user.id}`;
      return await this.cachedQuery(cacheKey, async () => {
        console.log('[getCurrentUserProfile] Tentando buscar perfil do usuário:', user.id);
        const { data, error } = await supabase
          .from('perfis')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          .single();
        console.log('[getCurrentUserProfile] Resultado da consulta perfis:', data, error);

        if (error) {
          // Tratar qualquer erro de perfil não encontrado
          const notFound = error.code === 'PGRST116' || error.message?.includes('No rows') || error.details?.includes('0 rows');
          if (notFound) {
            // Perfil não encontrado, criar automaticamente
            console.log('[getCurrentUserProfile] Perfil não encontrado, criando perfil gratuito para o usuário:', user.id);
            const { data: newProfile, error: createError } = await supabase
              .from('perfis')
              .insert({
                user_id: user.id,
                plano_ativo: 'gratuito',
                materiais_criados_mes_atual: 0,
                ano_atual: new Date().getFullYear(),
                mes_atual: new Date().getMonth() + 1,
                data_inicio_plano: new Date().toISOString(),
                ultimo_reset_materiais: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                email: user.email || '',
                full_name: user.user_metadata?.full_name || '',
                nome_preferido: user.user_metadata?.nome_preferido || ''
              })
              .select()
              .single();
            if (createError) {
              console.error('[getCurrentUserProfile] Erro ao criar perfil gratuito:', createError);
              return null;
            }
            console.log('[getCurrentUserProfile] Perfil gratuito criado:', newProfile);
            // Buscar novamente o perfil criado para garantir consistência
            const { data: createdProfile, error: fetchCreatedError } = await supabase
              .from('perfis')
              .select('*')
              .eq('user_id', user.id)
              .limit(1)
              .single();
            if (fetchCreatedError) {
              console.error('[getCurrentUserProfile] Erro ao buscar perfil recém-criado:', fetchCreatedError);
              return newProfile || null;
            }
            console.log('[getCurrentUserProfile] Perfil recém-criado retornado:', createdProfile);
            return createdProfile;
          }
          console.error('[getCurrentUserProfile] Erro ao buscar perfil do usuário:', error);
          return null;
        }
        console.log('[getCurrentUserProfile] Perfil encontrado (cache):', data);
        return data;
      });
    } catch (error) {
      console.error('[getCurrentUserProfile] Erro inesperado:', error);
      return null;
    }
  }

  // Verificar se usuário pode criar material
  async canCreateMaterial(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado para criar material');
        return false;
      }

      const cacheKey = `can_create_${user.id}`;
      
      return await this.cachedQuery(cacheKey, async () => {
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
          const profile = await this.getCurrentUserProfile();
          if (!profile) return true;
          
          const limit = this.getPlanLimits(profile.plano_ativo);
          return profile.materiais_criados_mes_atual < limit;
        }
      }, 15000); // Cache mais longo para dados críticos
    } catch (error) {
      console.error('Erro em canCreateMaterial:', error);
      return false;
    }
  }

  // Incrementar uso de materiais
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
      unifiedCache.delete(`profile_${user.id}`);
      unifiedCache.delete(`can_create_${user.id}`);
      unifiedCache.delete(`remaining_${user.id}`);

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

  // Obter materiais restantes no mês
  async getRemainingMaterials(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Nenhum usuário para calcular materiais restantes');
        return 0;
      }

      const cacheKey = `remaining_${user.id}`;
      
      return await this.cachedQuery(cacheKey, async () => {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        );
        
        const queryPromise = supabase.rpc('get_remaining_materials', {
          p_user_id: user.id
        });

        try {
          const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

          if (error) {
            console.error('Erro ao obter materiais restantes:', error);
            return 5; // Fallback
          }

          const remaining = data || 0;
          console.log(`Materiais restantes: ${remaining}`);
          return remaining;
        } catch (timeoutError) {
          console.warn('Timeout ao calcular materiais restantes, usando fallback');
          return 5;
        }
      }, 15000);
    } catch (error) {
      console.error('Erro em getRemainingMaterials:', error);
      return 5;
    }
  }

  // Atualizar plano do usuário
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

      // Limpar todos os caches relacionados ao usuário
      const keysToDelete = Array.from(unifiedCache.keys()).filter(key => key.includes(user.id));
      keysToDelete.forEach(key => unifiedCache.delete(key));

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

  // Limpar cache
  clearCache(userId?: string): void {
    if (userId) {
      unifiedCache.delete(`profile_${userId}`);
      unifiedCache.delete(`can_create_${userId}`);
      unifiedCache.delete(`remaining_${userId}`);
    } else {
      unifiedCache.clear();
    }
    console.log('Cache limpo para usuário:', userId || 'todos');
  }

  // Forçar recarregamento do perfil
  async forceRefreshProfile(): Promise<PerfilUsuario | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    this.clearCache(user.id);
    return await this.getCurrentUserProfile();
  }
}

export const supabaseUnifiedPlanService = new SupabaseUnifiedPlanService();
