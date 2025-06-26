
import { materialService, GeneratedMaterial } from './materialService';
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

export interface StatsData {
  materialsByType: {
    'plano-de-aula': number;
    'slides': number;
    'atividade': number;
    'avaliacao': number;
  };
  materials: MaterialStats;
  activities: ActivityStats;
  schedule: ScheduleStats;
}

class StatsService {
  getMaterialStats(): MaterialStats {
    const materials = materialService.getMaterials();
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

    // Calcular crescimento semanal baseado nas atividades
    const recentActivities = activityService.getActivities().filter(
      activity => activity.timestamp >= oneWeekAgo && activity.type === 'created'
    );

    recentActivities.forEach(activity => {
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
  }

  getActivityStats(): ActivityStats {
    const activities = activityService.getActivities();
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

  getScheduleStats(): ScheduleStats {
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
  }

  getStats(): StatsData {
    const materials = materialService.getMaterials();
    
    return {
      materialsByType: {
        'plano-de-aula': materials.filter(m => m.type === 'plano-de-aula').length,
        'slides': materials.filter(m => m.type === 'slides').length,
        'atividade': materials.filter(m => m.type === 'atividade').length,
        'avaliacao': materials.filter(m => m.type === 'avaliacao').length,
      },
      materials: this.getMaterialStats(),
      activities: this.getActivityStats(),
      schedule: this.getScheduleStats()
    };
  }
}

export const statsService = new StatsService();
