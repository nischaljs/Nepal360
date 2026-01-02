"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyKhaltiPaymentSchema = exports.initiateKhaltiPaymentSchema = void 0;
const zod_1 = require("zod");
exports.initiateKhaltiPaymentSchema = zod_1.z.object({
    campaignId: zod_1.z.string().uuid('Invalid campaign ID'),
    amount: zod_1.z.number().positive('Amount must be positive'),
    currency: zod_1.z.enum(['NPR']),
    returnUrl: zod_1.z.string().url('Invalid return URL'),
    visibility: zod_1.z.enum(['PUBLIC', 'ANONYMOUS']).default('PUBLIC'),
});
exports.verifyKhaltiPaymentSchema = zod_1.z.object({
    pidx: zod_1.z.string(),
});
