import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { CampaignStatus } from '../../generated/prisma/enums';
import { AuthenticatedRequest } from '../types/auth.types';
import {
    approveCampaignSchema,
    rejectCampaignSchema,
    suspendCampaignSchema,
    deleteCampaignSchema,
    campaignFilterSchema,
} from '../schemas/admin.campaign.schema';
import {
    getBaseUrl,
    convertProofLinksToUrls,
    parseProofLinks,
} from '../utils/campaign.helpers';

/**
 * ==================== LIST & READ OPERATIONS ====================
 */

/**
 * Get all campaigns (with filtering)
 * Supports: status, beneficiaryId, isActive, sortBy, order
 */
export async function listCampaigns(req: AuthenticatedRequest, res: Response) {
    try {
        const validation = campaignFilterSchema.safeParse(req.query);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid filter parameters',
                errors: validation.error.flatten().fieldErrors,
            });
        }

        const { status, beneficiaryId, isActive, sortBy = 'createdAt', order = 'desc' } = validation.data;

        const where: any = {};
        if (status) where.status = status;
        if (beneficiaryId) where.beneficiaryId = beneficiaryId;
        if (isActive !== undefined) where.isActive = isActive;

        const campaigns = await prisma.campaign.findMany({
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
        const baseUrl = getBaseUrl(req);
        const formattedCampaigns = campaigns.map(c => ({
            ...c,
            coverImage: `${baseUrl}/uploads/${c.coverImage}`,
            proofLinks: convertProofLinksToUrls(parseProofLinks(c.proofLinks), baseUrl),
        }));

        return res.json({ success: true, campaigns: formattedCampaigns });
    } catch (error) {
        console.error('List campaigns error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
    }
}

/**
 * Get single campaign detail (admin view)
 */
export async function getCampaignDetail(req: AuthenticatedRequest, res: Response) {
    try {
        const { campaignId } = req.params;

        const campaign = await prisma.campaign.findUnique({
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
        const baseUrl = getBaseUrl(req);

        return res.json({
            success: true,
            campaign: {
                ...campaign,
                coverImage: `${baseUrl}/uploads/${campaign.coverImage}`,
                proofLinks: convertProofLinksToUrls(parseProofLinks(campaign.proofLinks), baseUrl),
            },
        });
    } catch (error) {
        console.error('Get campaign detail error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch campaign' });
    }
}

/**
 * Get campaigns awaiting verification
 */
export async function getVerificationQueue(req: AuthenticatedRequest, res: Response) {
    try {
        const campaigns = await prisma.campaign.findMany({
            where: {
                status: CampaignStatus.PENDING_VERIFICATION,
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
    } catch (error) {
        console.error('Get verification queue error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch verification queue' });
    }
}

/**
 * ==================== VERIFICATION ACTIONS ====================
 */

/**
 * Approve campaign → LIVE
 */
export async function approveCampaign(req: AuthenticatedRequest, res: Response) {
    try {
        const { campaignId } = req.params;
        const validation = approveCampaignSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
        }

        const campaign = await prisma.campaign.findUnique({
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

        if (campaign.status === CampaignStatus.LIVE) {
            return res.status(400).json({ success: false, message: 'Campaign is already live' });
        }

        // Update campaign status
        const updated = await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: CampaignStatus.LIVE,
                verifiedAt: new Date(),
                verifiedBy: req.user!.userId,
            },
            include: {
                beneficiary: {
                    select: { id: true, name: true, email: true },
                },
                milestones: true,
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                actorId: req.user!.userId,
                actorType: 'ADMIN',
                actionType: 'CAMPAIGN_VERIFICATION',
                details: JSON.stringify({
                    campaignId: updated.id,
                    action: 'APPROVE',
                    note: validation.data.note || '',
                }),
            },
        });

        // Format response
        const baseUrl = getBaseUrl(req);

        return res.json({
            success: true,
            message: 'Campaign approved and set to LIVE',
            campaign: {
                ...updated,
                coverImage: `${baseUrl}/uploads/${updated.coverImage}`,
                proofLinks: convertProofLinksToUrls(parseProofLinks(updated.proofLinks), baseUrl),
            },
        });
    } catch (error) {
        console.error('Approve campaign error:', error);
        return res.status(500).json({ success: false, message: 'Failed to approve campaign' });
    }
}

/**
 * Reject campaign
 */
export async function rejectCampaign(req: AuthenticatedRequest, res: Response) {
    try {
        const { campaignId } = req.params;
        const validation = rejectCampaignSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
        }

        const { reason, note } = validation.data;

        const campaign = await prisma.campaign.findUnique({
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

        if (campaign.status === CampaignStatus.LIVE) {
            return res.status(400).json({ success: false, message: 'Cannot reject a live campaign. Use suspend instead.' });
        }

        // Update campaign
        const updated = await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                rejectionReason: reason,
                rejectedAt: new Date(),
                rejectedBy: req.user!.userId,
            },
            include: {
                beneficiary: {
                    select: { id: true, name: true, email: true },
                },
                milestones: true,
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                actorId: req.user!.userId,
                actorType: 'ADMIN',
                actionType: 'CAMPAIGN_VERIFICATION',
                details: JSON.stringify({
                    campaignId: updated.id,
                    action: 'REJECT',
                    reason,
                    note: note || '',
                }),
            },
        });

        // Format response
        const baseUrl = getBaseUrl(req);

        return res.json({
            success: true,
            message: 'Campaign rejected',
            campaign: {
                ...updated,
                coverImage: `${baseUrl}/uploads/${updated.coverImage}`,
                proofLinks: convertProofLinksToUrls(parseProofLinks(updated.proofLinks), baseUrl),
            },
        });
    } catch (error) {
        console.error('Reject campaign error:', error);
        return res.status(500).json({ success: false, message: 'Failed to reject campaign' });
    }
}

