import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../lib/prisma';
import { submitKycSchema } from '../schemas/kyc.schema';
import { AuthenticatedRequest, AuthenticatedRequestWithFiles } from '../types/auth.types';
import { getRelativePath, generateAssetUrl } from '../utils/file';
import path from 'path'; // Import path module

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000'; // Define base URL

export const submitKyc = async (
  req: AuthenticatedRequestWithFiles,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user!;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Validate file uploads
    if (!files || !files.documentImage || files.documentImage.length === 0) {
      return res.status(400).json({ message: 'Document image is required.' });
    }
    if (!files || !files.profilePhoto || files.profilePhoto.length === 0) {
      return res.status(400).json({ message: 'Profile photo is required.' });
    }

    const documentImageRelativePath = getRelativePath(files.documentImage[0].path);
    const profilePhotoRelativePath = getRelativePath(files.profilePhoto[0].path);

    const kycDataWithFiles = {
      ...req.body,
      documentImage: documentImageRelativePath,
      profilePhoto: profilePhotoRelativePath,
    };

    const parsedKycData = submitKycSchema.parse(kycDataWithFiles);

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
        ...parsedKycData,
        userId,
        status: 'PENDING',
      },
    });

    // Convert relative paths to full URLs for the response
    const responseKyc = {
      ...newKyc,
      documentImage: generateAssetUrl(newKyc.documentImage, BASE_URL),
      profilePhoto: generateAssetUrl(newKyc.profilePhoto, BASE_URL),
    };

    res
      .status(201)
      .json({ message: 'KYC profile submitted successfully.', kyc: responseKyc });
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
  const { userId } = req.user!;

  try {
    const kyc = await prisma.kYCProfile.findUnique({
      where: { userId },
      select: {
        status: true,
        rejectionReason: true,
        submittedAt: true,
        reviewedAt: true,
        documentImage: true, // Include documentImage
        profilePhoto: true,  // Include profilePhoto
      },
    });

    if (!kyc) {
      return res.status(200).json({ status: 'NOT_SUBMITTED' });
    }

    // Convert relative paths to full URLs for the response
    const responseKyc = {
      ...kyc,
      documentImage: kyc.documentImage ? generateAssetUrl(kyc.documentImage, BASE_URL) : undefined,
      profilePhoto: kyc.profilePhoto ? generateAssetUrl(kyc.profilePhoto, BASE_URL) : undefined,
    };

    res.status(200).json(responseKyc);
  } catch (error) {
    next(error);
  }
};

export const resubmitKyc = async (
  req: AuthenticatedRequestWithFiles,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user!;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Validate file uploads
    if (!files || !files.documentImage || files.documentImage.length === 0) {
      return res.status(400).json({ message: 'Document image is required.' });
    }
    if (!files || !files.profilePhoto || files.profilePhoto.length === 0) {
      return res.status(400).json({ message: 'Profile photo is required.' });
    }

    const documentImageRelativePath = getRelativePath(files.documentImage[0].path);
    const profilePhotoRelativePath = getRelativePath(files.profilePhoto[0].path);

    const kycDataWithFiles = {
      ...req.body,
      documentImage: documentImageRelativePath,
      profilePhoto: profilePhotoRelativePath,
    };

    const parsedKycData = submitKycSchema.parse(kycDataWithFiles);

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
        ...parsedKycData,
        status: 'PENDING',
        rejectionReason: null,
      },
    });

    // Convert relative paths to full URLs for the response
    const responseKyc = {
      ...updatedKyc,
      documentImage: generateAssetUrl(updatedKyc.documentImage, BASE_URL),
      profilePhoto: generateAssetUrl(updatedKyc.profilePhoto, BASE_URL),
    };

    res.status(200).json({
      message: 'KYC profile resubmitted successfully.',
      kyc: responseKyc,
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
