import { NextFunction, Request, Response } from 'express';
import {prisma} from '../lib/prisma';
import { LeaderboardPeriod } from '../../generated/prisma/enums';


export const listLeaderboards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const leaderboards = await prisma.leaderboard.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(leaderboards);
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period, key } = req.params;

    if (!['MONTHLY', 'CAMPAIGN', 'YEARLY'].includes(period.toUpperCase())) {
        return res.status(400).json({ message: 'Invalid leaderboard period.' });
    }

    const leaderboard = await prisma.leaderboard.findUnique({
      where: {
        period_periodKey: {
          period: period.toUpperCase() as LeaderboardPeriod,
          periodKey: key,
        },
      },
      include: {
        entries: {
          orderBy: {
            rank: 'asc',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!leaderboard) {
      return res.status(404).json({ message: 'Leaderboard not found.' });
    }

    res.status(200).json(leaderboard);
  } catch (error) {
    next(error);
  }
};
