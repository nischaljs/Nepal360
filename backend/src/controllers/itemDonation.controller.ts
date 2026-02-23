import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { pledgeItemDonationSchema, updateItemDonationSchema } from '../schemas/itemDonation.schema';
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

    const campaign = await prisma.campaign.findUnique({
      where: { id: donationData.campaignId },
    });
    if (!campaign || campaign.status !== 'LIVE') {
      return res.status(404).json({ success: false, message: 'Campaign not found or not active.' });
    }

    const donation = await prisma.itemDonation.create({
      data: {
        ...donationData,
        donorId,
        status: 'PLEDGED',
      },
      include: {
        campaign: { select: { id: true, title: true } },
      },
    });

    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
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
      where: { donorId },
      include: {
        campaign: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
};

export const getItemDonationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const donation = await prisma.itemDonation.findUnique({
      where: { id },
      include: {
        donor: { select: { id: true, name: true } },
        campaign: { select: { id: true, title: true } },
      },
    });

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Item donation not found.' });
    }

    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
};

export const getCampaignItemDonations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { campaignId } = req.params;
    const donations = await prisma.itemDonation.findMany({
      where: { campaignId },
      include: {
        donor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
};

export const updateItemDonation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId: donorId } = req.user!;
    const { id } = req.params;
    const updateData = updateItemDonationSchema.parse(req.body);

    const donation = await prisma.itemDonation.findUnique({ where: { id } });
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Item donation not found.' });
    }
    if (donation.donorId !== donorId) {
      return res.status(403).json({ success: false, message: 'You can only update your own pledges.' });
    }
    if (donation.status !== 'PLEDGED') {
      return res.status(400).json({ success: false, message: 'Only pledged items can be updated.' });
    }

    const updated = await prisma.itemDonation.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.status === 'DELIVERED' ? { status: 'DELIVERED' } : {}),
      },
      include: {
        campaign: { select: { id: true, title: true } },
      },
    });

    if (updateData.status === 'DELIVERED') {
      await prisma.donorStats.upsert({
        where: { userId: donorId },
        create: {
          userId: donorId,
          totalItemCount: 1,
          donationCount: 1,
          lastDonationAt: new Date(),
        },
        update: {
          totalItemCount: { increment: 1 },
          donationCount: { increment: 1 },
          lastDonationAt: new Date(),
        },
      });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
    }
    next(error);
  }
};
