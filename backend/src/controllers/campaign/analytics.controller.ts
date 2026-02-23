import { Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import type { AuthenticatedRequest } from '../../types/auth.types';

export const getCampaignAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: campaignId } = req.params;
    const { userId } = req.user!;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { beneficiaryId: true, visits: true, shareCount: true, donationCount: true },
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.beneficiaryId !== userId) {
      return res.status(403).json({ success: false, message: 'Only the campaign owner can view analytics' });
    }

    const moneyDonations = await prisma.moneyDonation.findMany({
      where: { campaignId, status: 'COMPLETED' },
      include: { donor: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const itemDonations = await prisma.itemDonation.findMany({
      where: { campaignId },
      include: { donor: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const totalMoneyRaised = moneyDonations.reduce(
      (sum: number, d: any) => sum + Number(d.amount), 0
    );
    const totalItemDonations = itemDonations.length;
    const uniqueDonorIds = new Set([
      ...moneyDonations.map((d: any) => d.donorId),
      ...itemDonations.map((d: any) => d.donorId),
    ]);
    const totalDonors = uniqueDonorIds.size;
    const averageDonation = moneyDonations.length > 0
      ? totalMoneyRaised / moneyDonations.length
      : 0;

    const conversionRate = campaign.visits > 0
      ? ((totalDonors / campaign.visits) * 100)
      : 0;

    // Daily trend (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyMap: Record<string, { amount: number; count: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { amount: 0, count: 0 };
    }

    for (const d of moneyDonations) {
      const key = new Date(d.createdAt).toISOString().split('T')[0];
      if (key in dailyMap) {
        dailyMap[key].amount += Number(d.amount);
        dailyMap[key].count += 1;
      }
    }

    const donationTrend = Object.entries(dailyMap)
      .map(([date, data]) => ({ date, amount: data.amount, count: data.count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Donations by hour of day
    const hourlyMap: Record<number, { amount: number; count: number }> = {};
    for (let h = 0; h < 24; h++) {
      hourlyMap[h] = { amount: 0, count: 0 };
    }
    for (const d of moneyDonations) {
      const hour = new Date(d.createdAt).getHours();
      hourlyMap[hour].amount += Number(d.amount);
      hourlyMap[hour].count += 1;
    }
    const donationsByHour = Object.entries(hourlyMap).map(([hour, data]) => ({
      hour: parseInt(hour),
      amount: data.amount,
      count: data.count,
    }));

    // Top donors
    const donorTotals: Record<string, { donorId: string; name: string; totalDonated: number }> = {};
    for (const d of moneyDonations) {
      const did = d.donorId;
      if (!donorTotals[did]) {
        donorTotals[did] = { donorId: did, name: (d.donor as any).name, totalDonated: 0 };
      }
      donorTotals[did].totalDonated += Number(d.amount);
    }
    const topDonors = Object.values(donorTotals)
      .sort((a, b) => b.totalDonated - a.totalDonated)
      .slice(0, 5);

    // Recent activity (last 20 donations)
    const allDonations = [
      ...moneyDonations.map((d: any) => ({
        id: d.id,
        type: 'money' as const,
        donorName: d.donor.name,
        amount: Number(d.amount),
        createdAt: d.createdAt,
      })),
      ...itemDonations.map((d: any) => ({
        id: d.id,
        type: 'item' as const,
        donorName: d.donor.name,
        itemName: d.itemName,
        quantity: d.quantity,
        createdAt: d.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    res.status(200).json({
      success: true,
      data: {
        totalMoneyRaised,
        totalItemDonations,
        totalDonors,
        visitors: campaign.visits,
        shares: campaign.shareCount,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        averageDonation: parseFloat(averageDonation.toFixed(2)),
        donationTrend,
        donationsByHour,
        topDonors,
        recentActivity: allDonations,
      },
    });
  } catch (error) {
    next(error);
  }
};
