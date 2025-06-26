
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
  private storageKey = 'teaching-materials-activities';

  getActivities(): Activity[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    
    const activities = JSON.parse(stored);
    return activities.map((activity: any) => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    })).sort((a: Activity, b: Activity) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Activity {
    const activities = this.getActivities();
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    activities.unshift(newActivity);
    
    // Manter apenas os últimos 50 registros
    const limitedActivities = activities.slice(0, 50);
    localStorage.setItem(this.storageKey, JSON.stringify(limitedActivities));
    
    return newActivity;
  }

  getRecentActivities(limit: number = 10): Activity[] {
    return this.getActivities().slice(0, limit);
  }

  getActivitiesByType(type: Activity['type']): Activity[] {
    return this.getActivities().filter(activity => activity.type === type);
  }

  clearActivities(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const activityService = new ActivityService();
