
import { supabase } from '@/integrations/supabase/client';

interface ActivityLog {
  type: 'created' | 'updated' | 'deleted';
  title: string;
  description: string;
  materialType?: string;
  materialId?: string;
}

class ActivityService {
  async logActivity(activity: ActivityLog): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: activity.type,
          title: activity.title,
          description: activity.description,
          material_type: activity.materialType,
          material_id: activity.materialId,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao registrar atividade:', error);
      }
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  }

  async getActivities(limit: number = 50) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar atividades:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      return [];
    }
  }
}

export const activityService = new ActivityService();
