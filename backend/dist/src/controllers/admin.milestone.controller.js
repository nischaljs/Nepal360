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
exports.claimMilestone = exports.rejectMilestone = exports.releaseFunds = exports.getMilestones = void 0;
const prisma_1 = require("../lib/prisma");
const getMilestones = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { campaignId } = req.params;
        const milestones = yield prisma_1.prisma.milestone.findMany({
            where: { campaignId },
            orderBy: { amount: 'asc' },
        });
        res.json({ success: true, data: milestones });
    }
    catch (error) {
        next(error);
    }
});
exports.getMilestones = getMilestones;
const releaseFunds = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;
        const milestone = yield prisma_1.prisma.milestone.findUnique({
            where: { id },
            include: { campaign: true },
        });
        if (!milestone) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }
        if (milestone.fundsReleased) {
            return res.status(400).json({ success: false, message: 'Funds already released for this milestone' });
        }
        if (milestone.claimStatus !== 'CLAIMED') {
            return res.status(400).json({ success: false, message: 'Milestone must be claimed before funds can be released' });
        }
        const releasedAmount = req.body.amount
            ? parseFloat(req.body.amount)
            : parseFloat(milestone.amount.toString());
        const [updated] = yield prisma_1.prisma.$transaction([
            prisma_1.prisma.milestone.update({
                where: { id },
                data: {
                    fundsReleased: true,
                    releasedAmount,
                    releasedAt: new Date(),
                    verifiedBy: adminId,
                    claimStatus: 'APPROVED',
                    completed: true,
                },
            }),
            prisma_1.prisma.auditLog.create({
                data: {
                    actorType: 'ADMIN',
                    actorId: adminId,
                    actionType: 'CAMPAIGN_VERIFICATION',
                    targetType: 'MILESTONE',
                    targetId: id,
                    note: `Released funds NPR ${releasedAmount} for milestone "${milestone.title}"`,
                },
            }),
        ]);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.releaseFunds = releaseFunds;
const rejectMilestone = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;
        const { reason } = req.body;
        const milestone = yield prisma_1.prisma.milestone.findUnique({ where: { id } });
        if (!milestone) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }
        if (milestone.claimStatus !== 'CLAIMED') {
            return res.status(400).json({ success: false, message: 'Milestone is not in claimed status' });
        }
        const [updated] = yield prisma_1.prisma.$transaction([
            prisma_1.prisma.milestone.update({
                where: { id },
                data: {
                    claimStatus: 'REJECTED',
                    verifiedBy: adminId,
                },
            }),
            prisma_1.prisma.auditLog.create({
                data: {
                    actorType: 'ADMIN',
                    actorId: adminId,
                    actionType: 'CAMPAIGN_VERIFICATION',
                    targetType: 'MILESTONE',
                    targetId: id,
                    note: `Rejected milestone claim "${milestone.title}": ${reason || 'No reason provided'}`,
                },
            }),
        ]);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.rejectMilestone = rejectMilestone;
const claimMilestone = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { claimProof } = req.body;
        const milestone = yield prisma_1.prisma.milestone.findUnique({
            where: { id },
            include: { campaign: true },
        });
        if (!milestone) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }
        if (milestone.campaign.beneficiaryId !== userId) {
            return res.status(403).json({ success: false, message: 'Only the campaign beneficiary can claim milestones' });
        }
        if (milestone.claimStatus !== 'UNCLAIMED' && milestone.claimStatus !== 'REJECTED') {
            return res.status(400).json({ success: false, message: 'Milestone cannot be claimed in current status' });
        }
        const updated = yield prisma_1.prisma.milestone.update({
            where: { id },
            data: {
                claimStatus: 'CLAIMED',
                claimProof: claimProof || null,
            },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.claimMilestone = claimMilestone;
