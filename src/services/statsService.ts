import { supabase } from '@/integrations/supabase/client';
import { activityService } from './activityService';
import { scheduleService } from './scheduleService';

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return this.getDefaultStats();
      }

      // Buscar estatísticas diretamente do banco com queries otimizadas
      const { data: materials, error } = await supabase
        .from('materiais')
        .select('tipo_material, created_at')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao buscar estatísticas de materiais:', error);
        return this.getDefaultStats();
      }

      const stats: MaterialStats = {
        totalMaterials: materials?.length || 0,
        planoAula: materials?.filter(m => m.tipo_material === 'plano-de-aula').length || 0,
        slides: materials?.filter(m => m.tipo_material === 'slides').length || 0,
        atividades: materials?.filter(m => m.tipo_material === 'atividade').length || 0,
        avaliacoes: materials?.filter(m => m.tipo_material === 'avaliacao').length || 0,
        weeklyGrowth: {
          planoAula: 0,
          slides: 0,
          atividades: 0,
          avaliacoes: 0
        }
      };

      // Calcular crescimento semanal baseado nas atividades
      const recentActivities = await activityService.getRecentActivities(50);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const filteredActivities = recentActivities.filter(
        activity => activity.timestamp >= oneWeekAgo && activity.type === 'created'
      );

      filteredActivities.forEach(activity => {
        if (activity.materialType) {
          switch (activity.materialType) {
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

      return stats;
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      return this.getDefaultStats();
    }
  }

  private getDefaultStats(): MaterialStats {
    return {
      totalMaterials: 0,
      planoAula: 0,
      slides: 0,
      atividades: 0,
      avaliacoes: 0,
      weeklyGrowth: {
        planoAula: 0,
        slides: 0,
        atividades: 0,
        avaliacoes: 0
      }
    };
  }

  async getActivityStats(): Promise<ActivityStats> {
    try {
      const activities = await activityService.getRecentActivities(100);
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const thisWeek = activities.filter(activity => activity.timestamp >= oneWeekAgo).length;
      const lastWeek = activities.filter(
        activity => activity.timestamp >= twoWeeksAgo && activity.timestamp < oneWeekAgo
      ).length;

      const growthPercentage = lastWeek === 0 ? 100 : ((thisWeek - lastWeek) / lastWeek) * 100;

      return {
        totalActivities: activities.length,
        thisWeek,
        lastWeek,
        growthPercentage: Math.round(growthPercentage)
      };
    } catch (error) {
      console.error('Erro ao carregar estatísticas de atividades:', error);
      return {
        totalActivities: 0,
        thisWeek: 0,
        lastWeek: 0,
        growthPercentage: 0
      };
    }
  }

  getScheduleStats(): ScheduleStats {
    try {
      const events = scheduleService.getEvents();
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

      return {
        totalScheduled: events.length,
        thisWeek: events.filter(event => 
          event.startDate >= startOfWeek && event.startDate <= endOfWeek
        ).length,
        nextWeek: events.filter(event => 
          event.startDate >= startOfNextWeek && event.startDate <= endOfNextWeek
        ).length,
        thisMonth: events.filter(event => 
          event.startDate >= startOfMonth && event.startDate <= endOfMonth
        ).length
      };
    } catch (error) {
      console.error('Erro ao carregar estatísticas de agenda:', error);
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
