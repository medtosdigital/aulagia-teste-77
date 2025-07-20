
import { supabase } from '@/integrations/supabase/client';

export type TipoPlano = 'gratuito' | 'professor' | 'grupo_escolar' | 'admin';

export interface PerfilUsuario {
  id: string;
  user_id: string;
  plano_ativo: TipoPlano;
  data_inicio_plano: string;
  data_expiracao_plano: string | null;
  status_plano: 'ativo' | 'atrasado' | 'cancelado';
  ultima_renovacao: string;
  customer_id?: string;
  subscription_id?: string;
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

class SupabasePlanService {
  // Obter perfil do usuário atual
  async getCurrentUserPlan(): Promise<PerfilUsuario | null> {
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
          status_plano: 'ativo',
          ultima_renovacao: new Date().toISOString(),
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
              status_plano: 'ativo',
              ultima_renovacao: new Date().toISOString(),
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
      console.error('Erro em getCurrentUserPlan:', error);
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

      // Admin sempre pode criar
      if (user.email === 'medtosdigital@gmail.com') {
        console.log('Admin user can always create materials');
        return true;
      }

      // Usar a função do banco para verificar
      const { data, error } = await supabase.rpc('can_create_material', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Erro ao verificar se pode criar material:', error);
        return false;
      }

      console.log('User can create material:', data);
      return data || false;
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

      // Admin não precisa incrementar
      if (user.email === 'medtosdigital@gmail.com') {
        console.log('Admin user - no increment needed');
        return true;
      }

      // Usar a função do banco para incrementar
      const { data, error } = await supabase.rpc('increment_material_usage', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Erro ao incrementar uso de material:', error);
        return false;
      }

      console.log('Material usage incremented successfully');
      return data || true;
    } catch (error) {
      console.error('Erro em incrementMaterialUsage:', error);
      return false;
    }
  }

  // Obter materiais restantes
  async getRemainingMaterials(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Nenhum usuário autenticado para calcular materiais restantes');
        return 5;
      }

      // Admin tem materiais ilimitados
      if (user.email === 'medtosdigital@gmail.com') {
        console.log('Admin user - unlimited materials');
        return 999999;
      }

      // Usar a função do banco para obter materiais restantes
      const { data, error } = await supabase.rpc('get_remaining_materials', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Erro ao calcular materiais restantes:', error);
        return 5;
      }

      const remaining = data || 0;
      console.log('Materiais restantes:', remaining);
      return remaining;
    } catch (error) {
      console.error('Erro ao calcular materiais restantes:', error);
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

      // Usar a função do banco para atualizar plano
      const { data, error } = await supabase.rpc('update_user_plan', {
        p_user_id: user.id,
        p_new_plan: newPlan,
        p_expiration_date: expirationDate?.toISOString()
      });

      if (error) {
        console.error('Erro ao atualizar plano do usuário:', error);
        return false;
      }

      console.log('Plano atualizado com sucesso para:', newPlan);
      return data || true;
    } catch (error) {
      console.error('Erro em updateUserPlan:', error);
      return false;
    }
  }
}

export const supabasePlanService = new SupabasePlanService();
