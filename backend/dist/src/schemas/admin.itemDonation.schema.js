"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectItemDonationSchema = void 0;
const zod_1 = require("zod");
exports.rejectItemDonationSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, 'Rejection reason is required'),
});
