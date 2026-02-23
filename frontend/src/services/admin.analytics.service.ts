import api from "./api";

export interface AnalyticsOverview {
  totalUsers: number;
  totalCampaigns: number;
  totalMoneyDonations: number;
  totalItemDonations: number;
  totalFundsRaised: number;
}

export interface MonthlyTrend {
  month: number;
  year: number;
  newUsers: number;
  newCampaigns: number;
  totalDonated: number;
  donationCount: number;
}

export interface TopCampaign {
  id: string;
  title: string;
  targetAmount: number;
  totalRaised: number;
  donationCount: number;
  status: string;
}

export interface TopDonor {
  id: string;
  name: string;
  email: string;
  totalDonated: number;
  donationCount: number;
}

export interface AuditLogEntry {
  id: string;
  actorType: string;
  actorId: string | null;
  actionType: string;
  targetType: string;
  targetId: string;
  note: string | null;
  createdAt: string;
  actor: { name: string } | null;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  monthlyTrends: MonthlyTrend[];
  campaignStats: { byStatus: Record<string, number> };
  topCampaigns: TopCampaign[];
  topDonors: TopDonor[];
  kycStats: Record<string, number>;
  recentActivity: AuditLogEntry[];
}

export const getAdminAnalytics = async (): Promise<AnalyticsData> => {
  const response = await api.get<{ success: boolean; data: AnalyticsData }>(
    "/admin/analytics"
  );
  return response.data.data;
};
