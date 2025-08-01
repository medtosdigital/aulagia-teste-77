
import { useEffect, useState } from 'react';
import { activityService, Activity } from '@/services/activityService';

export const useActivityTracker = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  const refreshActivities = async () => {
    console.log('🔄 Refreshing activities...');
    const recentActivities = await activityService.getRecentActivities(10);
    console.log('📊 Recent activities found:', recentActivities);
    setActivities(recentActivities);
  };

  const addActivity = async (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    console.log('➕ Adding new activity:', activity);
    const newActivity = await activityService.addActivity(activity);
    console.log('✅ Activity added:', newActivity);
    await refreshActivities();
    return newActivity;
  };

  useEffect(() => {
    console.log('🚀 useActivityTracker initialized');
    refreshActivities();
    
    // Verificar por novas atividades a cada 5 segundos
    const interval = setInterval(() => {
      console.log('⏰ Auto-refreshing activities...');
      refreshActivities();
    }, 5000);
    
    return () => {
      console.log('🛑 useActivityTracker cleanup');
      clearInterval(interval);
    };
  }, []);

  return {
    activities,
    addActivity,
    refreshActivities
  };
};
