import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import {prisma} from '../lib/prisma';
import { submitKycSchema } from '../schemas/kyc.schema';
import { AuthenticatedRequest } from '../types/auth.types';

export const submitKyc = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const kycData = submitKycSchema.parse(req.body);
    const { userId: userId } = req.user!;

    const existingKyc = await prisma.kYCProfile.findUnique({
      where: { userId },
    });

    if (existingKyc) {
      return res
        .status(409)
        .json({ message: 'KYC profile already exists.' });
    }

    const newKyc = await prisma.kYCProfile.create({
      data: {
        ...kycData,
        userId,
        status: 'PENDING',
      },
    });

    res
      .status(201)
      .json({ message: 'KYC profile submitted successfully.', kyc: newKyc });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.issues.map((e) => ({
          path: e.path,
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

export const getMyKycStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId: userId } = req.user!;

  try {
    const kyc = await prisma.kYCProfile.findUnique({
      where: { userId },
      select: {
        status: true,
        rejectionReason: true,
        submittedAt: true,
        reviewedAt: true,
      },
    });

    if (!kyc) {
      return res.status(200).json({ status: 'NOT_SUBMITTED' });
    }

    res.status(200).json(kyc);
  } catch (error) {
    next(error);
  }
};

export const resubmitKyc = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const kycData = submitKycSchema.parse(req.body);
    const { userId: userId } = req.user!;

    const existingKyc = await prisma.kYCProfile.findUnique({
      where: { userId },
    });

    if (!existingKyc) {
      return res.status(404).json({ message: 'KYC profile not found.' });
    }

    if (existingKyc.status !== 'REJECTED') {
      return res.status(403).json({
        message: 'You can only resubmit a rejected KYC profile.',
      });
    }

    const updatedKyc = await prisma.kYCProfile.update({
      where: { userId },
      data: {
        ...kycData,
        status: 'PENDING',
        rejectionReason: null,
      },
    });

    res.status(200).json({
      message: 'KYC profile resubmitted successfully.',
      kyc: updatedKyc,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.issues.map((e) => ({
          path: e.path,
          message: e.message,
        })),
      });
    }
    next(error);
  }
};
