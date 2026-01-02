import { NextFunction, Request, Response } from 'express';
import {prisma} from '../lib/prisma';
import { rejectItemDonationSchema } from '../schemas/admin.itemDonation.schema';
import { ZodError } from 'zod';
import { ItemDonationStatus } from '../../generated/prisma/enums';
import { AuthenticatedRequest } from '../types/auth.types';

export const listItemDonations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status } = req.query;

  if (
    status &&
    !['PLEDGED', 'DELIVERED', 'CONFIRMED', 'REJECTED'].includes(status as string)
  ) {
    return res.status(400).json({ message: 'Invalid status filter.' });
  }

  try {
    const donations = await prisma.itemDonation.findMany({
      where: {
        status: status ? (status as ItemDonationStatus) : undefined,
      },
      include: {
        donor: {
          select: { id: true, name: true, email: true },
        },
        campaign: {
          select: { id: true, title: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(donations);
  } catch (error) {
    next(error);
  }
};

export const confirmItemDonation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { userId: adminId } = req.user!;

    const donation = await prisma.itemDonation.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN',
        actorId: adminId,
        actionType: 'ITEM_CONFIRMATION',
        targetType: 'ITEM_DONATION',
        targetId: donation.id,
        note: 'Item donation confirmed',
      },
    });
    
    // TODO: Update DonorStats and Campaign donationCount

    res.status(200).json(donation);
  } catch (error) {
    next(error);
  }
};

export const rejectItemDonation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { userId: adminId } = req.user!;
    const { reason } = rejectItemDonationSchema.parse(req.body);

    const donation = await prisma.itemDonation.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN',
        actorId: adminId,
        actionType: 'ITEM_CONFIRMATION',
        targetType: 'ITEM_DONATION',
        targetId: donation.id,
        note: `Item donation rejected: ${reason}`,
      },
    });

    res.status(200).json(donation);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
    }
    next(error);
  }
};
