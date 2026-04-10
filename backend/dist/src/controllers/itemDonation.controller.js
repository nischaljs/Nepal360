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
exports.updateItemDonation = exports.getCampaignItemDonations = exports.getItemDonationById = exports.getMyItemDonations = exports.pledgeItemDonation = void 0;
const prisma_1 = require("../lib/prisma");
const itemDonation_schema_1 = require("../schemas/itemDonation.schema");
const zod_1 = require("zod");
const pledgeItemDonation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId: donorId } = req.user;
        const donationData = itemDonation_schema_1.pledgeItemDonationSchema.parse(req.body);
        const campaign = yield prisma_1.prisma.campaign.findUnique({
            where: { id: donationData.campaignId },
        });
        if (!campaign || campaign.status !== 'LIVE') {
            return res.status(404).json({ success: false, message: 'Campaign not found or not active.' });
        }
        const donation = yield prisma_1.prisma.itemDonation.create({
            data: Object.assign(Object.assign({}, donationData), { donorId, status: 'PLEDGED' }),
            include: {
                campaign: { select: { id: true, title: true } },
            },
        });
        res.status(201).json({ success: true, data: donation });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
        }
        next(error);
    }
});
exports.pledgeItemDonation = pledgeItemDonation;
const getMyItemDonations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId: donorId } = req.user;
        const donations = yield prisma_1.prisma.itemDonation.findMany({
            where: { donorId },
            include: {
                campaign: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, data: donations });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyItemDonations = getMyItemDonations;
const getItemDonationById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const donation = yield prisma_1.prisma.itemDonation.findUnique({
            where: { id },
            include: {
                donor: { select: { id: true, name: true } },
                campaign: { select: { id: true, title: true } },
            },
        });
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Item donation not found.' });
        }
        res.status(200).json({ success: true, data: donation });
    }
    catch (error) {
        next(error);
    }
});
exports.getItemDonationById = getItemDonationById;
const getCampaignItemDonations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { campaignId } = req.params;
        const donations = yield prisma_1.prisma.itemDonation.findMany({
            where: { campaignId },
            include: {
                donor: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, data: donations });
    }
    catch (error) {
        next(error);
    }
});
exports.getCampaignItemDonations = getCampaignItemDonations;
const updateItemDonation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId: donorId } = req.user;
        const { id } = req.params;
        const updateData = itemDonation_schema_1.updateItemDonationSchema.parse(req.body);
        const donation = yield prisma_1.prisma.itemDonation.findUnique({ where: { id } });
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Item donation not found.' });
        }
        if (donation.donorId !== donorId) {
            return res.status(403).json({ success: false, message: 'You can only update your own pledges.' });
        }
        if (donation.status !== 'PLEDGED') {
            return res.status(400).json({ success: false, message: 'Only pledged items can be updated.' });
        }
        const updated = yield prisma_1.prisma.itemDonation.update({
            where: { id },
            data: Object.assign(Object.assign({}, updateData), (updateData.status === 'DELIVERED' ? { status: 'DELIVERED' } : {})),
            include: {
                campaign: { select: { id: true, title: true } },
            },
        });
        if (updateData.status === 'DELIVERED') {
            yield prisma_1.prisma.donorStats.upsert({
                where: { userId: donorId },
                create: {
                    userId: donorId,
                    totalItemCount: 1,
                    donationCount: 1,
                    lastDonationAt: new Date(),
                },
                update: {
                    totalItemCount: { increment: 1 },
                    donationCount: { increment: 1 },
                    lastDonationAt: new Date(),
                },
            });
        }
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
        }
        next(error);
    }
});
exports.updateItemDonation = updateItemDonation;
