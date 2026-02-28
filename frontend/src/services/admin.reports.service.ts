import api from "./api";

// ─── Overview Report ───────────────────────────────────────────────

export interface MonthlyCollection {
  year: number;
  month: number;
  amount: number;
  cumulative: number;
}

export interface CategoryDistribution {
  category: string;
  amount: number;
}

export interface OverviewReportData {
  totalAllTime: number;
  thisMonth: number;
  activeRecurring: number;
  avgDonation: number;
  totalRecurringPaid: number;
  totalRecurringCount: number;
  monthlyCollections: MonthlyCollection[];
  categoryDistribution: CategoryDistribution[];
}

// ─── Campaign Reports ──────────────────────────────────────────────

export interface CampaignMonthly {
  year: number;
  month: number;
  amount: number;
}

export interface CampaignReportItem {
  id: string;
  title: string;
  status: string;
  category: string;
  target: number;
  totalRaised: number;
  progressPercent: number;
  donations: number;
  visits: number;
  shares: number;
  monthlyBreakdown: CampaignMonthly[];
}

export interface CampaignReportsData {
  campaigns: CampaignReportItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  categories: string[];
}

// ─── User Analytics ────────────────────────────────────────────────

export interface UserGrowthPoint {
  year: number;
  month: number;
  newUsers: number;
  cumulative: number;
}

export interface DonorRange {
  range: string;
  count: number;
}

export interface TopDonorReport {
  rank: number;
  id: string;
  name: string;
  email: string;
  totalDonated: number;
  donationCount: number;
  itemCount: number;
  lastDonationAt: string | null;
  joinedAt: string;
}

export interface UserAnalyticsData {
  totalUsers: number;
  totalDonors: number;
  donorRatio: number;
  userGrowth: UserGrowthPoint[];
  donorDistribution: DonorRange[];
  topDonors: TopDonorReport[];
}

// ─── Collection Report ─────────────────────────────────────────────

export interface PeriodEntry {
  period: string;
  amount: number;
  count: number;
  changePct: number;
}

export interface CollectionReportData {
  period: string;
  totalAllTime: number;
  avgPerPeriod: number;
  bestPeriod: { period: string; amount: number };
  periodData: PeriodEntry[];
}

// ─── API Functions ─────────────────────────────────────────────────

export const getOverviewReport = async (): Promise<OverviewReportData> => {
  const response = await api.get<{ success: boolean; data: OverviewReportData }>(
    "/admin/reports/overview"
  );
  return response.data.data;
};

export const getCampaignReports = async (params?: {
  search?: string;
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<CampaignReportsData> => {
  const response = await api.get<{ success: boolean; data: CampaignReportsData }>(
    "/admin/reports/campaigns",
    { params }
  );
  return response.data.data;
};

export const getUserAnalytics = async (): Promise<UserAnalyticsData> => {
  const response = await api.get<{ success: boolean; data: UserAnalyticsData }>(
    "/admin/reports/users"
  );
  return response.data.data;
};

export const getCollectionReport = async (
  period: "monthly" | "weekly" = "monthly"
): Promise<CollectionReportData> => {
  const response = await api.get<{ success: boolean; data: CollectionReportData }>(
    "/admin/reports/collections",
    { params: { period } }
  );
  return response.data.data;
};
