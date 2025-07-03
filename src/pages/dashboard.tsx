// Add this import at the top
import { activityService } from '@/services/activityService';
import { useEffect, useState } from 'react';

// Inside your Dashboard component, add this state and effect
const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

useEffect(() => {
  const loadActivities = async () => {
    const activities = await activityService.getRecentActivities();
    setRecentActivities(activities);
  };
  loadActivities();
}, []);

// Then in your tab content, use the recentActivities state:
{/* Recent Activities Tab */}
{activeTab === 'recent' && (
  <div className="space-y-4">
    {recentActivities.map(activity => (
      <ActivityCard 
        key={activity.id}
        type={activity.type}
        title={activity.title}
        description={activity.description}
        timestamp={activity.timestamp}
      />
    ))}
  </div>
)}
