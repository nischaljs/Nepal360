import { Request, Response } from 'express';
import { CampaignStatus } from '../../../generated/prisma/enums';
import { prisma } from '../../lib/prisma';
import { createCampaignSchema, createMilestoneSchema, updateCampaignSchema } from '../../schemas/campaign.schema';
import type { AuthenticatedRequest } from '../../types/auth.types';
import {
    convertProofLinksToUrls,
    getRelativePath,
    parseProofLinks
} from '../../utils/file';


const getBaseUrl = (req: Request): string => {
    return `${req.protocol}://${req.get('host')}`;
};


export async function createCampaign(req: AuthenticatedRequest, res: Response) {
    try {

        const validation = createCampaignSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors
            });
        }

        const { title, description, targetAmount } = validation.data;
        const files = req.files as { [key: string]: Express.Multer.File[] };

        // Check if cover image is provided
        if (!files?.coverImage || files.coverImage.length === 0) {
            return res.status(400).json({ success: false, message: 'Cover image is required' });
        }

        const coverImageRelativePath = getRelativePath(files.coverImage[0].path);
        const proofLinks = files.proofs
            ? files.proofs.map(f => getRelativePath(f.path))
            : [];

        const campaign = await prisma.campaign.create({
            data: {
                beneficiaryId: req.user!.userId,
                title,
                description,
                coverImage: coverImageRelativePath,
                proofLinks: proofLinks.length > 0 ? JSON.stringify(proofLinks) : null,
                targetAmount,
                status: CampaignStatus.PENDING_VERIFICATION,
            },
            include: {
                beneficiary: {
                    select: { id: true, name: true, email: true }
                },
                milestones: true,
            },
        });


        const baseUrl = getBaseUrl(req);
        const proofUrls = convertProofLinksToUrls(parseProofLinks(campaign.proofLinks), baseUrl);

        return res.status(201).json({
            success: true,
            campaign: {
                ...campaign,
                coverImage: `${baseUrl}/uploads/${campaign.coverImage}`,
                proofLinks: proofUrls,
            }
        });
    } catch (error) {
        console.error('Campaign creation error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create campaign' });
    }
}

/**
 * Get My Campaigns
 */
export async function getMyCampaigns(req: AuthenticatedRequest, res: Response) {
    try {
        const baseUrl = getBaseUrl(req);
        const campaigns = await prisma.campaign.findMany({
            where: { beneficiaryId: req.user!.userId },
            include: {
                beneficiary: {
                    select: { id: true, name: true, email: true }
                },
                milestones: true,
            },
            orderBy: { createdAt: 'desc' },
        });


        const formattedCampaigns = campaigns.map(campaign => ({
            ...campaign,
            coverImage: `${baseUrl}/uploads/${campaign.coverImage}`,
            proofLinks: convertProofLinksToUrls(parseProofLinks(campaign.proofLinks), baseUrl),
        }));

        return res.json({ success: true, campaigns: formattedCampaigns });
    } catch (error) {
        console.error('Fetch campaigns error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
    }
}


export async function getAllCampaigns(req: Request, res: Response) {
    try {
        const campaigns = await prisma.campaign.findMany({
            where: {
                status: {
                    in: [CampaignStatus.LIVE, CampaignStatus.COMPLETED],
                },
            },
            include: {
                beneficiary: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const baseUrl = getBaseUrl(req);
        const formattedCampaigns = campaigns.map(c => ({
            ...c,
            coverImage: `${baseUrl}/uploads/${c.coverImage}`,
            proofLinks: convertProofLinksToUrls(parseProofLinks(c.proofLinks), baseUrl),
        }));

        return res.status(200).json({ success: true, campaigns: formattedCampaigns });
    } catch (error) {
        console.error("Get all campaigns error:", error);
        return res.status(500).json({ success: false, message: 'Failed to get campaigns' });
    }
}


export async function getCampaignPublic(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const campaign = await prisma.campaign.findFirst({
            where: {
                id,
                status: {
                    in: [CampaignStatus.LIVE, CampaignStatus.COMPLETED],
                }
            },
            include: {
                beneficiary: { select: { id: true, name: true } },
                milestones: { orderBy: { amount: 'asc' } },
            },
        });

        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found or not live' });
        }

        const baseUrl = getBaseUrl(req);

        return res.status(200).json({
            success: true,
            campaign: {
                ...campaign,
                coverImage: `${baseUrl}/uploads/${campaign.coverImage}`,
                proofLinks: convertProofLinksToUrls(parseProofLinks(campaign.proofLinks), baseUrl),
                visits: campaign.visits,
                shareCount: campaign.shareCount,
            }
        });
    } catch (error) {
        console.error("Get campaign public error:", error);
        return res.status(500).json({ success: false, message: 'Failed to get campaign' });
    }
}

/**
 * Get Campaign Detail
 */
export async function getCampaignById(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;

        const campaign = await prisma.campaign.findFirst({
            where: {
                id,
                beneficiaryId: req.user!.userId,
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
            campaign: {
                ...campaign,
                coverImage: `${baseUrl}/uploads/${campaign.coverImage}`,
                proofLinks: convertProofLinksToUrls(parseProofLinks(campaign.proofLinks), baseUrl),
                visits: campaign.visits,
                shareCount: campaign.shareCount,
            }
        });
    } catch (error) {
        console.error('Fetch campaign error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch campaign' });
    }
}

/**
 * Update Campaign (only before LIVE)
 */
export async function updateCampaign(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;

        // Validate input
        const validation = updateCampaignSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors
            });
        }

        const campaign = await prisma.campaign.findFirst({
            where: { id, beneficiaryId: req.user!.userId },
        });

        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        if (campaign.status === CampaignStatus.LIVE) {
            return res.status(403).json({ success: false, message: 'Live campaigns cannot be edited' });
        }

        const updated = await prisma.campaign.update({
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
            campaign: {
                ...updated,
                coverImage: `${baseUrl}/uploads/${updated.coverImage}`,
                proofLinks: convertProofLinksToUrls(parseProofLinks(updated.proofLinks), baseUrl),
            }
        });
    } catch (error) {
        console.error('Update campaign error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update campaign' });
    }
}

/**
 * Add Milestone
 */
export async function addMilestone(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;

        // Validate input
        const validation = createMilestoneSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors
            });
        }

        const { title, amount } = validation.data;

        const campaign = await prisma.campaign.findFirst({
            where: { id, beneficiaryId: req.user!.userId },
        });

        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        const milestone = await prisma.milestone.create({
            data: {
                campaignId: id,
                title,
                amount,
            },
        });

        return res.status(201).json({ success: true, milestone });
    } catch (error) {
        console.error('Add milestone error:', error);
        return res.status(500).json({ success: false, message: 'Failed to add milestone' });
    }
}

/**
 * Delete Milestone
 */
export async function deleteMilestone(req: AuthenticatedRequest, res: Response) {
    try {
        const { id, milestoneId } = req.params;

        const milestone = await prisma.milestone.findUnique({
            where: { id: milestoneId },
            include: { campaign: true },
        });

        if (!milestone || milestone.campaign.beneficiaryId !== req.user!.userId) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }

        await prisma.milestone.delete({ where: { id: milestoneId } });

        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to delete milestone' });
    }
}

export const getCampaignStats = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const moneyDonations = await prisma.moneyDonation.findMany({
            where: {
                campaignId: id,
                status: 'COMPLETED'
            }
        });

        const itemDonations = await prisma.itemDonation.findMany({
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

    } catch (error) {
        console.error('Get campaign stats error:', error);
        return res.status(500).json({ success: false, message: 'Failed to get campaign stats' });
    }
}
