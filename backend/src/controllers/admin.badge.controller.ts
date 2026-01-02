import { NextFunction, Request, Response } from 'express';
import {prisma} from '../lib/prisma';
import { grantBadgeSchema } from '../schemas/admin.badge.schema';
import { ZodError } from 'zod';
import { AuthenticatedRequest } from '../types/auth.types';

export const grantBadge = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId: adminId } = req.user!;
    const { userId, badgeCode } = grantBadgeSchema.parse(req.body);

    const badge = await prisma.badge.findUnique({
      where: { code: badgeCode },
    });

    if (!badge) {
      return res.status(404).json({ message: 'Badge not found.' });
    }

    const existingUserBadge = await prisma.userBadge.findFirst({
      where: {
        userId,
        badgeId: badge.id,
      },
    });

    if (existingUserBadge) {
      return res.status(409).json({ message: 'User already has this badge.' });
    }

    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN',
        actorId: adminId,
        actionType: 'BADGE_GRANTED',
        targetType: 'USER_BADGE',
        targetId: userBadge.id,
        note: `Granted badge '${badge.name}' to user ${userId}`,
      },
    });

    res.status(201).json(userBadge);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
    }
    next(error);
  }
};
