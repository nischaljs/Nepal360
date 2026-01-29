
export type CampaignStatus = "DRAFT" | "PENDING_VERIFICATION" | "LIVE" | "SUSPENDED" | "COMPLETED";

export interface Milestone {
  id: string;
  campaignId: string;
  title: string;
  amount: string;
  completed: boolean;
  createdAt: string; 
}

export interface Campaign {
  id: string;
  beneficiaryId: string;
  beneficiary: {
    id: string;
    name: string;
    email: string;
  };
  title: string;
  description: string;
  coverImage: string;
  proofLinks: string[]; 
  targetAmount: string; 
  status: CampaignStatus;
  donationCount: number;
  shareCount: number;
  viewCount: number;
  visits?: number;
  createdAt: string; 
  verifiedAt: string | null; 
  rejectionReason?: string | null;
  suspensionReason?: string | null;
  verifiedBy?: string | null;
  rejectedBy?: string | null;
  suspendedBy?: string | null;
  rejectedAt?: string | null;
  suspendedAt?: string | null;
  deletedAt?: string | null;
  isActive?: boolean;
  milestones: Milestone[];
  totalMoneyRaised?: number;
}

export interface CreateCampaignData {
  title: string;
  description: string;
  targetAmount: number; 
  coverImage: File;
  proofs?: File[];
}

export interface UpdateCampaignData {
  title?: string;
  description?: string;
  targetAmount?: number; // For submission
  status?: CampaignStatus;
}

export interface AddMilestoneData {
  title: string;
  amount: number; // For submission
}

// API Responses
export interface CampaignResponse {
  success: boolean;
  campaign: Campaign;
}

export interface CampaignsResponse {
  success: boolean;
  campaigns: Campaign[];
}

export interface MilestoneResponse {
  success: boolean;
  milestone: Milestone;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}
