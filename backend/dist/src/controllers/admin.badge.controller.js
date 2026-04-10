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
exports.grantBadge = exports.deleteBadge = exports.updateBadge = exports.createBadge = exports.getBadge = exports.listBadges = void 0;
const prisma_1 = require("../lib/prisma");
const admin_badge_schema_1 = require("../schemas/admin.badge.schema");
const zod_1 = require("zod");
const listBadges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const badges = yield prisma_1.prisma.badge.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { userBadges: true },
                },
            },
        });
        res.json({ success: true, badges });
    }
    catch (error) {
        next(error);
    }
});
exports.listBadges = listBadges;
const getBadge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const badge = yield prisma_1.prisma.badge.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { userBadges: true },
                },
            },
        });
        if (!badge) {
            return res.status(404).json({ success: false, message: 'Badge not found' });
        }
        res.json({ success: true, badge });
    }
    catch (error) {
        next(error);
    }
});
exports.getBadge = getBadge;
const createBadge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = admin_badge_schema_1.createBadgeSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
        }
        const { code, name, description, iconUrl, badgeType } = validation.data;
        const existingBadge = yield prisma_1.prisma.badge.findUnique({ where: { code } });
        if (existingBadge) {
            return res.status(409).json({ success: false, message: 'Badge with this code already exists' });
        }
        const badge = yield prisma_1.prisma.badge.create({
            data: {
                code,
                name,
                description,
                iconUrl: iconUrl || '',
                badgeType,
            },
        });
        yield prisma_1.prisma.auditLog.create({
            data: {
                actorType: 'ADMIN',
                actorId: req.user.userId,
                actionType: 'BADGE_GRANTED',
                targetType: 'BADGE',
                targetId: badge.id,
                note: `Created badge '${name}'`,
            },
        });
        res.status(201).json({ success: true, badge });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.issues.map(e => ({ path: e.path, message: e.message })),
            });
        }
        next(error);
    }
});
exports.createBadge = createBadge;
const updateBadge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const validation = admin_badge_schema_1.updateBadgeSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
        }
        const badge = yield prisma_1.prisma.badge.findUnique({ where: { id } });
        if (!badge) {
            return res.status(404).json({ success: false, message: 'Badge not found' });
        }
        const updated = yield prisma_1.prisma.badge.update({
            where: { id },
            data: validation.data,
        });
        res.json({ success: true, badge: updated });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.issues.map(e => ({ path: e.path, message: e.message })),
            });
        }
        next(error);
    }
});
exports.updateBadge = updateBadge;
const deleteBadge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const badge = yield prisma_1.prisma.badge.findUnique({ where: { id } });
        if (!badge) {
            return res.status(404).json({ success: false, message: 'Badge not found' });
        }
        yield prisma_1.prisma.badge.delete({ where: { id } });
        res.json({ success: true, message: 'Badge deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteBadge = deleteBadge;
const grantBadge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId: adminId } = req.user;
        const { userId, badgeCode } = admin_badge_schema_1.grantBadgeSchema.parse(req.body);
        const badge = yield prisma_1.prisma.badge.findUnique({
            where: { code: badgeCode },
        });
        if (!badge) {
            return res.status(404).json({ success: false, message: 'Badge not found.' });
        }
        const existingUserBadge = yield prisma_1.prisma.userBadge.findFirst({
            where: {
                userId,
                badgeId: badge.id,
            },
        });
        if (existingUserBadge) {
            return res.status(409).json({ success: false, message: 'User already has this badge.' });
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
        res.status(201).json({ success: true, data: userBadge });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
        }
        next(error);
    }
});
exports.grantBadge = grantBadge;
