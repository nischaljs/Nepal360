import { z } from 'zod';

/**
 * Campaign Creation Schema
 * Validates data for creating a new fundraising campaign
 *
 * File uploads (multipart/form-data):
 * - coverImage: Single image file (required, max 5MB)
 * - proofs: Multiple proof files (optional, max 10 files, 20MB each)
 */
export const CAMPAIGN_CATEGORIES = [
    'education', 'health', 'disaster', 'community', 'animals',
    'arts', 'business', 'emergency', 'environment', 'other', 'general',
] as const;

export type CampaignCategory = typeof CAMPAIGN_CATEGORIES[number];

export const createCampaignSchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title must not exceed 100 characters'),
    description: z.string()
        .min(20, 'Description must be at least 20 characters')
        .max(5000, 'Description must not exceed 5000 characters'),
    targetAmount: z.string()
        .refine((val) => !isNaN(Number(val)), 'Target amount must be a number')
        .transform((val) => Number(val))
        .refine((val) => val > 0, 'Target amount must be greater than 0')
        .refine((val) => val <= 999999999.99, 'Target amount is too large'),
    category: z.enum(CAMPAIGN_CATEGORIES).optional().default('general'),
    district: z.string().optional(),
}).strict();

/**
 * Campaign Update Schema
 * Validates data for updating an existing campaign
 * Only allows updating text fields, not file uploads
 */
export const updateCampaignSchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title must not exceed 100 characters')
        .optional(),
    description: z.string()
        .min(20, 'Description must be at least 20 characters')
        .max(5000, 'Description must not exceed 5000 characters')
        .optional(),
    targetAmount: z.string()
        .refine((val) => !isNaN(Number(val)), 'Target amount must be a number')
        .transform((val) => Number(val))
        .refine((val) => val > 0, 'Target amount must be greater than 0')
        .optional(),
    category: z.enum(CAMPAIGN_CATEGORIES).optional(),
    status: z.enum(['DRAFT', 'PENDING_VERIFICATION', 'LIVE', 'SUSPENDED', 'COMPLETED'])
        .optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    'At least one field must be provided for update'
).strict();

/**
 * Milestone Creation Schema
 * Validates data for creating a campaign milestone
 */
export const createMilestoneSchema = z.object({
    title: z.string()
        .min(3, 'Milestone title must be at least 3 characters')
        .max(100, 'Milestone title must not exceed 100 characters'),
    amount: z.string()
        .refine((val) => !isNaN(Number(val)), 'Amount must be a number')
        .transform((val) => Number(val))
        .refine((val) => val > 0, 'Amount must be greater than 0')
        .refine((val) => val <= 999999999.99, 'Amount is too large'),
}).strict();

/**
 * Campaign Query Schema
 * Validates parameters for campaign queries
 */
export const campaignQuerySchema = z.object({
    id: z.string()
        .uuid('Invalid campaign ID format'),
});

/**
 * Milestone Query Schema
 * Validates parameters for milestone queries
 */
export const milestoneQuerySchema = z.object({
    id: z.string()
        .uuid('Invalid campaign ID format'),
    milestoneId: z.string()
        .uuid('Invalid milestone ID format'),
});

// Export types inferred from schemas
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type CampaignQueryInput = z.infer<typeof campaignQuerySchema>;
export type MilestoneQueryInput = z.infer<typeof milestoneQuerySchema>;
