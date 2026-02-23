import api from './api';

export interface MonthlyBreakdown {
  month: number;
  year: number;
  amount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
}

export interface TopCampaign {
  campaignId: string;
  title: string;
  totalDonated: number;
}

export interface DonorImpactData {
  totalMoneyDonated: number;
  totalItemsPledged: number;
  campaignsSupported: number;
  donorRank: number;
  badgesEarned: number;
  monthlyBreakdown: MonthlyBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
  topCampaigns: TopCampaign[];
}

export const getMyImpact = async (): Promise<DonorImpactData> => {
  const response = await api.get('/users/me/impact');
  return response.data.data;
};
