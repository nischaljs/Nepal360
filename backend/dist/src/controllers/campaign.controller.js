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
exports.getCampaignStats = void 0;
exports.createCampaign = createCampaign;
exports.getMyCampaigns = getMyCampaigns;
exports.getCampaignById = getCampaignById;
exports.updateCampaign = updateCampaign;
exports.addMilestone = addMilestone;
exports.deleteMilestone = deleteMilestone;
const enums_1 = require("../../generated/prisma/enums");
const prisma_1 = require("../lib/prisma");
const campaign_schema_1 = require("../schemas/campaign.schema");
const file_1 = require("../utils/file");
const getBaseUrl = (req) => {
    return `${req.protocol}://${req.get('host')}`;
};
function createCampaign(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const validation = campaign_schema_1.createCampaignSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.error.flatten().fieldErrors
                });
            }
            const { title, description, targetAmount } = validation.data;
            const files = req.files;
            // Check if cover image is provided
            if (!(files === null || files === void 0 ? void 0 : files.coverImage) || files.coverImage.length === 0) {
                return res.status(400).json({ success: false, message: 'Cover image is required' });
            }
            const coverImageRelativePath = (0, file_1.getRelativePath)(files.coverImage[0].path);
            const proofLinks = files.proofs
                ? files.proofs.map(f => (0, file_1.getRelativePath)(f.path))
                : [];
            const campaign = yield prisma_1.prisma.campaign.create({
                data: {
                    beneficiaryId: req.user.userId,
                    title,
                    description,
                    coverImage: coverImageRelativePath,
                    proofLinks: proofLinks.length > 0 ? JSON.stringify(proofLinks) : null,
                    targetAmount,
                    status: enums_1.CampaignStatus.PENDING_VERIFICATION,
                },
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true }
                    },
                    milestones: true,
                },
            });
            const baseUrl = getBaseUrl(req);
            const proofUrls = (0, file_1.convertProofLinksToUrls)((0, file_1.parseProofLinks)(campaign.proofLinks), baseUrl);
            return res.status(201).json({
                success: true,
                campaign: Object.assign(Object.assign({}, campaign), { coverImage: `${baseUrl}/uploads/${campaign.coverImage}`, proofLinks: proofUrls })
            });
        }
        catch (error) {
            console.error('Campaign creation error:', error);
            return res.status(500).json({ success: false, message: 'Failed to create campaign' });
        }
    });
}
/**
 * Get My Campaigns
 */
function getMyCampaigns(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const baseUrl = getBaseUrl(req);
            const campaigns = yield prisma_1.prisma.campaign.findMany({
                where: { beneficiaryId: req.user.userId },
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true }
                    },
                    milestones: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            const formattedCampaigns = campaigns.map(campaign => (Object.assign(Object.assign({}, campaign), { coverImage: `${baseUrl}/uploads/${campaign.coverImage}`, proofLinks: (0, file_1.convertProofLinksToUrls)((0, file_1.parseProofLinks)(campaign.proofLinks), baseUrl) })));
            return res.json({ success: true, campaigns: formattedCampaigns });
        }
        catch (error) {
            console.error('Fetch campaigns error:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
        }
    });
}
/**
 * Get Campaign Detail
 */
function getCampaignById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const campaign = yield prisma_1.prisma.campaign.findFirst({
                where: {
                    id,
                    beneficiaryId: req.user.userId,
                },
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true }
                    },
                    milestones: true,
                },
            });
            if (!campaign) {
                return res.status(404).json({ success: false, message: 'Campaign not found' });
            }
            const baseUrl = getBaseUrl(req);
            return res.json({
                success: true,
                campaign: Object.assign(Object.assign({}, campaign), { coverImage: `${baseUrl}/uploads/${campaign.coverImage}`, proofLinks: (0, file_1.convertProofLinksToUrls)((0, file_1.parseProofLinks)(campaign.proofLinks), baseUrl) })
            });
        }
        catch (error) {
            console.error('Fetch campaign error:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch campaign' });
        }
    });
}
/**
 * Update Campaign (only before LIVE)
 */
