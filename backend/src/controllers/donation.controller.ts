import { NextFunction, Request, Response } from 'express';
import {prisma} from '../lib/prisma';
import {
  initiateKhaltiPaymentSchema,
  verifyKhaltiPaymentSchema,
} from '../schemas/donation.schema';
import { ZodError } from 'zod';
import { randomUUID } from 'crypto';
import { AuthenticatedRequest } from '../types/auth.types';

const KHALTI_API_URL = 'https://khalti.com/api/v2';
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

// ============== Helper function to verify payment ==============
const verifyPayment = async (pidx: string) => {
  if (!KHALTI_SECRET_KEY) {
    throw new Error('Khalti secret key is not configured.');
  }

  const response = await fetch(`${KHALTI_API_URL}/epayment/lookup/`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pidx }),
  });

  if (!response.ok) {
    throw new Error(`Khalti lookup failed with status ${response.status}`);
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

  const updatedDonation = await prisma.moneyDonation.update({
    where: { id: donation.id },
    data: {
      status: 'COMPLETED',
      paymentRef: data.transaction_id,
    },
  });

  // TODO: Update DonorStats and Campaign donationCount
  // This can be done via a separate service or a background job

  return updatedDonation;
};


// ============== Controller Functions ==============

export const initiateKhaltiPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!KHALTI_SECRET_KEY) {
      throw new Error('Khalti secret key is not configured.');
    }

    const { userId: donorId, name, email } = req.user!;
    const { campaignId, amount, returnUrl, visibility } =
      initiateKhaltiPaymentSchema.parse(req.body);

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
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

    const khaltiResponse = await fetch(`${KHALTI_API_URL}/epayment/initiate/`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        return_url: returnUrl,
        website_url: process.env.WEBSITE_URL || 'http://localhost:3000',
        amount: amountInPaisa,
        purchase_order_id: purchase_order_id,
        purchase_order_name: `Donation for ${campaign.title}`,
        customer_info: {
          name: name,
          email: email,
        },
      }),
    });

    if (!khaltiResponse.ok) {
      const errorBody = await khaltiResponse.json();
      console.error('Khalti initiation failed:', errorBody);
      return res.status(500).json({ message: 'Failed to initiate Khalti payment.' });
    }

    const khaltiData = await khaltiResponse.json();

    await prisma.moneyDonation.update({
      where: { id: donation.id },
      data: { pidx: khaltiData.pidx },
    });

    res.status(200).json({ paymentUrl: khaltiData.payment_url });

  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
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
        return res.status(404).json({ message: 'Donation not found or you are not authorized to verify it.' });
    }

    if (donation.status === 'COMPLETED') {
        return res.status(200).json({ success: true, message: 'Donation already verified.', donation });
    }

    const updatedDonation = await verifyPayment(pidx);

    res.status(200).json({ success: true, donation: updatedDonation });
  } catch (error) {
     if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
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
        return res.status(400).json({ message: 'pidx is required.' });
    }

    try {
        await verifyPayment(pidx);
        res.status(200).json({ success: true });
    } catch (error) {
        // Log the error, but don't send detailed error back to Khalti
        console.error('Khalti callback verification failed:', error);
        res.status(200).json({ success: false }); // Still send 200 to acknowledge receipt
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

        res.status(200).json(donations);
    } catch (error) {
        next(error);
    }
}
