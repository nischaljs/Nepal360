"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.grantBadgeSchema = void 0;
const zod_1 = require("zod");
exports.grantBadgeSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID'),
    badgeCode: zod_1.z.string().min(1, 'Badge code is required'),
});
