import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { prisma } from '../lib/prisma';

export const getComments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { campaignId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { campaignId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.comment.count({ where: { campaignId } }),
    ]);

    res.json({ comments, total });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { campaignId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ success: false, message: 'Comment must be 1000 characters or less' });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        campaignId,
        content: content.trim(),
      },
      include: { user: { select: { id: true, name: true } } },
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own comments' });
    }

    await prisma.comment.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
