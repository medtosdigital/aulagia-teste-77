
import { supabase } from '@/integrations/supabase/client';
import { planExpirationService } from '@/services/planExpirationService';

export interface UserData {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  nome_preferido: string;
  plano_ativo: 'gratuito' | 'professor' | 'grupo_escolar' | 'admin';
  billing_type: string;
  data_inicio_plano: string;
  data_expiracao_plano: string | null;
  celular: string;
  escola: string;
  etapas_ensino: string[];
  anos_serie: string[];
  disciplinas: string[];
  tipo_material_favorito: string[];
  preferencia_bncc: boolean;
  avatar_url: string;
  materiais_criados_mes_atual: number;
  ano_atual: number;
  mes_atual: number;
  ultimo_reset_materiais: string;
  created_at: string;
  updated_at: string;
}

class UserDataService {
  // Verificar e corrigir dados do usuário
  async ensureUserData(userId: string, userEmail: string): Promise<UserData | null> {
    try {
      console.log('🔍 Verificando dados do usuário:', userId);
      
      // Buscar dados atuais
      const { data: currentData, error: fetchError } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar dados do usuário:', fetchError);
        return null;
      }

      // Se não existe, criar perfil completo usando o serviço de expiração
      if (!currentData) {
        console.log('📝 Criando perfil completo para usuário:', userId);
        
        const success = await planExpirationService.createInitialProfile(userId, userEmail);
        
        if (success) {
          // Buscar o perfil criado
          const { data: createdData, error: createError } = await supabase
            .from('perfis')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (createError) {
            console.error('❌ Erro ao buscar perfil criado:', createError);
            return null;
          }

          console.log('✅ Perfil criado com sucesso:', createdData);
          return this.convertToUserData(createdData);
        } else {
          console.error('❌ Erro ao criar perfil via serviço de expiração');
          return null;
        }
      }

      // Verificar se os dados estão completos
      const needsUpdate = this.checkDataCompleteness(currentData);
      
      if (needsUpdate) {
        console.log('🔄 Atualizando dados incompletos do usuário');
        
        const updateData = {
          email: currentData.email || userEmail,
          full_name: currentData.full_name || userEmail?.split('@')[0] || 'Usuário',
          nome_preferido: currentData.nome_preferido || userEmail?.split('@')[0] || 'Usuário',
          plano_ativo: (currentData.plano_ativo || 'gratuito') as 'gratuito' | 'professor' | 'grupo_escolar' | 'admin',
          billing_type: currentData.billing_type || 'monthly',
          data_inicio_plano: currentData.data_inicio_plano || new Date().toISOString(),
          materiais_criados_mes_atual: currentData.materiais_criados_mes_atual || 0,
          ano_atual: currentData.ano_atual || new Date().getFullYear(),
          mes_atual: currentData.mes_atual || new Date().getMonth() + 1,
          ultimo_reset_materiais: currentData.ultimo_reset_materiais || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: updatedData, error: updateError } = await supabase
          .from('perfis')
          .update(updateData)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Erro ao atualizar perfil:', updateError);
          return this.convertToUserData(currentData);
        }

        console.log('✅ Dados atualizados com sucesso:', updatedData);
        return this.convertToUserData(updatedData);
      }

      console.log('✅ Dados do usuário estão completos:', currentData);
      return this.convertToUserData(currentData);
    } catch (error) {
      console.error('❌ Erro em ensureUserData:', error);
      return null;
    }
  }

  // Convert database response to UserData interface
  private convertToUserData(data: any): UserData {
    return {
      id: data.id,
      user_id: data.user_id,
      email: data.email || '',
      full_name: data.full_name || '',
      nome_preferido: data.nome_preferido || '',
      plano_ativo: data.plano_ativo || 'gratuito',
      billing_type: data.billing_type || 'monthly',
      data_inicio_plano: data.data_inicio_plano || new Date().toISOString(),
      data_expiracao_plano: data.data_expiracao_plano,
      celular: data.celular || '',
      escola: data.escola || '',
      etapas_ensino: data.etapas_ensino || [],
      anos_serie: data.anos_serie || [],
      disciplinas: data.disciplinas || [],
      tipo_material_favorito: data.tipo_material_favorito || [],
      preferencia_bncc: data.preferencia_bncc || false,
      avatar_url: data.avatar_url || '',
      materiais_criados_mes_atual: data.materiais_criados_mes_atual || 0,
      ano_atual: data.ano_atual || new Date().getFullYear(),
      mes_atual: data.mes_atual || new Date().getMonth() + 1,
      ultimo_reset_materiais: data.ultimo_reset_materiais || new Date().toISOString(),
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    };
  }

  // Verificar se os dados estão completos
  private checkDataCompleteness(data: any): boolean {
    const requiredFields = [
      'email', 'full_name', 'nome_preferido', 'plano_ativo', 
      'billing_type', 'data_inicio_plano', 'materiais_criados_mes_atual',
      'ano_atual', 'mes_atual', 'ultimo_reset_materiais'
    ];

    return requiredFields.some(field => !data[field]);
  }

  // Obter dados do usuário
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar dados do usuário:', error);
        return null;
      }

      return this.convertToUserData(data);
    } catch (error) {
      console.error('❌ Erro em getUserData:', error);
      return null;
    }
  }

  // Atualizar dados do usuário
  async updateUserData(userId: string, data: Partial<UserData>): Promise<boolean> {
    try {
      // Create update object with proper typing
      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('perfis')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao atualizar dados do usuário:', error);
        return false;
      }

      console.log('✅ Dados do usuário atualizados com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro em updateUserData:', error);
      return false;
    }
  }
}

export const userDataService = new UserDataService();
