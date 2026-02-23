import { NextFunction, Request, Response } from 'express';
import {prisma} from '../lib/prisma';
import type { AuthenticatedRequest } from '../types/auth.types';

const findOrCreateDonorStats = async (userId: string) => {
  let stats = await prisma.donorStats.findUnique({
    where: { userId },
  });

  if (!stats) {
    stats = await prisma.donorStats.create({
      data: { userId },
    });
  }

  return stats;
};

export const getMyStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId: userId } = req.user!;
    const stats = await findOrCreateDonorStats(userId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getMyBadges = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId: userId } = req.user!;
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: {
        awardedAt: 'desc',
      },
    });
    res.status(200).json({ success: true, data: userBadges });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const stats = await findOrCreateDonorStats(userId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getMyDonationHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
    try {
        const { userId: donorId } = req.user!;

        const moneyDonations = await prisma.moneyDonation.findMany({
            where: { donorId, status: 'COMPLETED' },
            include: { campaign: { select: { id: true, title: true } } },
        });

        const itemDonations = await prisma.itemDonation.findMany({
            where: { donorId },
            include: { campaign: { select: { id: true, title: true } } },
        });

        const formattedMoneyDonations = moneyDonations.map((d: any) => ({
            type: 'Money',
            ...d,
        }));

        const formattedItemDonations = itemDonations.map((d: any) => ({
            type: 'Item',
            ...d,
        }));

        const allDonations = [...formattedMoneyDonations, ...formattedItemDonations];

        allDonations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        res.status(200).json({ success: true, data: allDonations });

    } catch (error) {
        next(error);
    }
}
