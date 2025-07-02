import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Activity {
  id: string;
  type: 'created' | 'exported' | 'updated' | 'scheduled';
  title: string;
  description: string;
  materialType?: 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao';
  materialId?: string;
  timestamp: Date;
  subject?: string;
  grade?: string;
}

class ActivityService {
  // Adiciona uma atividade no Supabase
  async addActivity(activity: Omit<Activity, 'id' | 'timestamp'>) {
    // Buscar usuário logado
    const user = JSON.parse(localStorage.getItem('supabase.auth.user') || 'null');
    if (!user || !user.id) return null;
    const { data, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        material_type: activity.materialType,
        material_id: activity.materialId,
        subject: activity.subject,
        grade: activity.grade
      })
      .select()
      .single();
    if (error) {
      console.error('Erro ao registrar atividade no Supabase:', error);
      return null;
    }
    return data;
  }

  // Busca as atividades recentes do usuário logado
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    const user = JSON.parse(localStorage.getItem('supabase.auth.user') || 'null');
    if (!user || !user.id) return [];
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('Erro ao buscar atividades no Supabase:', error);
      return [];
    }
    return (data || []).map((a: any) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      materialType: a.material_type,
      materialId: a.material_id,
      timestamp: new Date(a.created_at),
      subject: a.subject,
      grade: a.grade
    }));
  }

  // Limpa todas as atividades do usuário logado
  async clearActivities() {
    const user = JSON.parse(localStorage.getItem('supabase.auth.user') || 'null');
    if (!user || !user.id) return;
    await supabase
      .from('user_activities')
      .delete()
      .eq('user_id', user.id);
  }
}

export const activityService = new ActivityService();

// Limpar atividades de teste existentes se elas estiverem presentes
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const existingActivities = activityService.getActivities();
    
    // Verificar se há atividades de teste e removê-las
    const hasTestActivities = existingActivities.some(activity => 
      (activity.title === 'Plano de Aula - Matemática' && activity.description === 'Criado plano de aula sobre frações') ||
      (activity.title === 'Slides - História' && activity.description === 'Exportado slides sobre Brasil Colonial') ||
      (activity.title === 'Atividade - Português' && activity.description === 'Atualizada atividade de interpretação de texto')
    );
    
    if (hasTestActivities) {
      console.log('🧹 Removing test activities...');
      activityService.clearActivities();
    }
  }, 500);
}
