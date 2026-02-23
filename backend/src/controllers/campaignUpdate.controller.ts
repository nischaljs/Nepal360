import { Response } from 'express';
import { catchAsync } from '../middlewares/errohandler.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { prisma } from '../lib/prisma.js';

export const getCampaignUpdates = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id: campaignId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const [updates, total] = await Promise.all([
    prisma.campaignUpdate.findMany({
      where: { campaignId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.campaignUpdate.count({ where: { campaignId } }),
  ]);

  res.json({
    success: true,
    data: {
      updates,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

export const getCampaignUpdate = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { updateId } = req.params;

  const update = await prisma.campaignUpdate.findUnique({
    where: { id: updateId },
    include: {
      user: { select: { id: true, name: true } },
      campaign: { select: { id: true, title: true, beneficiaryId: true } },
    },
  });

  if (!update) {
    return res.status(404).json({ success: false, message: 'Update not found' });
  }

  res.json({ success: true, data: update });
});

export const createCampaignUpdate = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id: campaignId } = req.params;
  const { title, content, images, isMilestone } = req.body;

  const user = authMiddleware(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Please login to create updates' });
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { beneficiaryId: true },
  });

  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  if (campaign.beneficiaryId !== user.userId) {
    return res.status(403).json({ success: false, message: 'Only the campaign owner can create updates' });
  }

  const update = await prisma.campaignUpdate.create({
    data: {
      campaignId,
      userId: user.userId,
      title,
      content,
      images: JSON.stringify(images || []),
      isMilestone: isMilestone || false,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  res.status(201).json({ success: true, data: update });
});

export const updateCampaignUpdate = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { updateId } = req.params;
  const { title, content, images, isMilestone } = req.body;

  const user = authMiddleware(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Please login' });
  }

  const existingUpdate = await prisma.campaignUpdate.findUnique({
    where: { id: updateId },
    include: { campaign: true },
  });

  if (!existingUpdate) {
    return res.status(404).json({ success: false, message: 'Update not found' });
  }

  if (existingUpdate.userId !== user.userId) {
    return res.status(403).json({ success: false, message: 'You can only edit your own updates' });
  }

  const update = await prisma.campaignUpdate.update({
    where: { id: updateId },
    data: {
      title: title || existingUpdate.title,
      content: content || existingUpdate.content,
      images: images ? JSON.stringify(images) : existingUpdate.images,
      isMilestone: isMilestone !== undefined ? isMilestone : existingUpdate.isMilestone,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  res.json({ success: true, data: update });
});

export const deleteCampaignUpdate = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { updateId } = req.params;

  const user = authMiddleware(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Please login' });
  }

  const existingUpdate = await prisma.campaignUpdate.findUnique({
    where: { id: updateId },
  });

  if (!existingUpdate) {
    return res.status(404).json({ success: false, message: 'Update not found' });
  }

  if (existingUpdate.userId !== user.userId) {
    return res.status(403).json({ success: false, message: 'You can only delete your own updates' });
  }

  await prisma.campaignUpdate.delete({ where: { id: updateId } });

  res.json({ success: true, message: 'Update deleted successfully' });
});
