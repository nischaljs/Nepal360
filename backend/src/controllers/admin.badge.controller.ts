import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { grantBadgeSchema, createBadgeSchema, updateBadgeSchema } from '../schemas/admin.badge.schema';
import { ZodError } from 'zod';
import { AuthenticatedRequest } from '../types/auth.types';

export const listBadges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { userBadges: true },
        },
      },
    });
    res.json({ success: true, badges });
  } catch (error) {
    next(error);
  }
};

export const getBadge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const badge = await prisma.badge.findUnique({
      where: { id },
      include: {
        _count: {
          select: { userBadges: true },
        },
      },
    });

    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }

    res.json({ success: true, badge });
  } catch (error) {
    next(error);
  }
};

export const createBadge = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = createBadgeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { code, name, description, iconUrl, badgeType } = validation.data;

    const existingBadge = await prisma.badge.findUnique({ where: { code } });
    if (existingBadge) {
      return res.status(409).json({ success: false, message: 'Badge with this code already exists' });
    }

    const badge = await prisma.badge.create({
      data: {
        code,
        name,
        description,
        iconUrl: iconUrl || '',
        badgeType,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'ADMIN',
        actorId: req.user!.userId,
        actionType: 'BADGE_GRANTED',
        targetType: 'BADGE',
        targetId: badge.id,
        note: `Created badge '${name}'`,
      },
    });

    res.status(201).json({ success: true, badge });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues.map(e => ({ path: e.path, message: e.message })),
      });
    }
    next(error);
  }
};

export const updateBadge = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validation = updateBadgeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const badge = await prisma.badge.findUnique({ where: { id } });
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }

    const updated = await prisma.badge.update({
      where: { id },
      data: validation.data,
    });

    res.json({ success: true, badge: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues.map(e => ({ path: e.path, message: e.message })),
      });
    }
    next(error);
  }
};

export const deleteBadge = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const badge = await prisma.badge.findUnique({ where: { id } });
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }

    await prisma.badge.delete({ where: { id } });

    res.json({ success: true, message: 'Badge deleted successfully' });
  } catch (error) {
    next(error);
  }
};

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
      return res.status(404).json({ success: false, message: 'Badge not found.' });
    }

    const existingUserBadge = await prisma.userBadge.findFirst({
      where: {
        userId,
        badgeId: badge.id,
      },
    });

    if (existingUserBadge) {
      return res.status(409).json({ success: false, message: 'User already has this badge.' });
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

    res.status(201).json({ success: true, data: userBadge });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
    }
    next(error);
  }
};
