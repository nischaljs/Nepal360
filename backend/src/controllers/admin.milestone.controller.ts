import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../types/auth.types';

export const getMilestones = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { campaignId } = req.params;

    const milestones = await prisma.milestone.findMany({
      where: { campaignId },
      orderBy: { amount: 'asc' },
    });

    res.json({ success: true, data: milestones });
  } catch (error) {
    next(error);
  }
};

export const releaseFunds = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: { campaign: true },
    });

    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }
    if (milestone.fundsReleased) {
      return res.status(400).json({ success: false, message: 'Funds already released for this milestone' });
    }
    if (milestone.claimStatus !== 'CLAIMED') {
      return res.status(400).json({ success: false, message: 'Milestone must be claimed before funds can be released' });
    }

    const releasedAmount = req.body.amount
      ? parseFloat(req.body.amount)
      : parseFloat(milestone.amount.toString());

    const [updated] = await prisma.$transaction([
      prisma.milestone.update({
        where: { id },
        data: {
          fundsReleased: true,
          releasedAmount,
          releasedAt: new Date(),
          verifiedBy: adminId,
          claimStatus: 'APPROVED',
          completed: true,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorId: adminId,
          actionType: 'CAMPAIGN_VERIFICATION',
          targetType: 'MILESTONE',
          targetId: id,
          note: `Released funds NPR ${releasedAmount} for milestone "${milestone.title}"`,
        },
      }),
    ]);

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const rejectMilestone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;
    const { reason } = req.body;

    const milestone = await prisma.milestone.findUnique({ where: { id } });
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }
    if (milestone.claimStatus !== 'CLAIMED') {
      return res.status(400).json({ success: false, message: 'Milestone is not in claimed status' });
    }

    const [updated] = await prisma.$transaction([
      prisma.milestone.update({
        where: { id },
        data: {
          claimStatus: 'REJECTED',
          verifiedBy: adminId,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorId: adminId,
          actionType: 'CAMPAIGN_VERIFICATION',
          targetType: 'MILESTONE',
          targetId: id,
          note: `Rejected milestone claim "${milestone.title}": ${reason || 'No reason provided'}`,
        },
      }),
    ]);

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const claimMilestone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { claimProof } = req.body;

    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: { campaign: true },
    });

    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }
    if (milestone.campaign.beneficiaryId !== userId) {
      return res.status(403).json({ success: false, message: 'Only the campaign beneficiary can claim milestones' });
    }
    if (milestone.claimStatus !== 'UNCLAIMED' && milestone.claimStatus !== 'REJECTED') {
      return res.status(400).json({ success: false, message: 'Milestone cannot be claimed in current status' });
    }

    const updated = await prisma.milestone.update({
      where: { id },
      data: {
        claimStatus: 'CLAIMED',
        claimProof: claimProof || null,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
