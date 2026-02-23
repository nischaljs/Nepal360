import api from './api';

export interface Activity {
  type: 'donation' | 'campaign' | 'item';
  id: string;
  message: string;
  campaignId: string;
  campaignTitle: string;
  timestamp: string;
}

export const getActivityFeed = async (): Promise<Activity[]> => {
  const { data } = await api.get('/activity');
  return data.data;
};
