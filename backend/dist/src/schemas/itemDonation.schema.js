"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateItemDonationSchema = exports.pledgeItemDonationSchema = void 0;
const zod_1 = require("zod");
exports.pledgeItemDonationSchema = zod_1.z.object({
    campaignId: zod_1.z.string().uuid('Invalid campaign ID'),
    itemName: zod_1.z.string().min(1, 'Item name is required'),
    quantity: zod_1.z.string().min(1, 'Quantity is required'),
    deliveryNote: zod_1.z.string().optional(),
    deliveryPhoto: zod_1.z.string().optional(),
});
exports.updateItemDonationSchema = zod_1.z.object({
    status: zod_1.z.enum(['DELIVERED']).optional(),
    deliveryNote: zod_1.z.string().optional(),
    deliveryPhoto: zod_1.z.string().optional(),
});
