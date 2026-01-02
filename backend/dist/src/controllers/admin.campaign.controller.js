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
exports.listCampaigns = listCampaigns;
exports.getCampaignDetail = getCampaignDetail;
exports.getVerificationQueue = getVerificationQueue;
exports.approveCampaign = approveCampaign;
exports.rejectCampaign = rejectCampaign;
exports.suspendCampaign = suspendCampaign;
exports.resumeCampaign = resumeCampaign;
exports.deleteCampaign = deleteCampaign;
exports.getCampaignStats = getCampaignStats;
exports.completeCampaign = completeCampaign;
const prisma_1 = require("../lib/prisma");
const enums_1 = require("../../generated/prisma/enums");
const admin_campaign_schema_1 = require("../schemas/admin.campaign.schema");
const campaign_helpers_1 = require("../utils/campaign.helpers");
/**
 * ==================== LIST & READ OPERATIONS ====================
 */
/**
 * Get all campaigns (with filtering)
 * Supports: status, beneficiaryId, isActive, sortBy, order
 */
function listCampaigns(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const validation = admin_campaign_schema_1.campaignFilterSchema.safeParse(req.query);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid filter parameters',
                    errors: validation.error.flatten().fieldErrors,
                });
            }
            const { status, beneficiaryId, isActive, sortBy = 'createdAt', order = 'desc' } = validation.data;
            const where = {};
            if (status)
                where.status = status;
            if (beneficiaryId)
                where.beneficiaryId = beneficiaryId;
            if (isActive !== undefined)
                where.isActive = isActive;
            const campaigns = yield prisma_1.prisma.campaign.findMany({
                where,
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true },
                    },
                    milestones: true,
                },
                orderBy: { [sortBy]: order },
            });
            // Format with complete URLs
            const baseUrl = (0, campaign_helpers_1.getBaseUrl)(req);
            const formattedCampaigns = campaigns.map(c => (Object.assign(Object.assign({}, c), { coverImage: `${baseUrl}/uploads/${c.coverImage}`, proofLinks: (0, campaign_helpers_1.convertProofLinksToUrls)((0, campaign_helpers_1.parseProofLinks)(c.proofLinks), baseUrl) })));
            return res.json({ success: true, campaigns: formattedCampaigns });
        }
        catch (error) {
            console.error('List campaigns error:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
        }
    });
}
/**
 * Get single campaign detail (admin view)
 */
function getCampaignDetail(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { campaignId } = req.params;
            const campaign = yield prisma_1.prisma.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true },
                    },
                    milestones: true,
                },
            });
            if (!campaign) {
                return res.status(404).json({ success: false, message: 'Campaign not found' });
            }
            // Format with complete URLs
            const baseUrl = (0, campaign_helpers_1.getBaseUrl)(req);
            return res.json({
                success: true,
                campaign: Object.assign(Object.assign({}, campaign), { coverImage: `${baseUrl}/uploads/${campaign.coverImage}`, proofLinks: (0, campaign_helpers_1.convertProofLinksToUrls)((0, campaign_helpers_1.parseProofLinks)(campaign.proofLinks), baseUrl) }),
            });
        }
        catch (error) {
            console.error('Get campaign detail error:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch campaign' });
        }
    });
}
/**
 * Get campaigns awaiting verification
 */
function getVerificationQueue(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const campaigns = yield prisma_1.prisma.campaign.findMany({
                where: {
                    status: enums_1.CampaignStatus.PENDING_VERIFICATION,
                    isActive: true,
                },
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: 'asc' },
            });
            // Add daysWaiting calculation
            const queue = campaigns.map(c => ({
                id: c.id,
                title: c.title,
                beneficiary: c.beneficiary,
                targetAmount: c.targetAmount.toString(),
                createdAt: c.createdAt,
                daysWaiting: Math.floor((Date.now() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
            }));
            return res.json({ success: true, queue });
        }
        catch (error) {
            console.error('Get verification queue error:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch verification queue' });
        }
    });
}
/**
 * ==================== VERIFICATION ACTIONS ====================
 */
