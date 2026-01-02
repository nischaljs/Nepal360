"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.grantBadge = void 0;
const prisma_1 = require("../lib/prisma");
const admin_badge_schema_1 = require("../schemas/admin.badge.schema");
const zod_1 = require("zod");
const grantBadge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId: adminId } = req.user;
        const { userId, badgeCode } = admin_badge_schema_1.grantBadgeSchema.parse(req.body);
        const badge = yield prisma_1.prisma.badge.findUnique({
            where: { code: badgeCode },
        });
        if (!badge) {
            return res.status(404).json({ message: 'Badge not found.' });
        }
        const existingUserBadge = yield prisma_1.prisma.userBadge.findFirst({
            where: {
                userId,
                badgeId: badge.id,
            },
        });
        if (existingUserBadge) {
            return res.status(409).json({ message: 'User already has this badge.' });
        }
        const userBadge = yield prisma_1.prisma.userBadge.create({
            data: {
                userId,
                badgeId: badge.id,
            },
        });
        yield prisma_1.prisma.auditLog.create({
            data: {
                actorType: 'ADMIN',
                actorId: adminId,
                actionType: 'BADGE_GRANTED',
                targetType: 'USER_BADGE',
                targetId: userBadge.id,
                note: `Granted badge '${badge.name}' to user ${userId}`,
            },
        });
        res.status(201).json(userBadge);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
        }
        next(error);
    }
});
exports.grantBadge = grantBadge;
