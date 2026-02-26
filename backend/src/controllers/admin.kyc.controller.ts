import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { KYCStatus } from '../../generated/prisma/enums';
import { prisma } from '../lib/prisma';
import { rejectKycSchema } from '../schemas/admin.kyc.schema';
import { AuthenticatedRequest } from '../types/auth.types';
import { generateAssetUrl } from '../utils/file';
import { env } from '../config/env';

const BASE_URL = env.BACKEND_URL;

export const listKycProfiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status } = req.query;

  if (status && !['PENDING', 'APPROVED', 'REJECTED'].includes(status as string)) {
    return res.status(400).json({ success: false, message: 'Invalid status filter.' });
  }

  try {
    const kycProfiles = await prisma.kYCProfile.findMany({
      where: {
        status: status ? (status as KYCStatus) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const formatted = kycProfiles.map((p) => ({
      ...p,
      documentImage: p.documentImage ? generateAssetUrl(p.documentImage, BASE_URL) : undefined,
      profilePhoto: p.profilePhoto ? generateAssetUrl(p.profilePhoto, BASE_URL) : undefined,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

export const getKycDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    const kycProfile = await prisma.kYCProfile.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!kycProfile) {
      return res.status(404).json({ success: false, message: 'KYC profile not found.' });
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: {
        targetType: 'KYC_PROFILE',
        targetId: kycProfile.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        ...kycProfile,
        documentImage: kycProfile.documentImage ? generateAssetUrl(kycProfile.documentImage, BASE_URL) : undefined,
        profilePhoto: kycProfile.profilePhoto ? generateAssetUrl(kycProfile.profilePhoto, BASE_URL) : undefined,
        auditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const approveKyc = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const { userId: adminId } = req.user!;

  try {
    const kycProfile = await prisma.kYCProfile.update({
      where: { userId },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN',
        actorId: adminId,
        actionType: 'KYC_REVIEW',
        targetType: 'KYC_PROFILE',
        targetId: kycProfile.id,
        note: 'KYC Approved',
      },
    });

    res.status(200).json({ success: true, message: 'KYC profile approved.', data: kycProfile });
  } catch (error) {
    next(error);
  }
};

export const rejectKyc = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const { userId: adminId } = req.user!;

  try {
    const { reason } = rejectKycSchema.parse(req.body);

    const kycProfile = await prisma.kYCProfile.update({
      where: { userId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN',
        actorId: adminId,
        actionType: 'KYC_REVIEW',
        targetType: 'KYC_PROFILE',
        targetId: kycProfile.id,
        note: `KYC Rejected: ${reason}`,
      },
    });

    res.status(200).json({ success: true, message: 'KYC profile rejected.', data: kycProfile });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
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