/**
 * Approve campaign → LIVE
 */
function approveCampaign(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { campaignId } = req.params;
            const validation = admin_campaign_schema_1.approveCampaignSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.error.flatten().fieldErrors,
                });
            }
            const campaign = yield prisma_1.prisma.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true },
                    },
                    milestones: true,
                },
            });
            if (!campaign) {
                return res.status(404).json({ success: false, message: 'Campaign not found' });
            }
            if (campaign.status === enums_1.CampaignStatus.LIVE) {
                return res.status(400).json({ success: false, message: 'Campaign is already live' });
            }
            // Update campaign status
            const updated = yield prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    status: enums_1.CampaignStatus.LIVE,
                    verifiedAt: new Date(),
                    verifiedBy: req.user.userId,
                },
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true },
                    },
                    milestones: true,
                },
            });
            // Create audit log
            yield prisma_1.prisma.auditLog.create({
                data: {
                    actorId: req.user.userId,
                    actorType: 'ADMIN',
                    actionType: 'CAMPAIGN_VERIFICATION',
                    targetType: 'CAMPAIGN', // Added targetType
                    targetId: updated.id, // Added targetId
                    note: JSON.stringify({
                        action: 'APPROVE',
                        note: validation.data.note || '',
                    }),
                },
            });
            // Format response
            const baseUrl = (0, campaign_helpers_1.getBaseUrl)(req);
            return res.json({
                success: true,
                message: 'Campaign approved and set to LIVE',
                campaign: Object.assign(Object.assign({}, updated), { coverImage: `${baseUrl}/uploads/${updated.coverImage}`, proofLinks: (0, campaign_helpers_1.convertProofLinksToUrls)((0, campaign_helpers_1.parseProofLinks)(updated.proofLinks), baseUrl) }),
            });
        }
        catch (error) {
            console.error('Approve campaign error:', error);
            return res.status(500).json({ success: false, message: 'Failed to approve campaign' });
        }
    });
}
/**
 * Reject campaign
 */
function rejectCampaign(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { campaignId } = req.params;
            const validation = admin_campaign_schema_1.rejectCampaignSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.error.flatten().fieldErrors,
                });
            }
            const { reason, note } = validation.data;
            const campaign = yield prisma_1.prisma.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true },
                    },
                    milestones: true,
                },
            });
            if (!campaign) {
                return res.status(404).json({ success: false, message: 'Campaign not found' });
            }
            if (campaign.status === enums_1.CampaignStatus.LIVE) {
                return res.status(400).json({ success: false, message: 'Cannot reject a live campaign. Use suspend instead.' });
            }
            // Update campaign
            const updated = yield prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    rejectionReason: reason,
                    rejectedAt: new Date(),
                    rejectedBy: req.user.userId,
                },
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true },
                    },
                    milestones: true,
                },
            });
            // Create audit log
            yield prisma_1.prisma.auditLog.create({
                data: {
                    actorId: req.user.userId,
                    actorType: 'ADMIN',
                    actionType: 'CAMPAIGN_VERIFICATION',
                    targetType: 'CAMPAIGN',
                    targetId: updated.id,
                    note: JSON.stringify({
                        action: 'REJECT',
                        reason,
                        note: note || '',
                    }),
                },
            });
            // Format response
            const baseUrl = (0, campaign_helpers_1.getBaseUrl)(req);
            return res.json({
                success: true,
                message: 'Campaign rejected',
                campaign: Object.assign(Object.assign({}, updated), { coverImage: `${baseUrl}/uploads/${updated.coverImage}`, proofLinks: (0, campaign_helpers_1.convertProofLinksToUrls)((0, campaign_helpers_1.parseProofLinks)(updated.proofLinks), baseUrl) }),
            });
        }
        catch (error) {
            console.error('Reject campaign error:', error);
            return res.status(500).json({ success: false, message: 'Failed to reject campaign' });
        }
    });
}
/**
 * ==================== MODERATION ACTIONS ====================
 */
