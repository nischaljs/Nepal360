import { NextFunction, Request, Response } from 'express';
import {prisma} from '../lib/prisma';
import { pledgeItemDonationSchema } from '../schemas/itemDonation.schema';
import { ZodError } from 'zod';
import { AuthenticatedRequest } from '../types/auth.types';

export const pledgeItemDonation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId: donorId } = req.user!;
    const donationData = pledgeItemDonationSchema.parse(req.body);

    const donation = await prisma.itemDonation.create({
      data: {
        ...donationData,
        donorId,
        status: 'PLEDGED',
      },
    });

    res.status(201).json(donation);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
    }
    next(error);
  }
};

export const getMyItemDonations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId: donorId } = req.user!;
    const donations = await prisma.itemDonation.findMany({
      where: {
        donorId,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
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
