import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createRecurringSchema } from '../schemas/recurringDonation.schema';
import { AuthenticatedRequest } from '../types/auth.types';

export const createRecurring = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const validation = createRecurringSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { campaignId, amount, frequency } = validation.data;
    const donorId = req.user!.userId;

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.status !== 'LIVE') {
      return res.status(404).json({ success: false, message: 'Campaign not found or not active' });
    }

    const nextDueDate = new Date();
    if (frequency === 'MONTHLY') {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    } else {
      nextDueDate.setDate(nextDueDate.getDate() + 7);
    }

    const recurring = await prisma.recurringDonation.create({
      data: {
        donorId,
        campaignId,
        amount,
        frequency,
        nextDueDate,
      },
      include: {
        campaign: { select: { id: true, title: true } },
      },
    });

    res.status(201).json({ success: true, data: recurring });
  } catch (error) {
    next(error);
  }
};

export const getMyRecurring = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const donorId = req.user!.userId;

    const donations = await prisma.recurringDonation.findMany({
      where: { donorId },
      include: {
        campaign: { select: { id: true, title: true, coverImage: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
};

export const pauseRecurring = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const donorId = req.user!.userId;

    const donation = await prisma.recurringDonation.findUnique({ where: { id } });
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Recurring donation not found' });
    }
    if (donation.donorId !== donorId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (donation.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Can only pause active donations' });
    }

    const updated = await prisma.recurringDonation.update({
      where: { id },
      data: { status: 'PAUSED' },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const resumeRecurring = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const donorId = req.user!.userId;

    const donation = await prisma.recurringDonation.findUnique({ where: { id } });
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Recurring donation not found' });
    }
    if (donation.donorId !== donorId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (donation.status !== 'PAUSED') {
      return res.status(400).json({ success: false, message: 'Can only resume paused donations' });
    }

    const updated = await prisma.recurringDonation.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const cancelRecurring = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const donorId = req.user!.userId;

    const donation = await prisma.recurringDonation.findUnique({ where: { id } });
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Recurring donation not found' });
    }
    if (donation.donorId !== donorId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (donation.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Already cancelled' });
    }

    const updated = await prisma.recurringDonation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const getDueRecurring = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const donations = await prisma.recurringDonation.findMany({
      where: {
        status: 'ACTIVE',
        nextDueDate: { lte: new Date() },
      },
      include: {
        donor: { select: { id: true, name: true, email: true } },
        campaign: { select: { id: true, title: true } },
      },
      orderBy: { nextDueDate: 'asc' },
    });

    res.json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
};
