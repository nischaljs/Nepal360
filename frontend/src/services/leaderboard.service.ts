import api from './api';

export interface Leaderboard {
  id: string;
  period: 'MONTHLY' | 'CAMPAIGN' | 'YEARLY';
  periodKey: string;
  createdAt: string;
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  totalAmount: string;
  totalItems: number;
  isAnonymous: boolean;
  user: {
    id: string;
    name: string;
  };
}

export interface LeaderboardResponse {
  id: string;
  period: string;
  periodKey: string;
  createdAt: string;
  entries: LeaderboardEntry[];
}

export const listLeaderboards = async (): Promise<Leaderboard[]> => {
  const { data } = await api.get('/leaderboards');
  return data.data;
};

export const getLeaderboard = async (period: string, key: string): Promise<LeaderboardResponse> => {
  const { data } = await api.get(`/leaderboards/${period}/${key}`);
  return data.data;
};

export const getCurrentMonthLeaderboard = async (): Promise<LeaderboardResponse> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return getLeaderboard('MONTHLY', `${year}-${month}`);
};

export const getCurrentYearLeaderboard = async (): Promise<LeaderboardResponse> => {
  const year = new Date().getFullYear();
  return getLeaderboard('YEARLY', String(year));
};
