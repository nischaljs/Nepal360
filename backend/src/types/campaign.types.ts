/**
 * Campaign Types
 *
 * This file contains TypeScript interfaces and types related to campaign operations.
 */

import { CampaignStatus } from '../../generated/prisma/enums';

/**
 * Organizer/Beneficiary Info
 * Extracted from User model for display
 */
export interface OrganizerInfo {
    id: string;
    name: string;
    email: string;
}

/**
 * Campaign Detail Response Type
 * Represents a campaign with its associated data and complete file URLs
 */
export interface CampaignDetail {
    id: string;
    beneficiaryId: string;
    beneficiary: OrganizerInfo;
    title: string;
    description: string;
    coverImage: string; // Complete URL
    proofLinks: string[]; // Array of complete URLs
    targetAmount: number;
    status: CampaignStatus;
    donationCount: number;
    shareCount: number;
    viewCount: number;
    createdAt: Date;
    verifiedAt?: Date | null;
    milestones: MilestoneDetail[];
}

/**
 * Campaign List Item Type
 * Lightweight campaign data for list views
 */
export interface CampaignListItem {
    id: string;
    title: string;
    description: string;
    coverImage: string; // Complete URL
    targetAmount: number;
    status: CampaignStatus;
    donationCount: number;
    shareCount: number;
    beneficiary: OrganizerInfo;
    createdAt: Date;
}

/**
 * Milestone Detail Type
 * Represents a milestone within a campaign
 */
export interface MilestoneDetail {
    id: string;
    campaignId: string;
    title: string;
    amount: number;
    completed: boolean;
    createdAt: Date;
}

/**
 * Campaign Create Request Type
 * Payload structure for creating a new campaign (with file uploads)
 * Uses FormData with:
 * - title (string)
 * - description (string)
 * - targetAmount (number as string)
 * - coverImage (File)
 * - proofs (File[])
 */
export interface CampaignCreateRequest {
    title: string;
    description: string;
    targetAmount: number;
}

/**
 * Campaign Update Request Type
 * Payload structure for updating an existing campaign
 * File uploads must be done via separate endpoint
 */
export interface CampaignUpdateRequest {
    title?: string;
    description?: string;
    targetAmount?: number;
    status?: CampaignStatus;
}

/**
 * Milestone Create Request Type
 * Payload structure for creating a milestone
 */
export interface MilestoneCreateRequest {
    title: string;
    amount: number;
}

/**
 * Campaign Response Type
 * Standard API response wrapper for campaign operations
 */
export interface CampaignResponse {
    success: boolean;
    campaign?: CampaignDetail;
    campaigns?: CampaignListItem[];
    message?: string;
}

/**
 * Milestone Response Type
 * Standard API response wrapper for milestone operations
 */
export interface MilestoneResponse {
    success: boolean;
    milestone?: MilestoneDetail;
    message?: string;
}

/**
 * Campaign Status Constants
 * Available campaign statuses
 */
export const CAMPAIGN_STATUSES = {
    DRAFT: 'DRAFT' as CampaignStatus,
    PENDING_VERIFICATION: 'PENDING_VERIFICATION' as CampaignStatus,
    LIVE: 'LIVE' as CampaignStatus,
    SUSPENDED: 'SUSPENDED' as CampaignStatus,
    COMPLETED: 'COMPLETED' as CampaignStatus,
} as const;

/**
 * Campaign Status Descriptions
 * Human-readable descriptions for each status
 */
export const CAMPAIGN_STATUS_DESCRIPTIONS: Record<CampaignStatus, string> = {
    DRAFT: 'Campaign is in draft state - not yet submitted for verification',
    PENDING_VERIFICATION: 'Campaign is awaiting admin verification',
    LIVE: 'Campaign is active and accepting donations',
    SUSPENDED: 'Campaign has been suspended and is not accepting donations',
    COMPLETED: 'Campaign has been completed',
};
