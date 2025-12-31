// frontend/src/types/admin.campaign.types.ts

import type{ Campaign, CampaignStatus } from "./campaign.types";

export interface AdminCampaignListItem {
  id: string;
  title: string;
  beneficiary: {
    id: string;
    name: string;
    email: string;
  };
  targetAmount: string; // Using string for monetary values
  donationCount: number;
  status: CampaignStatus;
  isActive: boolean;
  createdAt: string; // ISO 8601 timestamp
  verifiedAt: string | null; // ISO 8601 timestamp (nullable)
  rejectionReason: string | null;
}

export interface AdminCampaignDetail extends Campaign {
  // Inherits all fields from Campaign, plus admin-specific metadata
  // Fields like rejectionReason, suspensionReason, verifiedBy etc. are already in Campaign type
  // This type is mostly for clarity and to ensure we fetch all data that an admin would need.
}

export interface AdminCampaignFilter {
  status?: CampaignStatus;
  beneficiaryId?: string;
  isActive?: boolean;
  sortBy?: "createdAt" | "verifiedAt" | "donationCount";
  order?: "asc" | "desc";
}

export interface AdminCampaignVerificationQueueItem {
  id: string;
  title: string;
  beneficiary: {
    id: string;
    name: string;
    email: string;
  };
  targetAmount: string;
  createdAt: string;
  daysWaiting: number;
}

export interface ApproveCampaignData {
  note?: string;
}

export interface RejectCampaignData {
  reason: string;
  note?: string;
}

export interface SuspendCampaignData {
  reason: string;
  note?: string;
}

export interface DeleteCampaignData {
  reason: string;
  note?: string;
}

// API Responses
export interface AdminCampaignsResponse {
  success: boolean;
  campaigns: AdminCampaignListItem[];
}

export interface AdminCampaignDetailResponse {
  success: boolean;
  campaign: AdminCampaignDetail;
}

export interface AdminCampaignVerificationQueueResponse {
  success: boolean;
  queue: AdminCampaignVerificationQueueItem[];
}

export interface AdminCampaignStats {
  campaignId: string;
  totalRaised: string;
  donationCount: number;
  averageDonation: string;
  itemDonationCount: number;
  shareCount: number;
  viewCount: number;
  completionPercentage: number;
  milestonesCompleted: number;
  totalMilestones: number;
}

export interface AdminCampaignStatsResponse {
  success: boolean;
  stats: AdminCampaignStats;
}

export interface AdminCampaignActionResponse {
  success: boolean;
  message: string;
  campaign?: Campaign; // May return the updated campaign object
}

export interface AdminMessageResponse {
  success: boolean;
  message: string;
}
