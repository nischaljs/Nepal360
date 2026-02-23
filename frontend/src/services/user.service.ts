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
  const response = await api.get<UserStats>('/users/me/stats');
  return response.data;
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
  const response = await api.get<UserStats>(`/users/${userId}/stats`);
  return response.data;
};

export const getMyBadges = async (): Promise<UserBadge[]> => {
  const response = await api.get<UserBadge[]>('/users/me/badges');
  return response.data;
};

export const getMyDonationHistory = async (): Promise<DonationHistoryItem[]> => {
  const response = await api.get<DonationHistoryItem[]>('/users/me/donations');
  return response.data;
};
