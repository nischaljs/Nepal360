"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.milestoneQuerySchema = exports.campaignQuerySchema = exports.createMilestoneSchema = exports.updateCampaignSchema = exports.createCampaignSchema = exports.CAMPAIGN_CATEGORIES = void 0;
const zod_1 = require("zod");
/**
 * Campaign Creation Schema
 * Validates data for creating a new fundraising campaign
 *
 * File uploads (multipart/form-data):
 * - coverImage: Single image file (required, max 5MB)
 * - proofs: Multiple proof files (optional, max 10 files, 20MB each)
 */
exports.CAMPAIGN_CATEGORIES = [
    'education', 'health', 'disaster', 'community', 'animals',
    'arts', 'business', 'emergency', 'environment', 'other', 'general',
];
exports.createCampaignSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title must not exceed 100 characters'),
    description: zod_1.z.string()
        .min(20, 'Description must be at least 20 characters')
        .max(5000, 'Description must not exceed 5000 characters'),
    targetAmount: zod_1.z.string()
        .refine((val) => !isNaN(Number(val)), 'Target amount must be a number')
        .transform((val) => Number(val))
        .refine((val) => val > 0, 'Target amount must be greater than 0')
        .refine((val) => val <= 999999999.99, 'Target amount is too large'),
    category: zod_1.z.enum(exports.CAMPAIGN_CATEGORIES).optional().default('general'),
    district: zod_1.z.string().optional(),
}).strict();
/**
 * Campaign Update Schema
 * Validates data for updating an existing campaign
 * Only allows updating text fields, not file uploads
 */
exports.updateCampaignSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title must not exceed 100 characters')
        .optional(),
    description: zod_1.z.string()
        .min(20, 'Description must be at least 20 characters')
        .max(5000, 'Description must not exceed 5000 characters')
        .optional(),
    targetAmount: zod_1.z.string()
        .refine((val) => !isNaN(Number(val)), 'Target amount must be a number')
        .transform((val) => Number(val))
        .refine((val) => val > 0, 'Target amount must be greater than 0')
        .optional(),
    category: zod_1.z.enum(exports.CAMPAIGN_CATEGORIES).optional(),
    status: zod_1.z.enum(['DRAFT', 'PENDING_VERIFICATION', 'LIVE', 'SUSPENDED', 'COMPLETED'])
        .optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one field must be provided for update').strict();
/**
 * Milestone Creation Schema
 * Validates data for creating a campaign milestone
 */
exports.createMilestoneSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(3, 'Milestone title must be at least 3 characters')
        .max(100, 'Milestone title must not exceed 100 characters'),
    amount: zod_1.z.string()
        .refine((val) => !isNaN(Number(val)), 'Amount must be a number')
        .transform((val) => Number(val))
        .refine((val) => val > 0, 'Amount must be greater than 0')
        .refine((val) => val <= 999999999.99, 'Amount is too large'),
}).strict();
/**
 * Campaign Query Schema
 * Validates parameters for campaign queries
 */
exports.campaignQuerySchema = zod_1.z.object({
    id: zod_1.z.string()
        .uuid('Invalid campaign ID format'),
});
/**
 * Milestone Query Schema
 * Validates parameters for milestone queries
 */
exports.milestoneQuerySchema = zod_1.z.object({
    id: zod_1.z.string()
        .uuid('Invalid campaign ID format'),
    milestoneId: zod_1.z.string()
        .uuid('Invalid milestone ID format'),
});
