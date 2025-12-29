import { Request, Response } from 'express';
import { CampaignStatus } from '../../generated/prisma/enums';
import { prisma } from '../lib/prisma';
import { createCampaignSchema, createMilestoneSchema, updateCampaignSchema } from '../schemas/campaign.schema';
import { AuthenticatedRequest } from '../types/auth.types';
import {
    convertProofLinksToUrls,
    getRelativePath,
    parseProofLinks
} from '../utils/file';


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
