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
exports.rejectItemDonation = exports.confirmItemDonation = exports.listItemDonations = void 0;
const prisma_1 = require("../lib/prisma");
const admin_itemDonation_schema_1 = require("../schemas/admin.itemDonation.schema");
const zod_1 = require("zod");
const listItemDonations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.query;
    if (status &&
        !['PLEDGED', 'DELIVERED', 'CONFIRMED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status filter.' });
    }
    try {
        const donations = yield prisma_1.prisma.itemDonation.findMany({
            where: {
                status: status ? status : undefined,
            },
            include: {
                donor: {
                    select: { id: true, name: true, email: true },
                },
                campaign: {
                    select: { id: true, title: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json({ success: true, data: donations });
    }
    catch (error) {
        next(error);
    }
});
exports.listItemDonations = listItemDonations;
const confirmItemDonation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userId: adminId } = req.user;
        const donation = yield prisma_1.prisma.itemDonation.update({
            where: { id },
            data: {
                status: 'CONFIRMED',
                confirmedAt: new Date(),
            },
        });
        yield prisma_1.prisma.auditLog.create({
            data: {
                actorType: 'ADMIN',
                actorId: adminId,
                actionType: 'ITEM_CONFIRMATION',
                targetType: 'ITEM_DONATION',
                targetId: donation.id,
                note: 'Item donation confirmed',
            },
        });
        res.status(200).json({ success: true, data: donation });
    }
    catch (error) {
        next(error);
    }
});
exports.confirmItemDonation = confirmItemDonation;
const rejectItemDonation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userId: adminId } = req.user;
        const { reason } = admin_itemDonation_schema_1.rejectItemDonationSchema.parse(req.body);
        const donation = yield prisma_1.prisma.itemDonation.update({
            where: { id },
            data: {
                status: 'REJECTED',
            },
        });
        yield prisma_1.prisma.auditLog.create({
            data: {
                actorType: 'ADMIN',
                actorId: adminId,
                actionType: 'ITEM_CONFIRMATION',
                targetType: 'ITEM_DONATION',
                targetId: donation.id,
                note: `Item donation rejected: ${reason}`,
            },
        });
        res.status(200).json({ success: true, data: donation });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
        }
        next(error);
    }
});
exports.rejectItemDonation = rejectItemDonation;
