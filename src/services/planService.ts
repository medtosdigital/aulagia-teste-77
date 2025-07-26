
import { supabase } from '@/integrations/supabase/client';

export interface PerfilUsuario {
  user_id: string;
  email: string;
  full_name: string;
  nome_preferido: string;
  plano_ativo: 'gratuito' | 'professor' | 'grupo_escolar';
  billing_type: 'mensal' | 'anual';
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
  status_plano: string;
  customer_id: string | null;
  subscription_id: string | null;
  ultima_renovacao: string;
}

export interface PlanData {
  id: number;
  nome: string;
  descricao: string | null;
  preco_mensal: number;
  preco_anual: number;
  limite_materiais_mensal: number;
  pode_download_word: boolean;
  pode_download_ppt: boolean;
  pode_editar_materiais: boolean;
  pode_criar_slides: boolean;
  pode_criar_avaliacoes: boolean;
  tem_calendario: boolean;
  tem_historico: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Função utilitária para conversão
function normalizeBillingType(tipo: any): 'mensal' | 'anual' {
  if (tipo === 'yearly' || tipo === 'anual') return 'anual';
  return 'mensal';
}

class PlanService {
  // Método para criar perfil inicial (usado no LoginPage)
  async createProfile(userId: string, userEmail: string): Promise<boolean> {
    try {
      console.log(`📝 Criando perfil para ${userEmail}`);

      const profileData = {
        user_id: userId,
        email: userEmail,
        full_name: userEmail.split('@')[0] || 'Usuário',
        nome_preferido: userEmail.split('@')[0] || 'Usuário',
        plano_ativo: 'gratuito' as const,
        billing_type: 'mensal' as const,
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
        ultimo_reset_materiais: new Date().toISOString(),
        customer_id: null,
        subscription_id: null,
        ultima_renovacao: ''
      };

      const { error } = await supabase
        .from('perfis')
        .insert(profileData);

      if (error) {
        console.error(`❌ Erro ao criar perfil para ${userEmail}:`, error);
        return false;
      }

      console.log(`✅ Perfil criado para ${userEmail}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro em createProfile para ${userEmail}:`, error);
      return false;
    }
  }

  async getUserProfile(userId: string): Promise<PerfilUsuario | null> {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        return null;
      }

      return data as PerfilUsuario;
    } catch (error) {
      console.error('Erro em getUserProfile:', error);
      return null;
    }
  }

  async updateUserPlan(userId: string, planType: 'gratuito' | 'professor' | 'grupo_escolar', billingType: 'mensal' | 'anual'): Promise<boolean> {
    try {
      // Calcular data de expiração
      let dataExpiracao: Date | null = null;
      if (planType === 'gratuito') {
        // Plano gratuito não tem expiração
        dataExpiracao = null;
      } else if (billingType === 'mensal') {
        dataExpiracao = new Date();
        dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
      } else {
        dataExpiracao = new Date();
        dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1);
      }

      const { error } = await supabase
        .from('perfis')
        .update({
          plano_ativo: planType,
          billing_type: billingType,
          data_expiracao_plano: dataExpiracao?.toISOString() || null,
          data_inicio_plano: new Date().toISOString(),
          materiais_criados_mes_atual: 0,
          ultimo_reset_materiais: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao atualizar plano do usuário:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro em updateUserPlan:', error);
      return false;
    }
  }

  async getPlans(): Promise<PlanData[]> {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)
        .order('preco_mensal', { ascending: true });

      if (error) {
        console.error('Erro ao buscar planos:', error);
        return [];
      }

      return data as PlanData[];
    } catch (error) {
      console.error('Erro em getPlans:', error);
      return [];
    }
  }

  async canCreateMaterial(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('can_create_material', { p_user_id: userId });

      if (error) {
        console.error('Erro ao verificar limite de materiais:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Erro em canCreateMaterial:', error);
      return false;
    }
  }

  async incrementMaterialUsage(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('increment_material_usage', { p_user_id: userId });

      if (error) {
        console.error('Erro ao incrementar uso de materiais:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro em incrementMaterialUsage:', error);
      return false;
    }
  }

  async getRemainingMaterials(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_remaining_materials', { p_user_id: userId });

      if (error) {
        console.error('Erro ao obter materiais restantes:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Erro em getRemainingMaterials:', error);
      return 0;
    }
  }
}

export const planService = new PlanService();
