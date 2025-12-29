import { z } from 'zod';

/**
 * Admin Campaign Approval Schema
 * Validates approval request data
 */
export const approveCampaignSchema = z.object({
    note: z.string().max(500, 'Note must not exceed 500 characters').optional(),
}).strict();

/**
 * Admin Campaign Rejection Schema
 * Validates rejection request with required reason
 */
export const rejectCampaignSchema = z.object({
    reason: z.string()
        .min(10, 'Rejection reason must be at least 10 characters')
        .max(500, 'Rejection reason must not exceed 500 characters'),
    note: z.string().max(500, 'Note must not exceed 500 characters').optional(),
}).strict();

/**
 * Admin Campaign Suspension Schema
 * Validates suspension request with required reason
 */
export const suspendCampaignSchema = z.object({
    reason: z.string()
        .min(10, 'Suspension reason must be at least 10 characters')
        .max(500, 'Suspension reason must not exceed 500 characters'),
    note: z.string().max(500, 'Note must not exceed 500 characters').optional(),
}).strict();

/**
 * Admin Campaign Deletion Schema
 * Validates soft delete request with required reason
 */
export const deleteCampaignSchema = z.object({
    reason: z.string()
        .min(10, 'Deletion reason must be at least 10 characters')
        .max(500, 'Deletion reason must not exceed 500 characters'),
    note: z.string().max(500, 'Note must not exceed 500 characters').optional(),
}).strict();

/**
 * Campaign list filter schema
 */
export const campaignFilterSchema = z.object({
    status: z.enum(['DRAFT', 'PENDING_VERIFICATION', 'LIVE', 'SUSPENDED', 'COMPLETED']).optional(),
    beneficiaryId: z.string().uuid().optional(),
    isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
    sortBy: z.enum(['createdAt', 'verifiedAt', 'donationCount']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
}).strict();

// Export inferred types
export type ApproveCampaignInput = z.infer<typeof approveCampaignSchema>;
export type RejectCampaignInput = z.infer<typeof rejectCampaignSchema>;
export type SuspendCampaignInput = z.infer<typeof suspendCampaignSchema>;
export type DeleteCampaignInput = z.infer<typeof deleteCampaignSchema>;
export type CampaignFilterInput = z.infer<typeof campaignFilterSchema>;
