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
exports.getDueRecurring = exports.cancelRecurring = exports.resumeRecurring = exports.pauseRecurring = exports.getMyRecurring = exports.createRecurring = void 0;
const prisma_1 = require("../lib/prisma");
const recurringDonation_schema_1 = require("../schemas/recurringDonation.schema");
const createRecurring = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = recurringDonation_schema_1.createRecurringSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
        }
        const { campaignId, amount, frequency } = validation.data;
        const donorId = req.user.userId;
        const campaign = yield prisma_1.prisma.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign || campaign.status !== 'LIVE') {
            return res.status(404).json({ success: false, message: 'Campaign not found or not active' });
        }
        const nextDueDate = new Date();
        if (frequency === 'MONTHLY') {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }
        else {
            nextDueDate.setDate(nextDueDate.getDate() + 7);
        }
        const recurring = yield prisma_1.prisma.recurringDonation.create({
            data: {
                donorId,
                campaignId,
                amount,
                frequency,
                nextDueDate,
            },
            include: {
                campaign: { select: { id: true, title: true } },
            },
        });
        res.status(201).json({ success: true, data: recurring });
    }
    catch (error) {
        next(error);
    }
});
exports.createRecurring = createRecurring;
const getMyRecurring = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const donorId = req.user.userId;
        const donations = yield prisma_1.prisma.recurringDonation.findMany({
            where: { donorId },
            include: {
                campaign: { select: { id: true, title: true, coverImage: true, status: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: donations });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyRecurring = getMyRecurring;
const pauseRecurring = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const donorId = req.user.userId;
        const donation = yield prisma_1.prisma.recurringDonation.findUnique({ where: { id } });
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Recurring donation not found' });
        }
        if (donation.donorId !== donorId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (donation.status !== 'ACTIVE') {
            return res.status(400).json({ success: false, message: 'Can only pause active donations' });
        }
        const updated = yield prisma_1.prisma.recurringDonation.update({
            where: { id },
            data: { status: 'PAUSED' },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.pauseRecurring = pauseRecurring;
const resumeRecurring = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const donorId = req.user.userId;
        const donation = yield prisma_1.prisma.recurringDonation.findUnique({ where: { id } });
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Recurring donation not found' });
        }
        if (donation.donorId !== donorId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (donation.status !== 'PAUSED') {
            return res.status(400).json({ success: false, message: 'Can only resume paused donations' });
        }
        const updated = yield prisma_1.prisma.recurringDonation.update({
            where: { id },
            data: { status: 'ACTIVE' },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.resumeRecurring = resumeRecurring;
const cancelRecurring = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const donorId = req.user.userId;
        const donation = yield prisma_1.prisma.recurringDonation.findUnique({ where: { id } });
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Recurring donation not found' });
        }
        if (donation.donorId !== donorId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (donation.status === 'CANCELLED') {
            return res.status(400).json({ success: false, message: 'Already cancelled' });
        }
        const updated = yield prisma_1.prisma.recurringDonation.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.cancelRecurring = cancelRecurring;
const getDueRecurring = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const donations = yield prisma_1.prisma.recurringDonation.findMany({
            where: {
                status: 'ACTIVE',
                nextDueDate: { lte: new Date() },
            },
            include: {
                donor: { select: { id: true, name: true, email: true } },
                campaign: { select: { id: true, title: true } },
            },
            orderBy: { nextDueDate: 'asc' },
        });
        res.json({ success: true, data: donations });
    }
    catch (error) {
        next(error);
    }
});
exports.getDueRecurring = getDueRecurring;
