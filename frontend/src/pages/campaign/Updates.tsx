/**
 * Campaign Updates Page
 * 
 * Displays impact stories and updates for a campaign
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCampaignUpdates, type CampaignUpdate } from '../../services/campaignUpdate.service';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Spinner } from '../../components/ui/spinner';

export default function CampaignUpdatesPage() {
  const { id: campaignId } = useParams<{ id: string }>();
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    getCampaignUpdates(campaignId)
      .then((data) => setUpdates(data.updates))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Failed to load updates: {error}
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No updates yet</p>
        <p className="text-sm">Check back later for impact stories from this campaign</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Campaign Updates</h2>
      
      <div className="grid gap-6">
        {updates.map((update) => (
          <Card key={update.id} className="overflow-hidden">
            {update.isMilestone && (
              <div className="bg-green-500 text-white px-4 py-1 text-sm font-medium">
                🎉 Milestone Achieved!
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{update.title}</h3>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                </span>
              </div>
              {update.user && (
                <p className="text-sm text-gray-600">
                  Posted by {update.user.name}
                </p>
              )}
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{update.content}</p>
              
              {update.images && update.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {update.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Update image ${index + 1}`}
                      className="rounded-lg object-cover aspect-video"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
