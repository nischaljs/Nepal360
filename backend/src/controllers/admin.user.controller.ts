import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../types/auth.types';

export const listUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const search = (req.query.search as string) || '';

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
      take: 50,
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};
