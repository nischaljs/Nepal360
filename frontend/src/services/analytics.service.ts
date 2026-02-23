import api from './api';

export interface DonationTrendItem {
  date: string;
  amount: number;
  count: number;
}

export interface HourlyDonation {
  hour: number;
  amount: number;
  count: number;
}

export interface TopDonor {
  donorId: string;
  name: string;
  totalDonated: number;
}

export interface RecentActivity {
  id: string;
  type: 'money' | 'item';
  donorName: string;
  amount?: number;
  itemName?: string;
  quantity?: string;
  createdAt: string;
}

export interface CampaignAnalyticsData {
  totalMoneyRaised: number;
  totalItemDonations: number;
  totalDonors: number;
  visitors: number;
  shares: number;
  conversionRate: number;
  averageDonation: number;
  donationTrend: DonationTrendItem[];
  donationsByHour: HourlyDonation[];
  topDonors: TopDonor[];
  recentActivity: RecentActivity[];
}

export const getCampaignAnalytics = async (campaignId: string): Promise<CampaignAnalyticsData> => {
  const response = await api.get(`/campaigns/${campaignId}/analytics`);
  return response.data.data;
};
