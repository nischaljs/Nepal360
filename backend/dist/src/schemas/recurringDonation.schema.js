"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecurringSchema = void 0;
const zod_1 = require("zod");
exports.createRecurringSchema = zod_1.z.object({
    campaignId: zod_1.z.string().uuid('Invalid campaign ID'),
    amount: zod_1.z.number().positive('Amount must be positive').min(10, 'Minimum amount is 10'),
    frequency: zod_1.z.enum(['MONTHLY', 'WEEKLY']),
});
