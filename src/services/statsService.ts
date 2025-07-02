<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { materialService, GeneratedMaterial } from './materialService';
=======
import { supabase } from '@/integrations/supabase/client';
>>>>>>> Stashed changes
=======
import { supabase } from '@/integrations/supabase/client';
>>>>>>> Stashed changes
import { activityService } from './activityService';
import { supabaseScheduleService } from './supabaseScheduleService';

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
    // Busca todas as atividades de criação de material do usuário
    const activities = await activityService.getRecentActivities(1000);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const stats: MaterialStats = {
      totalMaterials: activities.length,
      planoAula: activities.filter(m => m.materialType === 'plano-de-aula').length,
      slides: activities.filter(m => m.materialType === 'slides').length,
      atividades: activities.filter(m => m.materialType === 'atividade').length,
      avaliacoes: activities.filter(m => m.materialType === 'avaliacao').length,
      weeklyGrowth: {
        planoAula: 0,
        slides: 0,
        atividades: 0,
        avaliacoes: 0
      }
    };

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    // Calcular crescimento semanal baseado nas atividades
    const recentActivities = await activityService.getRecentActivities();
    const filteredActivities = recentActivities.filter(
      activity => activity.timestamp >= oneWeekAgo && activity.type === 'created'
    );

    filteredActivities.forEach(activity => {
      if (activity.materialType) {
=======
    activities.forEach(activity => {
      if (activity.materialType && activity.timestamp >= oneWeekAgo && activity.type === 'created') {
>>>>>>> Stashed changes
=======
    activities.forEach(activity => {
      if (activity.materialType && activity.timestamp >= oneWeekAgo && activity.type === 'created') {
>>>>>>> Stashed changes
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
  }

  async getActivityStats(): Promise<ActivityStats> {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    const activities = await activityService.getRecentActivities();
=======
    const activities = await activityService.getRecentActivities(1000);
>>>>>>> Stashed changes
=======
    const activities = await activityService.getRecentActivities(1000);
>>>>>>> Stashed changes
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

    // Buscar eventos do Supabase
    const events = await supabaseScheduleService.getEventsByDateRange(startOfMonth, endOfMonth);

    return {
      totalScheduled: events.length,
      thisWeek: events.filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      }).length,
      nextWeek: events.filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate >= startOfNextWeek && eventDate <= endOfNextWeek;
      }).length,
      thisMonth: events.length
    };
  }
}

export const statsService = new StatsService();