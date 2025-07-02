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
  async addActivity(activity: Omit<Activity, 'id' | 'timestamp'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

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
      console.error('Error saving activity:', error);
      return null;
    }
    return data;
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }

    return data.map((a: any) => ({
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

  async clearActivities() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_activities')
      .delete()
      .eq('user_id', user.id);
  }
}

export const activityService = new ActivityService();
