import { NextFunction, Request, Response } from 'express';
import {prisma} from '../lib/prisma';

export const listAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { actorId, actionType, targetType } = req.query;

    const logs = await prisma.auditLog.findMany({
      where: {
        actorId: actorId ? (actorId as string) : undefined,
        actionType: actionType ? (actionType as any) : undefined, // Consider adding validation
        targetType: targetType ? (targetType as string) : undefined,
      },
      include: {
        actor: {
            select: {
                id: true,
                name: true,
                email: true
            }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Add pagination limit
    });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogsForTarget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { targetType, targetId } = req.params;

    const logs = await prisma.auditLog.findMany({
      where: {
        targetType,
        targetId,
      },
      include: {
        actor: {
            select: {
                id: true,
                name: true,
                email: true
            }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
