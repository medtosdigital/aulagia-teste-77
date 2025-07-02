import { materialService, GeneratedMaterial } from './materialService';
import { supabase } from '@/integrations/supabase/client';

export interface MaterialStats {
  totalMaterials: number;
  planoAula: number;
  slides: number;
  atividades: number;
  avaliacoes: number;
  weeklyGrowth: {
    planoAula: number;
    slides: number;
    atividades: number;
    avaliacoes: number;
  };
}

export interface ActivityStats {
  totalActivities: number;
  thisWeek: number;
  lastWeek: number;
  growthPercentage: number;
}

export interface ScheduleStats {
  totalScheduled: number;
  thisWeek: number;
  nextWeek: number;
  thisMonth: number;
}

class StatsService {
  async getMaterialStats(): Promise<MaterialStats> {
    const materials = await materialService.getMaterials();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const stats: MaterialStats = {
      totalMaterials: materials.length,
      planoAula: materials.filter(m => m.type === 'plano-de-aula').length,
      slides: materials.filter(m => m.type === 'slides').length,
      atividades: materials.filter(m => m.type === 'atividade').length,
      avaliacoes: materials.filter(m => m.type === 'avaliacao').length,
      weeklyGrowth: {
        planoAula: 0,
        slides: 0,
        atividades: 0,
        avaliacoes: 0
      }
    };

    try {
      // Get recent activities from the database
      const { data: recentActivities, error } = await supabase
        .from('user_activities')
        .select('*')
        .gte('created_at', oneWeekAgo.toISOString())
        .eq('type', 'created');

      if (error) {
        console.error('Error fetching recent activities:', error);
        return stats;
      }

      // Calculate weekly growth based on activities
      recentActivities?.forEach(activity => {
        if (activity.material_type) {
          switch (activity.material_type) {
            case 'plano-de-aula':
              stats.weeklyGrowth.planoAula++;
              break;
            case 'slides':
              stats.weeklyGrowth.slides++;
              break;
            case 'atividade':
              stats.weeklyGrowth.atividades++;
              break;
            case 'avaliacao':
              stats.weeklyGrowth.avaliacoes++;
              break;
          }
        }
      });
    } catch (error) {
      console.error('Error calculating weekly growth:', error);
    }

    return stats;
  }

  async getActivityStats(): Promise<ActivityStats> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    try {
      // Get all activities
      const { data: allActivities, error: allError } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (allError) {
        console.error('Error fetching all activities:', allError);
        return {
          totalActivities: 0,
          thisWeek: 0,
          lastWeek: 0,
          growthPercentage: 0
        };
      }

      // Get this week's activities
      const { data: thisWeekActivities, error: thisWeekError } = await supabase
        .from('user_activities')
        .select('*')
        .gte('created_at', oneWeekAgo.toISOString());

      if (thisWeekError) {
        console.error('Error fetching this week activities:', thisWeekError);
      }

      // Get last week's activities
      const { data: lastWeekActivities, error: lastWeekError } = await supabase
        .from('user_activities')
        .select('*')
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', oneWeekAgo.toISOString());

      if (lastWeekError) {
        console.error('Error fetching last week activities:', lastWeekError);
      }

      const thisWeek = thisWeekActivities?.length || 0;
      const lastWeek = lastWeekActivities?.length || 0;
      const growthPercentage = lastWeek === 0 ? 100 : ((thisWeek - lastWeek) / lastWeek) * 100;

      return {
        totalActivities: allActivities?.length || 0,
        thisWeek,
        lastWeek,
        growthPercentage: Math.round(growthPercentage)
      };
    } catch (error) {
      console.error('Error getting activity stats:', error);
      return {
        totalActivities: 0,
        thisWeek: 0,
        lastWeek: 0,
        growthPercentage: 0
      };
    }
  }

  async getScheduleStats(): Promise<ScheduleStats> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startOfNextWeek = new Date(endOfWeek);
    startOfNextWeek.setDate(endOfWeek.getDate() + 1);
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    try {
      // Get all calendar events
      const { data: allEvents, error: allError } = await supabase
        .from('calendar_events')
        .select('*');

      if (allError) {
        console.error('Error fetching all events:', allError);
        return {
          totalScheduled: 0,
          thisWeek: 0,
          nextWeek: 0,
          thisMonth: 0
        };
      }

      // Get this week's events
      const { data: thisWeekEvents, error: thisWeekError } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_date', startOfWeek.toISOString().split('T')[0])
        .lte('start_date', endOfWeek.toISOString().split('T')[0]);

      if (thisWeekError) {
        console.error('Error fetching this week events:', thisWeekError);
      }

      // Get next week's events
      const { data: nextWeekEvents, error: nextWeekError } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_date', startOfNextWeek.toISOString().split('T')[0])
        .lte('start_date', endOfNextWeek.toISOString().split('T')[0]);

      if (nextWeekError) {
        console.error('Error fetching next week events:', nextWeekError);
      }

      // Get this month's events
      const { data: thisMonthEvents, error: thisMonthError } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_date', startOfMonth.toISOString().split('T')[0])
        .lte('start_date', endOfMonth.toISOString().split('T')[0]);

      if (thisMonthError) {
        console.error('Error fetching this month events:', thisMonthError);
      }

      return {
        totalScheduled: allEvents?.length || 0,
        thisWeek: thisWeekEvents?.length || 0,
        nextWeek: nextWeekEvents?.length || 0,
        thisMonth: thisMonthEvents?.length || 0
      };
    } catch (error) {
      console.error('Error getting schedule stats:', error);
      return {
        totalScheduled: 0,
        thisWeek: 0,
        nextWeek: 0,
        thisMonth: 0
      };
    }
  }
}

export const statsService = new StatsService();