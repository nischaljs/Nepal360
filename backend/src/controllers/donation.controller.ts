import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import {
  initiateKhaltiPaymentSchema,
  verifyKhaltiPaymentSchema,
} from '../schemas/donation.schema';
import { AuthenticatedRequest } from '../types/auth.types';

const KHALTI_API_URL = env.KHALTI_API_URL;
const KHALTI_SECRET_KEY = env.KHALTI_SECRET_KEY;

const verifyPayment = async (pidx: string) => {
  const response = await fetch(`${KHALTI_API_URL}/epayment/lookup/`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pidx }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Khalti lookup failed. Status:', response.status, 'Response:', errorText);
    throw new Error(`Khalti lookup failed with status ${response.status}. See server logs for details.`);
  }

  const data = await response.json();

  if (data.status !== 'Completed') {
    throw new Error(`Payment status is not 'Completed'. Status: ${data.status}`);
  }

  const donation = await prisma.moneyDonation.findFirst({
    where: { pidx: pidx, status: 'PENDING' },
  });

  if (!donation) {
    throw new Error('Donation not found or already processed.');
  }

  const updatedDonation = await prisma.$transaction(async (tx) => {
    const updated = await tx.moneyDonation.update({
      where: { id: donation.id },
      data: {
        status: 'COMPLETED',
        paymentRef: data.transaction_id,
      },
    });

    await tx.campaign.update({
      where: { id: donation.campaignId },
      data: { donationCount: { increment: 1 } },
    });

    await tx.donorStats.upsert({
      where: { userId: donation.donorId },
      create: {
        userId: donation.donorId,
        totalMoneyDonated: donation.amount,
        donationCount: 1,
        lastDonationAt: new Date(),
      },
      update: {
        totalMoneyDonated: { increment: donation.amount },
        donationCount: { increment: 1 },
        lastDonationAt: new Date(),
      },
    });

    return updated;
  });

  return updatedDonation;
};


export const initiateKhaltiPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId: donorId, name: userName, email } = req.user!;
    const customerName = userName || 'Guest Donor';
    const { campaignId, amount, returnUrl, visibility } =
      initiateKhaltiPaymentSchema.parse(req.body);

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const donation = await prisma.moneyDonation.create({
      data: {
        donorId,
        campaignId,
        amount,
        visibility,
        status: 'PENDING',
      },
    });

    const purchase_order_id = donation.id;
    const amountInPaisa = amount * 100;

    const khaltiRequestBody = JSON.stringify({
      return_url: returnUrl,
      website_url: env.WEBSITE_URL,
      amount: amountInPaisa,
      purchase_order_id: purchase_order_id,
      purchase_order_name: `Donation for ${campaign.title}`,
      customer_info: {
        name: customerName,
        email: email,
        phone: "9800000001"
      },
    });

    const khaltiResponse = await fetch(`${KHALTI_API_URL}/epayment/initiate/`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: khaltiRequestBody,
    });

    if (!khaltiResponse.ok) {
      const errorText = await khaltiResponse.text();
      console.error('Khalti initiation failed:', khaltiResponse.status, errorText);
      return res.status(500).json({ success: false, message: 'Failed to initiate Khalti payment. Check server logs for details.' });
    }

    const khaltiData = await khaltiResponse.json();

    await prisma.moneyDonation.update({
      where: { id: donation.id },
      data: { pidx: khaltiData.pidx },
    });

    res.status(200).json({ success: true, data: { paymentUrl: khaltiData.payment_url } });

  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
    }
    next(error);
  }
};

export const verifyKhaltiPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pidx } = verifyKhaltiPaymentSchema.parse(req.body);
    const { userId: donorId } = req.user!;

    const donation = await prisma.moneyDonation.findFirst({
        where: { pidx, donorId }
    });

    if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found or you are not authorized to verify it.' });
    }

    if (donation.status === 'COMPLETED') {
        return res.status(200).json({ success: true, message: 'Donation already verified.', donation });
    }

    const updatedDonation = await verifyPayment(pidx);

    res.status(200).json({ success: true, data: updatedDonation });
  } catch (error) {
     if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
    }
    next(error);
  }
};

export const handleKhaltiCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const { pidx } = req.body;
    if (!pidx) {
        return res.status(400).json({ success: false, message: 'pidx is required.' });
    }

    try {
        await verifyPayment(pidx);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Khalti callback verification failed:', error);
        res.status(200).json({ success: false });
    }
};

export const getMyMoneyDonations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
    try {
        const { userId: donorId } = req.user!;
        const donations = await prisma.moneyDonation.findMany({
            where: {
                donorId,
                status: 'COMPLETED'
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({ success: true, data: donations });
    } catch (error) {
        next(error);
    }
}

export const getCampaignDonors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: campaignId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const donations = await prisma.moneyDonation.findMany({
      where: {
        campaignId,
        status: 'COMPLETED',
      },
      orderBy: { amount: 'desc' },
      take: limit,
      skip: skip,
      include: {
        donor: {
          select: { id: true, name: true },
        },
      },
    });

    const totalDonations = await prisma.moneyDonation.count({
      where: {
        campaignId,
        status: 'COMPLETED',
      },
    });

    const formattedDonations = donations.map(d => ({
        id: d.id,
        amount: d.amount,
        createdAt: d.createdAt,
        donorName: d.visibility === 'PUBLIC' ? d.donor.name : 'Anonymous Donor',
    }));

    res.status(200).json({
      success: true,
      data: {
        donors: formattedDonations,
        currentPage: page,
        totalPages: Math.ceil(totalDonations / limit),
        totalDonors: totalDonations,
      },
    });
  } catch (error) {
    console.error('Error fetching campaign donors:', error);
    next(error);
  }
};

