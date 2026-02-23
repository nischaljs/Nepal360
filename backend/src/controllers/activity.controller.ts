import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const getActivityFeed = async (_req: any, res: Response, next: NextFunction) => {
  try {
    const [recentDonations, recentCampaigns, recentItemDonations] = await Promise.all([
      prisma.moneyDonation.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          donor: { select: { name: true } },
          campaign: { select: { id: true, title: true } },
        },
      }),
      prisma.campaign.findMany({
        where: { status: 'LIVE', isActive: true },
        orderBy: { verifiedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          coverImage: true,
          verifiedAt: true,
          beneficiary: { select: { name: true } },
        },
      }),
      prisma.itemDonation.findMany({
        where: { status: { in: ['DELIVERED', 'CONFIRMED'] } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          donor: { select: { name: true } },
          campaign: { select: { id: true, title: true } },
        },
      }),
    ]);

    const activities = [
      ...recentDonations.map((d) => ({
        type: 'donation' as const,
        id: d.id,
        message: `${d.visibility === 'ANONYMOUS' ? 'Anonymous' : d.donor.name} donated NPR ${d.amount.toString()} to`,
        campaignId: d.campaign.id,
        campaignTitle: d.campaign.title,
        timestamp: d.createdAt,
      })),
      ...recentCampaigns.map((c) => ({
        type: 'campaign' as const,
        id: c.id,
        message: `New campaign "${c.title}" launched by ${c.beneficiary.name}`,
        campaignId: c.id,
        campaignTitle: c.title,
        timestamp: c.verifiedAt || new Date(),
      })),
      ...recentItemDonations.map((d) => ({
        type: 'item' as const,
        id: d.id,
        message: `${d.donor.name} pledged ${d.itemName} (${d.quantity}) to`,
        campaignId: d.campaign.id,
        campaignTitle: d.campaign.title,
        timestamp: d.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};
