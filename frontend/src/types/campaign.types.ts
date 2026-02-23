
export type CampaignStatus = "DRAFT" | "PENDING_VERIFICATION" | "LIVE" | "SUSPENDED" | "COMPLETED";

export type CampaignCategory =
  | "education" | "health" | "disaster" | "community" | "animals"
  | "arts" | "business" | "emergency" | "environment" | "other" | "general";

export const CAMPAIGN_CATEGORIES: { value: CampaignCategory; label: string }[] = [
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "disaster", label: "Disaster Relief" },
  { value: "community", label: "Community" },
  { value: "animals", label: "Animals" },
  { value: "arts", label: "Arts & Culture" },
  { value: "business", label: "Business" },
  { value: "emergency", label: "Emergency" },
  { value: "environment", label: "Environment" },
  { value: "other", label: "Other" },
];

export interface Milestone {
  id: string;
  campaignId: string;
  title: string;
  amount: string;
  completed: boolean;
  fundsReleased?: boolean;
  releasedAmount?: string | null;
  releasedAt?: string | null;
  verifiedBy?: string | null;
  claimStatus?: 'UNCLAIMED' | 'CLAIMED' | 'APPROVED' | 'REJECTED';
  claimProof?: string | null;
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
  category: CampaignCategory;
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
  category?: CampaignCategory;
  coverImage: File;
  proofs?: File[];
}

export interface UpdateCampaignData {
  title?: string;
  description?: string;
  targetAmount?: number;
  category?: CampaignCategory;
  status?: CampaignStatus;
}

export interface AddMilestoneData {
  title: string;
  amount: number; // For submission
}

export interface CampaignFilters {
  category?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  sort?: string;
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