function updateCampaign(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            // Validate input
            const validation = campaign_schema_1.updateCampaignSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.error.flatten().fieldErrors
                });
            }
            const campaign = yield prisma_1.prisma.campaign.findFirst({
                where: { id, beneficiaryId: req.user.userId },
            });
            if (!campaign) {
                return res.status(404).json({ success: false, message: 'Campaign not found' });
            }
            if (campaign.status === enums_1.CampaignStatus.LIVE) {
                return res.status(403).json({ success: false, message: 'Live campaigns cannot be edited' });
            }
            const updated = yield prisma_1.prisma.campaign.update({
                where: { id },
                data: validation.data,
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true }
                    },
                    milestones: true,
                },
            });
            const baseUrl = getBaseUrl(req);
            return res.json({
                success: true,
                campaign: Object.assign(Object.assign({}, updated), { coverImage: `${baseUrl}/uploads/${updated.coverImage}`, proofLinks: (0, file_1.convertProofLinksToUrls)((0, file_1.parseProofLinks)(updated.proofLinks), baseUrl) })
            });
        }
        catch (error) {
            console.error('Update campaign error:', error);
            return res.status(500).json({ success: false, message: 'Failed to update campaign' });
        }
    });
}
/**
 * Add Milestone
 */
function addMilestone(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            // Validate input
            const validation = campaign_schema_1.createMilestoneSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.error.flatten().fieldErrors
                });
            }
            const { title, amount } = validation.data;
            const campaign = yield prisma_1.prisma.campaign.findFirst({
                where: { id, beneficiaryId: req.user.userId },
            });
            if (!campaign) {
                return res.status(404).json({ success: false, message: 'Campaign not found' });
            }
            const milestone = yield prisma_1.prisma.milestone.create({
                data: {
                    campaignId: id,
                    title,
                    amount,
                },
            });
            return res.status(201).json({ success: true, milestone });
        }
        catch (error) {
            console.error('Add milestone error:', error);
            return res.status(500).json({ success: false, message: 'Failed to add milestone' });
        }
    });
}
/**
 * Delete Milestone
 */
function deleteMilestone(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id, milestoneId } = req.params;
            const milestone = yield prisma_1.prisma.milestone.findUnique({
                where: { id: milestoneId },
                include: { campaign: true },
            });
            if (!milestone || milestone.campaign.beneficiaryId !== req.user.userId) {
                return res.status(404).json({ success: false, message: 'Milestone not found' });
            }
            yield prisma_1.prisma.milestone.delete({ where: { id: milestoneId } });
            return res.json({ success: true });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Failed to delete milestone' });
        }
    });
}
const getCampaignStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const moneyDonations = yield prisma_1.prisma.moneyDonation.findMany({
            where: {
                campaignId: id,
                status: 'COMPLETED'
            }
        });
        const itemDonations = yield prisma_1.prisma.itemDonation.findMany({
            where: {
                campaignId: id,
                status: 'CONFIRMED'
            }
        });
        const totalMoneyRaised = moneyDonations.reduce((sum, d) => sum + d.amount.toNumber(), 0);
        const moneyDonationCount = moneyDonations.length;
        const itemDonationCount = itemDonations.length;
        const allDonors = new Set([
            ...moneyDonations.map(d => d.donorId),
            ...itemDonations.map(d => d.donorId)
        ]);
        const uniqueDonorCount = allDonors.size;
        const averageMoneyDonation = moneyDonationCount > 0 ? totalMoneyRaised / moneyDonationCount : 0;
        return res.status(200).json({
            success: true,
            stats: {
                totalMoneyRaised,
                moneyDonationCount,
                itemDonationCount,
                totalDonationCount: moneyDonationCount + itemDonationCount,
                uniqueDonorCount,
                averageMoneyDonation
            }
        });
    }
    catch (error) {
        console.error('Get campaign stats error:', error);
        return res.status(500).json({ success: false, message: 'Failed to get campaign stats' });
    }
});
exports.getCampaignStats = getCampaignStats;
