
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
    console.log('📦 Raw stored activities:', stored);
    
    if (!stored) {
      console.log('❌ No activities found in localStorage');
      return [];
    }
    
    try {
      const activities = JSON.parse(stored);
      const processedActivities = activities.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      })).sort((a: Activity, b: Activity) => b.timestamp.getTime() - a.timestamp.getTime());
      
      console.log('✅ Processed activities:', processedActivities);
      return processedActivities;
    } catch (error) {
      console.error('❌ Error parsing activities:', error);
      return [];
    }
  }

  addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Activity {
    console.log('➕ Adding activity to service:', activity);
    
    const activities = this.getActivities();
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    console.log('🆕 New activity created:', newActivity);
    
    activities.unshift(newActivity);
    
    // Manter apenas os últimos 50 registros
    const limitedActivities = activities.slice(0, 50);
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(limitedActivities));
      console.log('💾 Activities saved to localStorage:', limitedActivities.length, 'total');
    } catch (error) {
      console.error('❌ Error saving activities:', error);
    }
    
    return newActivity;
  }

  getRecentActivities(limit: number = 10): Activity[] {
    const activities = this.getActivities();
    const recent = activities.slice(0, limit);
    console.log(`📋 Getting ${limit} recent activities:`, recent);
    return recent;
  }

  getActivitiesByType(type: Activity['type']): Activity[] {
    return this.getActivities().filter(activity => activity.type === type);
  }

  clearActivities(): void {
    console.log('🗑️ Clearing all activities');
    localStorage.removeItem(this.storageKey);
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
