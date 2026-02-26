import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { prisma } from '../lib/prisma';
import { getBaseUrl } from '../utils/campaign.helpers';

export const toggleBookmark = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({ success: false, message: 'campaignId is required' });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const existing = await prisma.bookmark.findUnique({
      where: { userId_campaignId: { userId, campaignId } },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { userId_campaignId: { userId, campaignId } },
      });
      return res.json({ success: true, bookmarked: false });
    }

    await prisma.bookmark.create({
      data: { userId, campaignId },
    });

    res.status(201).json({ success: true, bookmarked: true });
  } catch (error) {
    next(error);
  }
};

export const getMyBookmarks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const baseUrl = getBaseUrl(req);
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        campaign: {
          include: {
            beneficiary: { select: { id: true, name: true } },
            moneyDonations: {
              where: { status: 'COMPLETED' },
              select: { amount: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = bookmarks.map((b) => ({
      ...b,
      campaign: {
        ...b.campaign,
        coverImage: `${baseUrl}/uploads/${b.campaign.coverImage}`,
        totalMoneyRaised: b.campaign.moneyDonations.reduce((sum, d) => sum + d.amount.toNumber(), 0),
        moneyDonations: undefined,
      },
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

export const checkBookmark = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { campaignId } = req.params;

    const existing = await prisma.bookmark.findUnique({
      where: { userId_campaignId: { userId, campaignId } },
    });

    res.json({ success: true, bookmarked: !!existing });
  } catch (error) {
    next(error);
  }
};