/**
 * Suspend campaign
 */
function suspendCampaign(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { campaignId } = req.params;
            const validation = admin_campaign_schema_1.suspendCampaignSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.error.flatten().fieldErrors,
                });
            }
            const { reason, note } = validation.data;
            const campaign = yield prisma_1.prisma.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true },
                    },
                    milestones: true,
                },
            });
            if (!campaign) {
                return res.status(404).json({ success: false, message: 'Campaign not found' });
            }
            if (campaign.status === enums_1.CampaignStatus.SUSPENDED) {
                return res.status(400).json({ success: false, message: 'Campaign is already suspended' });
            }
            // Update campaign
            const updated = yield prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    status: enums_1.CampaignStatus.SUSPENDED,
                    suspensionReason: reason,
                    suspendedAt: new Date(),
                    suspendedBy: req.user.userId,
                },
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true },
                    },
                    milestones: true,
                },
            });
            // Create audit log
            yield prisma_1.prisma.auditLog.create({
                data: {
                    actorId: req.user.userId,
                    actorType: 'ADMIN',
                    actionType: 'CAMPAIGN_VERIFICATION',
                    targetType: 'CAMPAIGN',
                    targetId: updated.id,
                    note: JSON.stringify({
                        action: 'SUSPEND',
                        reason,
                        note: note || '',
                    }),
                },
            });
            // Format response
            const baseUrl = (0, campaign_helpers_1.getBaseUrl)(req);
            return res.json({
                success: true,
                message: 'Campaign suspended',
                campaign: Object.assign(Object.assign({}, updated), { coverImage: `${baseUrl}/uploads/${updated.coverImage}`, proofLinks: (0, campaign_helpers_1.convertProofLinksToUrls)((0, campaign_helpers_1.parseProofLinks)(updated.proofLinks), baseUrl) }),
            });
        }
        catch (error) {
            console.error('Suspend campaign error:', error);
            return res.status(500).json({ success: false, message: 'Failed to suspend campaign' });
        }
    });
}
/**
 * Resume campaign (SUSPENDED → LIVE)
 */
function resumeCampaign(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { campaignId } = req.params;
            const campaign = yield prisma_1.prisma.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true },
                    },
                    milestones: true,
                },
            });
            if (!campaign) {
                return res.status(404).json({ success: false, message: 'Campaign not found' });
            }
            if (campaign.status !== enums_1.CampaignStatus.SUSPENDED) {
                return res.status(400).json({ success: false, message: 'Only suspended campaigns can be resumed' });
            }
            // Update campaign
            const updated = yield prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    status: enums_1.CampaignStatus.LIVE,
                    suspensionReason: null,
                    suspendedAt: null,
                    suspendedBy: null,
                },
                include: {
                    beneficiary: {
                        select: { id: true, name: true, email: true },
                    },
                    milestones: true,
                },
            });
            // Create audit log
            yield prisma_1.prisma.auditLog.create({
                data: {
                    actorId: req.user.userId,
                    actorType: 'ADMIN',
                    actionType: 'CAMPAIGN_VERIFICATION',
                    targetType: 'CAMPAIGN',
                    targetId: updated.id,
                    note: JSON.stringify({
                        action: 'RESUME',
                    }),
                },
            });
            // Format response
            const baseUrl = (0, campaign_helpers_1.getBaseUrl)(req);
            return res.json({
                success: true,
                message: 'Campaign resumed',
                campaign: Object.assign(Object.assign({}, updated), { coverImage: `${baseUrl}/uploads/${updated.coverImage}`, proofLinks: (0, campaign_helpers_1.convertProofLinksToUrls)((0, campaign_helpers_1.parseProofLinks)(updated.proofLinks), baseUrl) }),
            });
        }
        catch (error) {
            console.error('Resume campaign error:', error);
            return res.status(500).json({ success: false, message: 'Failed to resume campaign' });
        }
    });
}
/**
 * ==================== DELETION (SOFT DELETE) ====================
 */
