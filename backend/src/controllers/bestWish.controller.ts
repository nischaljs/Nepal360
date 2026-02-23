import { Response } from 'express';
import { catchAsync } from '../middlewares/errohandler.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { prisma } from '../lib/prisma.js';

export const getCampaignWishes = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id: campaignId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const [wishes, total] = await Promise.all([
    prisma.bestWish.findMany({
      where: { campaignId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bestWish.count({ where: { campaignId } }),
  ]);

  res.json({
    success: true,
    data: {
      wishes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

export const createBestWish = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id: donationId } = req.params;
  const { message, cardStyle, isAnonymous } = req.body;

  const user = authMiddleware(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Please login to send best wishes' });
  }

  const donation = await prisma.moneyDonation.findUnique({
    where: { id: donationId },
    include: { campaign: true },
  });

  if (!donation) {
    return res.status(404).json({ success: false, message: 'Donation not found' });
  }

  if (donation.donorId !== user.userId) {
    return res.status(403).json({ success: false, message: 'You can only send wishes for your own donations' });
  }

  const existingWish = await prisma.bestWish.findUnique({ where: { donationId } });
  if (existingWish) {
    return res.status(400).json({ success: false, message: 'A wish has already been sent for this donation' });
  }

  const wish = await prisma.bestWish.create({
    data: {
      donationId,
      userId: user.userId,
      campaignId: donation.campaignId,
      message,
      cardStyle: cardStyle || 'simple',
      isAnonymous: isAnonymous || false,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  res.status(201).json({ success: true, data: wish });
});

export const getDonationWish = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id: donationId } = req.params;

  const wish = await prisma.bestWish.findUnique({
    where: { donationId },
    include: { user: { select: { id: true, name: true } } },
  });

  if (!wish) {
    return res.status(404).json({ success: false, message: 'Wish not found' });
  }

  res.json({ success: true, data: wish });
});

export const updateBestWish = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id: donationId } = req.params;
  const { message, cardStyle, isAnonymous } = req.body;

  const user = authMiddleware(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Please login' });
  }

  const existingWish = await prisma.bestWish.findUnique({ where: { donationId } });
  if (!existingWish) {
    return res.status(404).json({ success: false, message: 'Wish not found' });
  }

  if (existingWish.userId !== user.userId) {
    return res.status(403).json({ success: false, message: 'You can only edit your own wishes' });
  }

  const wish = await prisma.bestWish.update({
    where: { donationId },
    data: {
      message: message || existingWish.message,
      cardStyle: cardStyle || existingWish.cardStyle,
      isAnonymous: isAnonymous !== undefined ? isAnonymous : existingWish.isAnonymous,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  res.json({ success: true, data: wish });
});

export const deleteBestWish = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id: donationId } = req.params;

  const user = authMiddleware(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Please login' });
  }

  const existingWish = await prisma.bestWish.findUnique({ where: { donationId } });
  if (!existingWish) {
    return res.status(404).json({ success: false, message: 'Wish not found' });
  }

  if (existingWish.userId !== user.userId) {
    return res.status(403).json({ success: false, message: 'You can only delete your own wishes' });
  }

  await prisma.bestWish.delete({ where: { donationId } });

  res.json({ success: true, message: 'Wish deleted successfully' });
});
