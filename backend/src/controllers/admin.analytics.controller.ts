import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../types/auth.types';

export const getAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [
      totalUsers,
      totalCampaigns,
      totalItemDonations,
      moneyDonationAgg,
      campaignsByStatus,
      kycStats,
      topCampaigns,
      topDonors,
      recentActivity,
      monthlyUsers,
      monthlyCampaigns,
      monthlyDonations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.campaign.count({ where: { isActive: true } }),
      prisma.itemDonation.count(),
      prisma.moneyDonation.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.campaign.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { isActive: true },
      }),
      prisma.kYCProfile.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.campaign.findMany({
        where: { isActive: true },
        orderBy: { donationCount: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          targetAmount: true,
          status: true,
          donationCount: true,
          moneyDonations: {
            where: { status: 'COMPLETED' },
            select: { amount: true },
          },
        },
      }),
      prisma.donorStats.findMany({
        orderBy: { totalMoneyDonated: 'desc' },
        take: 5,
        select: {
          totalMoneyDonated: true,
          donationCount: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { actor: { select: { name: true } } },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: twelveMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.campaign.findMany({
        where: { createdAt: { gte: twelveMonthsAgo }, isActive: true },
        select: { createdAt: true },
      }),
      prisma.moneyDonation.findMany({
        where: { createdAt: { gte: twelveMonthsAgo }, status: 'COMPLETED' },
        select: { createdAt: true, amount: true },
      }),
    ]);

    const monthlyTrends = buildMonthlyTrends(
      twelveMonthsAgo,
      now,
      monthlyUsers,
      monthlyCampaigns,
      monthlyDonations
    );

    const statusBreakdown: Record<string, number> = {};
    for (const row of campaignsByStatus) {
      statusBreakdown[row.status] = row._count.id;
    }

    const kycBreakdown: Record<string, number> = {};
    for (const row of kycStats) {
      kycBreakdown[row.status] = row._count.id;
    }

    const topCampaignsFormatted = topCampaigns.map((c) => {
      const totalRaised = c.moneyDonations.reduce(
        (sum, d) => sum + Number(d.amount),
        0
      );
      return {
        id: c.id,
        title: c.title,
        targetAmount: Number(c.targetAmount),
        totalRaised,
        donationCount: c.donationCount,
        status: c.status,
      };
    });

    const topDonorsFormatted = topDonors.map((d) => ({
      id: d.user.id,
      name: d.user.name,
      email: d.user.email,
      totalDonated: Number(d.totalMoneyDonated),
      donationCount: d.donationCount,
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCampaigns,
          totalMoneyDonations: moneyDonationAgg._count.id,
          totalItemDonations,
          totalFundsRaised: Number(moneyDonationAgg._sum.amount ?? 0),
        },
        monthlyTrends,
        campaignStats: {
          byStatus: statusBreakdown,
        },
        topCampaigns: topCampaignsFormatted,
        topDonors: topDonorsFormatted,
        kycStats: kycBreakdown,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

function buildMonthlyTrends(
  start: Date,
  end: Date,
  users: { createdAt: Date }[],
  campaigns: { createdAt: Date }[],
  donations: { createdAt: Date; amount: unknown }[]
) {
  const months: {
    month: number;
    year: number;
    newUsers: number;
    newCampaigns: number;
    totalDonated: number;
    donationCount: number;
  }[] = [];

  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    months.push({
      month: current.getMonth() + 1,
      year: current.getFullYear(),
      newUsers: 0,
      newCampaigns: 0,
      totalDonated: 0,
      donationCount: 0,
    });
    current.setMonth(current.getMonth() + 1);
  }

  for (const u of users) {
    const key = `${u.createdAt.getFullYear()}-${u.createdAt.getMonth() + 1}`;
    const entry = months.find((m) => `${m.year}-${m.month}` === key);
    if (entry) entry.newUsers++;
  }

  for (const c of campaigns) {
    const key = `${c.createdAt.getFullYear()}-${c.createdAt.getMonth() + 1}`;
    const entry = months.find((m) => `${m.year}-${m.month}` === key);
    if (entry) entry.newCampaigns++;
  }

  for (const d of donations) {
    const key = `${d.createdAt.getFullYear()}-${d.createdAt.getMonth() + 1}`;
    const entry = months.find((m) => `${m.year}-${m.month}` === key);
    if (entry) {
      entry.totalDonated += Number(d.amount);
      entry.donationCount++;
    }
  }

  return months;
}
