import api from './api';

export interface UserStats {
  userId: string;
  totalMoneyDonated: string;
  totalItemCount: number;
  donationCount: number;
  lastDonationAt: string | null;
}

export interface UserBadge {
  id: string;
  badgeId: string;
  awardedAt: string;
  badge: {
    id: string;
    code: string;
    name: string;
    description: string;
    iconUrl: string;
    badgeType: string;
  };
}

export interface DonationHistoryItem {
  id: string;
  type: 'Money' | 'Item';
  amount?: string;
  itemName?: string;
  quantity?: string;
  status: string;
  visibility?: string;
  campaign: {
    id: string;
    title: string;
  };
  createdAt: string;
}

export const getMyStats = async (): Promise<UserStats> => {
  const { data } = await api.get('/users/me/stats');
  return data.data;
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
  const { data } = await api.get(`/users/${userId}/stats`);
  return data.data;
};

export const getMyBadges = async (): Promise<UserBadge[]> => {
  const { data } = await api.get('/users/me/badges');
  return data.data;
};

export const getMyDonationHistory = async (): Promise<DonationHistoryItem[]> => {
  const { data } = await api.get('/users/me/donations');
  return data.data;
};