/**
 * Soft delete campaign (mark as inactive)
 */
function deleteCampaign(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { campaignId } = req.params;
            const validation = admin_campaign_schema_1.deleteCampaignSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.error.flatten().fieldErrors,
                });
            }
            const { reason, note } = validation.data;
            const campaign = yield prisma_1.prisma.campaign.findUnique({
                where: { id: campaignId },
            });
            if (!campaign) {
                return res.status(404).json({ success: false, message: 'Campaign not found' });
            }
            if (campaign.status === enums_1.CampaignStatus.LIVE) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete a live campaign. Suspend it first.',
                });
            }
            if (campaign.donationCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete a campaign that has received donations. Archive instead.',
                });
            }
            // Soft delete
            const updated = yield prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    isActive: false,
                    deletedAt: new Date(),
                },
            });
            // Create audit log
            yield prisma_1.prisma.auditLog.create({
                data: {
                    actorId: req.user.userId,
                    actorType: 'ADMIN',
                    actionType: 'CAMPAIGN_VERIFICATION',
                    targetType: 'CAMPAIGN',
                    targetId: updated.id,
                    note: JSON.stringify({
                        action: 'DELETE',
                        reason,
                        note: note || '',
                    }),
                },
            });
            return res.json({
                success: true,
                message: 'Campaign deleted (soft delete)',
            });
        }
        catch (error) {
            console.error('Delete campaign error:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete campaign' });
        }
    });
}
/**
 * ==================== ANALYTICS ====================
 */
/**
 * Get campaign statistics
 */
function getCampaignStats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { campaignId } = req.params;
            const campaign = yield prisma_1.prisma.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    moneyDonations: true,
                    itemDonations: true,
                    milestones: true,
                },
            });
            if (!campaign) {
                return res.status(404).json({ success: false, message: 'Campaign not found' });
            }
            const totalRaised = campaign.moneyDonations.reduce((sum, d) => sum + Number(d.amount), 0);
            const completionPercentage = Math.round((totalRaised / Number(campaign.targetAmount)) * 100);
            const milestonesCompleted = campaign.milestones.filter(m => m.completed).length;
            const stats = {
                campaignId: campaign.id,
                totalRaised: totalRaised.toString(),
                donationCount: campaign.donationCount,
                averageDonation: campaign.donationCount > 0 ? (totalRaised / campaign.donationCount).toFixed(2) : '0',
                itemDonationCount: campaign.itemDonations.length,
                shareCount: campaign.shareCount,
                viewCount: campaign.viewCount,
                completionPercentage,
                milestonesCompleted,
                totalMilestones: campaign.milestones.length,
            };
            return res.json({ success: true, stats });
        }
        catch (error) {
            console.error('Get campaign stats error:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch campaign stats' });
        }
    });
}
function completeCampaign(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { campaignId } = req.params;
            const campaign = yield prisma_1.prisma.campaign.findUnique({
                where: { id: campaignId },
            });
            if (!campaign) {
                return res.status(404).json({ success: false, message: 'Campaign not found' });
            }
            if (campaign.status !== enums_1.CampaignStatus.LIVE) {
                return res.status(400).json({ success: false, message: 'Only LIVE campaigns can be completed.' });
            }
            const updated = yield prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    status: enums_1.CampaignStatus.COMPLETED,
                },
            });
            yield prisma_1.prisma.auditLog.create({
                data: {
                    actorId: req.user.userId,
                    actorType: 'ADMIN',
                    actionType: 'CAMPAIGN_VERIFICATION',
                    targetType: 'CAMPAIGN',
                    targetId: updated.id,
                    note: `Campaign marked as COMPLETED`,
                },
            });
            return res.json({
                success: true,
                message: 'Campaign marked as completed',
                campaign: updated,
            });
        }
        catch (error) {
            console.error('Complete campaign error:', error);
            return res.status(500).json({ success: false, message: 'Failed to complete campaign' });
        }
    });
}
