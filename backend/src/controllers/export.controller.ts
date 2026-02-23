import { Response, NextFunction } from 'express';
import { format } from 'date-fns';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../types/auth.types';

const escapeCsvField = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const exportMyDonations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId: donorId } = req.user!;

    const donations = await prisma.moneyDonation.findMany({
      where: { donorId },
      include: {
        campaign: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'Date,Campaign,Amount (NPR),Status,Visibility';

    const rows = donations.map((d) => {
      const date = escapeCsvField(format(d.createdAt, 'yyyy-MM-dd'));
      const campaign = escapeCsvField(d.campaign.title);
      const amount = escapeCsvField(d.amount.toString());
      const status = escapeCsvField(d.status);
      const visibility = escapeCsvField(d.visibility);

      return `${date},${campaign},${amount},${status},${visibility}`;
    });

    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=donations-export.csv');

    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
