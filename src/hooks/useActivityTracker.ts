
import { useEffect, useState } from 'react';
import { activityService, Activity } from '@/services/activityService';

export const useActivityTracker = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  const refreshActivities = () => {
    const recentActivities = activityService.getRecentActivities(10);
    setActivities(recentActivities);
  };

  const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity = activityService.addActivity(activity);
    refreshActivities();
    return newActivity;
  };

  useEffect(() => {
    refreshActivities();
    
    // Verificar por novas atividades a cada 5 segundos
    const interval = setInterval(refreshActivities, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    activities,
    addActivity,
    refreshActivities
  };
};
