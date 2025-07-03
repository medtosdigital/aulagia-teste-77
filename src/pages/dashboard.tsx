import { activityService, Activity } from '@/services/activityService';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState('recent');

  useEffect(() => {
    const loadActivities = async () => {
      const activities = await activityService.getRecentActivities();
      setRecentActivities(activities);
    };
    loadActivities();
  }, []);

  const ActivityCard = ({ type, title, description }: { type: string; title: string; description: string }) => (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{type}</span>
    </div>
  );

  return (
    <div>
      {activeTab === 'recent' && (
        <div className="space-y-4">
          {recentActivities.map(activity => (
            <ActivityCard 
              key={activity.id}
              type={activity.type}
              title={activity.title}
              description={activity.description}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;