/**
 * ==================== MODERATION ACTIONS ====================
 */

/**
 * Suspend campaign
 */
export async function suspendCampaign(req: AuthenticatedRequest, res: Response) {
    try {
        const { campaignId } = req.params;
        const validation = suspendCampaignSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
        }

        const { reason, note } = validation.data;

        const campaign = await prisma.campaign.findUnique({
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

        if (campaign.status === CampaignStatus.SUSPENDED) {
            return res.status(400).json({ success: false, message: 'Campaign is already suspended' });
        }

        // Update campaign
        const updated = await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: CampaignStatus.SUSPENDED,
                suspensionReason: reason,
                suspendedAt: new Date(),
                suspendedBy: req.user!.userId,
            },
            include: {
                beneficiary: {
                    select: { id: true, name: true, email: true },
                },
                milestones: true,
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                actorId: req.user!.userId,
                actorType: 'ADMIN',
                actionType: 'CAMPAIGN_VERIFICATION',
                details: JSON.stringify({
                    campaignId: updated.id,
                    action: 'SUSPEND',
                    reason,
                    note: note || '',
                }),
            },
        });

        // Format response
        const baseUrl = getBaseUrl(req);

        return res.json({
            success: true,
            message: 'Campaign suspended',
            campaign: {
                ...updated,
                coverImage: `${baseUrl}/uploads/${updated.coverImage}`,
                proofLinks: convertProofLinksToUrls(parseProofLinks(updated.proofLinks), baseUrl),
            },
        });
    } catch (error) {
        console.error('Suspend campaign error:', error);
        return res.status(500).json({ success: false, message: 'Failed to suspend campaign' });
    }
}

/**
 * Resume campaign (SUSPENDED → LIVE)
 */
export async function resumeCampaign(req: AuthenticatedRequest, res: Response) {
    try {
        const { campaignId } = req.params;

        const campaign = await prisma.campaign.findUnique({
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

        if (campaign.status !== CampaignStatus.SUSPENDED) {
            return res.status(400).json({ success: false, message: 'Only suspended campaigns can be resumed' });
        }

        // Update campaign
        const updated = await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: CampaignStatus.LIVE,
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
        await prisma.auditLog.create({
            data: {
                actorId: req.user!.userId,
                actorType: 'ADMIN',
                actionType: 'CAMPAIGN_VERIFICATION',
                details: JSON.stringify({
                    campaignId: updated.id,
                    action: 'RESUME',
                }),
            },
        });

        // Format response
        const baseUrl = getBaseUrl(req);

        return res.json({
            success: true,
            message: 'Campaign resumed',
            campaign: {
                ...updated,
                coverImage: `${baseUrl}/uploads/${updated.coverImage}`,
                proofLinks: convertProofLinksToUrls(parseProofLinks(updated.proofLinks), baseUrl),
            },
        });
    } catch (error) {
        console.error('Resume campaign error:', error);
        return res.status(500).json({ success: false, message: 'Failed to resume campaign' });
    }
}

/**
 * ==================== DELETION (SOFT DELETE) ====================
 */

/**
 * Soft delete campaign (mark as inactive)
 */
export async function deleteCampaign(req: AuthenticatedRequest, res: Response) {
    try {
        const { campaignId } = req.params;
        const validation = deleteCampaignSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
        }

        const { reason, note } = validation.data;

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        if (campaign.status === CampaignStatus.LIVE) {
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
        const updated = await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                isActive: false,
                deletedAt: new Date(),
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                actorId: req.user!.userId,
                actorType: 'ADMIN',
                actionType: 'CAMPAIGN_VERIFICATION',
                details: JSON.stringify({
                    campaignId: updated.id,
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
    } catch (error) {
        console.error('Delete campaign error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete campaign' });
    }
}

/**
 * ==================== ANALYTICS ====================
 */

/**
 * Get campaign statistics
 */
export async function getCampaignStats(req: AuthenticatedRequest, res: Response) {
    try {
        const { campaignId } = req.params;

        const campaign = await prisma.campaign.findUnique({
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
    } catch (error) {
        console.error('Get campaign stats error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch campaign stats' });
    }
}
