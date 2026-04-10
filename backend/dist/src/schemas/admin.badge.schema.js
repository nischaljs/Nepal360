"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBadgeSchema = exports.createBadgeSchema = exports.grantBadgeSchema = void 0;
const zod_1 = require("zod");
exports.grantBadgeSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID'),
    badgeCode: zod_1.z.string().min(1, 'Badge code is required'),
});
exports.createBadgeSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Badge code is required').max(50, 'Code too long'),
    name: zod_1.z.string().min(1, 'Badge name is required').max(100, 'Name too long'),
    description: zod_1.z.string().min(1, 'Description is required').max(500, 'Description too long'),
    iconUrl: zod_1.z.string().url('Invalid icon URL').optional().or(zod_1.z.literal('')),
    badgeType: zod_1.z.enum(['FIRST_DONATION', 'LIFETIME_AMOUNT', 'CAMPAIGN_SUPPORTER', 'ITEM_DONOR', 'LEADERBOARD_WINNER']),
});
exports.updateBadgeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().min(1).max(500).optional(),
    iconUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});
