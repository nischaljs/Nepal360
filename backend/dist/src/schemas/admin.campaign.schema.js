"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignFilterSchema = exports.deleteCampaignSchema = exports.suspendCampaignSchema = exports.rejectCampaignSchema = exports.approveCampaignSchema = void 0;
const zod_1 = require("zod");
/**
 * Admin Campaign Approval Schema
 * Validates approval request data
 */
exports.approveCampaignSchema = zod_1.z.object({
    note: zod_1.z.string().max(500, 'Note must not exceed 500 characters').optional(),
}).strict();
/**
 * Admin Campaign Rejection Schema
 * Validates rejection request with required reason
 */
exports.rejectCampaignSchema = zod_1.z.object({
    reason: zod_1.z.string()
        .min(10, 'Rejection reason must be at least 10 characters')
        .max(500, 'Rejection reason must not exceed 500 characters'),
    note: zod_1.z.string().max(500, 'Note must not exceed 500 characters').optional(),
}).strict();
/**
 * Admin Campaign Suspension Schema
 * Validates suspension request with required reason
 */
exports.suspendCampaignSchema = zod_1.z.object({
    reason: zod_1.z.string()
        .min(10, 'Suspension reason must be at least 10 characters')
        .max(500, 'Suspension reason must not exceed 500 characters'),
    note: zod_1.z.string().max(500, 'Note must not exceed 500 characters').optional(),
}).strict();
/**
 * Admin Campaign Deletion Schema
 * Validates soft delete request with required reason
 */
exports.deleteCampaignSchema = zod_1.z.object({
    reason: zod_1.z.string()
        .min(10, 'Deletion reason must be at least 10 characters')
        .max(500, 'Deletion reason must not exceed 500 characters'),
    note: zod_1.z.string().max(500, 'Note must not exceed 500 characters').optional(),
}).strict();
/**
 * Campaign list filter schema
 */
exports.campaignFilterSchema = zod_1.z.object({
    status: zod_1.z.enum(['DRAFT', 'PENDING_VERIFICATION', 'LIVE', 'SUSPENDED', 'COMPLETED']).optional(),
    beneficiaryId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z.enum(['true', 'false']).transform(v => v === 'true').optional(),
    sortBy: zod_1.z.enum(['createdAt', 'verifiedAt', 'donationCount']).optional(),
    order: zod_1.z.enum(['asc', 'desc']).optional(),
}).strict();
