
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

      console.log('Buscando perfil para usuário:', user.id);

      // Verificar se é usuário admin primeiro
      if (user.email === 'medtosdigital@gmail.com') {
        console.log('ADMIN USER DETECTED - Using admin profile');
        const adminProfile: PerfilUsuario = {
          id: 'admin-profile',
          user_id: user.id,
          plano_ativo: 'admin' as TipoPlano,
          data_inicio_plano: new Date().toISOString(),
          data_expiracao_plano: null,
          materiais_criados_mes_atual: 0,
          ano_atual: new Date().getFullYear(),
          mes_atual: new Date().getMonth() + 1,
          ultimo_reset_materiais: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email: user.email,
          full_name: user.email,
          nome_preferido: 'Admin'
        };
        return adminProfile;
      }

      // Para usuários normais, buscar na tabela perfis
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        
        // Se o perfil não existe, criar um perfil básico
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating basic profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('perfis')
            .insert({
              user_id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
              nome_preferido: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
              plano_ativo: 'gratuito',
              billing_type: 'monthly',
              data_inicio_plano: new Date().toISOString(),
              data_expiracao_plano: null,
              celular: '',
              escola: '',
              etapas_ensino: [],
              anos_serie: [],
              disciplinas: [],
              tipo_material_favorito: [],
              preferencia_bncc: false,
              avatar_url: '',
              materiais_criados_mes_atual: 0,
              ano_atual: new Date().getFullYear(),
              mes_atual: new Date().getMonth() + 1,
              ultimo_reset_materiais: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            return null;
          }

          console.log('Basic profile created:', newProfile);
          return newProfile;
        }
        
        return null;
      }

      console.log('Perfil encontrado:', data);
      return data;
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

      // Para usuários normais, verificar perfil
      const profile = await this.getCurrentUserProfile();
      if (!profile) {
        console.log('No profile found, allowing creation');
        return true; // Permitir criação se não tem perfil (será criado)
      }

      const limit = this.getPlanLimits(profile.plano_ativo);
      const used = profile.materiais_criados_mes_atual || 0;
      
      console.log(`User can create material: ${used} < ${limit}`);
      return used < limit;
    } catch (error) {
      console.error('Erro em canCreateMaterial:', error);
      return true; // Em caso de erro, permitir criação
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

      // Admin não precisa incrementar
      if (user.email === 'medtosdigital@gmail.com') {
        console.log('Admin user - no increment needed');
        return true;
      }

      // Buscar perfil atual
      const profile = await this.getCurrentUserProfile();
      if (!profile) {
        console.log('No profile found, creating one');
        return true;
      }

      // Incrementar localmente
      const newCount = (profile.materiais_criados_mes_atual || 0) + 1;
      
      const { error } = await supabase
        .from('perfis')
        .update({ 
          materiais_criados_mes_atual: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao incrementar uso de material:', error);
        return false;
      }

      // Limpar caches relacionados
      this.clearUserCache(user.id);

      console.log('Uso de material incrementado para:', newCount);
      return true;
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
        console.log('Nenhum usuário autenticado para calcular materiais restantes');
        return 5; // Fallback para plano gratuito
      }

      // Admin tem materiais ilimitados
      if (user.email === 'medtosdigital@gmail.com') {
        console.log('Admin user - unlimited materials');
        return Infinity;
      }

      // Buscar perfil do usuário
      const profile = await this.getCurrentUserProfile();
      if (!profile) {
        console.log('No profile found, using default limit');
        return 5; // Limite do plano gratuito
      }

      const limit = this.getPlanLimits(profile.plano_ativo);
      const used = profile.materiais_criados_mes_atual || 0;
      const remaining = Math.max(0, limit - used);
      
      console.log(`Materiais restantes: ${remaining} (${used}/${limit})`);
      return remaining;
    } catch (error) {
      console.error('Erro ao calcular materiais restantes:', error);
      return 5; // Fallback para plano gratuito
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
