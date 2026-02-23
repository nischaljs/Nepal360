import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Activity as ActivityIcon, CircleDollarSign, Gift, Megaphone, Zap } from 'lucide-react';
import { getActivityFeed, type Activity } from '../services/activity.service';

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Live Activity | Nepal360';
    fetchActivities();
    const interval = setInterval(fetchActivities, 15000); // Poll every 15 sec
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await getActivityFeed();
      setActivities(data);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'donation': return <CircleDollarSign className="w-5 h-5 text-emerald-600" />;
      case 'campaign': return <Megaphone className="w-5 h-5 text-blue-600" />;
      case 'item': return <Gift className="w-5 h-5 text-amber-600" />;
      default: return <Zap className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'donation': return 'bg-emerald-100 dark:bg-emerald-900/30';
      case 'campaign': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'item': return 'bg-amber-100 dark:bg-amber-900/30';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 mb-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
          <ActivityIcon className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Activity</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time updates from across the platform
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-600">LIVE</span>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-20">
          <ActivityIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No activity yet</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-1">
            {activities.map((activity, index) => (
              <div
                key={`${activity.type}-${activity.id}`}
                className="relative flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon */}
                <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full ${getBgColor(activity.type)} flex items-center justify-center`}>
                  {getIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {activity.message}{' '}
                    {activity.type !== 'campaign' && (
                      <Link
                        to={`/campaigns/${activity.campaignId}`}
                        className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        {activity.campaignTitle}
                      </Link>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
