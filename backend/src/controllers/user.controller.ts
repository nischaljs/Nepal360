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

export const getMyImpact = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user!;

    const [
      moneyDonations,
      itemDonations,
      badgeCount,
      allDonorStats,
    ] = await Promise.all([
      prisma.moneyDonation.findMany({
        where: { donorId: userId, status: 'COMPLETED' },
        include: { campaign: { select: { id: true, title: true, category: true } } },
      }),
      prisma.itemDonation.findMany({
        where: { donorId: userId },
      }),
      prisma.userBadge.count({ where: { userId } }),
      prisma.donorStats.findMany({
        orderBy: { totalMoneyDonated: 'desc' },
        select: { userId: true },
      }),
    ]);

    const totalMoneyDonated = moneyDonations.reduce(
      (sum: number, d: any) => sum + Number(d.amount), 0
    );
    const totalItemsPledged = itemDonations.length;
    const campaignIds = [...new Set(moneyDonations.map((d: any) => d.campaignId))];
    const campaignsSupported = campaignIds.length;

    const rankIndex = allDonorStats.findIndex((s: any) => s.userId === userId);
    const donorRank = rankIndex >= 0 ? rankIndex + 1 : allDonorStats.length + 1;

    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const monthlyMap: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = 0;
    }
    for (const d of moneyDonations) {
      const created = new Date(d.createdAt);
      if (created >= twelveMonthsAgo) {
        const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
        if (key in monthlyMap) monthlyMap[key] += Number(d.amount);
      }
    }
    const monthlyBreakdown = Object.entries(monthlyMap)
      .map(([key, amount]) => {
        const [year, month] = key.split('-');
        return { month: parseInt(month), year: parseInt(year), amount };
      })
      .sort((a, b) => a.year - b.year || a.month - b.month);

    const categoryMap: Record<string, { amount: number; count: number }> = {};
    for (const d of moneyDonations) {
      const cat = (d.campaign as any).category || 'general';
      if (!categoryMap[cat]) categoryMap[cat] = { amount: 0, count: 0 };
      categoryMap[cat].amount += Number(d.amount);
      categoryMap[cat].count += 1;
    }
    const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    }));

    const campaignTotals: Record<string, { campaignId: string; title: string; totalDonated: number }> = {};
    for (const d of moneyDonations) {
      const cid = d.campaignId;
      if (!campaignTotals[cid]) {
        campaignTotals[cid] = { campaignId: cid, title: (d.campaign as any).title, totalDonated: 0 };
      }
      campaignTotals[cid].totalDonated += Number(d.amount);
    }
    const topCampaigns = Object.values(campaignTotals)
      .sort((a, b) => b.totalDonated - a.totalDonated)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalMoneyDonated,
        totalItemsPledged,
        campaignsSupported,
        donorRank,
        badgesEarned: badgeCount,
        monthlyBreakdown,
        categoryBreakdown,
        topCampaigns,
      },
    });
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
