/**
 * Admin Campaign Types
 *
 * Types for admin-side campaign management operations
 */

import { CampaignStatus } from '../../generated/prisma/enums';

/**
 * Campaign for admin review
 * Includes admin-specific fields and metadata
 */
export interface AdminCampaignDetail {
    id: string;
    beneficiaryId: string;
    beneficiary: {
        id: string;
        name: string;
        email: string;
    };
    title: string;
    description: string;
    coverImage: string; // Complete URL
    proofLinks: string[]; // Array of complete URLs
    targetAmount: number;
    status: CampaignStatus;
    donationCount: number;
    shareCount: number;
    viewCount: number;
    isActive: boolean;

    // Admin fields
    rejectionReason?: string | null;
    suspensionReason?: string | null;
    verifiedBy?: string | null;
    rejectedBy?: string | null;
    suspendedBy?: string | null;

    createdAt: Date;
    verifiedAt?: Date | null;
    rejectedAt?: Date | null;
    suspendedAt?: Date | null;
    deletedAt?: Date | null;

    milestones: {
        id: string;
        title: string;
        amount: number;
        completed: boolean;
    }[];
}

/**
 * Campaign for admin list view
 * Lightweight version for dashboards
 */
export interface AdminCampaignListItem {
    id: string;
    title: string;
    beneficiary: {
        id: string;
        name: string;
        email: string;
    };
    targetAmount: number;
    donationCount: number;
    status: CampaignStatus;
    isActive: boolean;
    createdAt: Date;
    verifiedAt?: Date | null;
    rejectionReason?: string | null;
}

/**
 * Campaign approval request
 */
export interface ApproveCampaignRequest {
    note?: string;
}

/**
 * Campaign rejection request
 */
export interface RejectCampaignRequest {
    reason: string; // Required reason for rejection
    note?: string;
}

/**
 * Campaign suspension request
 */
export interface SuspendCampaignRequest {
    reason: string; // Required reason for suspension
    note?: string;
}

/**
 * Campaign deletion (soft delete) request
 */
export interface DeleteCampaignRequest {
    reason: string; // Required reason for deletion
    note?: string;
}

/**
 * Campaign stats for admin
 */
export interface CampaignStats {
    campaignId: string;
    totalRaised: number;
    donationCount: number;
    averageDonation: number;
    itemDonationCount: number;
    shareCount: number;
    viewCount: number;
    completionPercentage: number;
    milestonesCompleted: number;
    totalMilestones: number;
}

/**
 * Admin response wrapper
 */
export interface AdminCampaignResponse {
    success: boolean;
    campaign?: AdminCampaignDetail;
    campaigns?: AdminCampaignListItem[];
    stats?: CampaignStats;
    message?: string;
}

/**
 * Verification queue item
 */
export interface VerificationQueueItem {
    id: string;
    title: string;
    beneficiary: {
        id: string;
        name: string;
        email: string;
    };
    targetAmount: number;
    createdAt: Date;
    daysWaiting: number;
}
