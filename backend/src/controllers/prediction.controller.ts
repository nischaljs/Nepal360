import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const getFundraisingPrediction = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { campaignId } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        targetAmount: true,
        createdAt: true,
        status: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Get all completed donations for this campaign, ordered by date
    const donations = await prisma.moneyDonation.findMany({
      where: { campaignId, status: 'COMPLETED' },
      orderBy: { createdAt: 'asc' },
      select: { amount: true, createdAt: true },
    });

    if (donations.length === 0) {
      return res.json({
        success: true,
        data: {
          historicalData: [],
          predictedData: [],
          totalRaised: 0,
          targetAmount: campaign.targetAmount.toString(),
          daysActive: 0,
          averageDailyRate: 0,
          predictedCompletionDays: null,
          confidence: 'low',
        },
      });
    }

    // Build daily cumulative data
    const startDate = new Date(campaign.createdAt);
    const now = new Date();
    const daysActive = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Group donations by day
    const dailyMap = new Map<string, number>();
    let cumulative = 0;
    const historicalData: { day: number; amount: number; date: string }[] = [];

    donations.forEach((d) => {
      const dayNum = Math.ceil((new Date(d.createdAt).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const key = `day-${dayNum}`;
      const amt = parseFloat(d.amount.toString());
      dailyMap.set(key, (dailyMap.get(key) || 0) + amt);
    });

    // Build cumulative historical
    cumulative = 0;
    for (let day = 0; day <= daysActive; day++) {
      const key = `day-${day}`;
      if (dailyMap.has(key)) {
        cumulative += dailyMap.get(key)!;
      }
      if (day === 0 || dailyMap.has(key) || day === daysActive) {
        historicalData.push({
          day,
          amount: Math.round(cumulative),
          date: new Date(startDate.getTime() + day * 86400000).toISOString().split('T')[0],
        });
      }
    }

    const totalRaised = cumulative;
    const target = parseFloat(campaign.targetAmount.toString());
    const averageDailyRate = totalRaised / daysActive;

    // Predict future
    const remaining = target - totalRaised;
    let predictedCompletionDays: number | null = null;
    let confidence: 'high' | 'medium' | 'low' = 'low';

    if (averageDailyRate > 0 && remaining > 0) {
      predictedCompletionDays = Math.ceil(remaining / averageDailyRate);

      if (totalRaised > target * 0.5) confidence = 'high';
      else if (totalRaised > target * 0.2) confidence = 'medium';
      else confidence = 'low';
    } else if (remaining <= 0) {
      predictedCompletionDays = 0;
      confidence = 'high';
    }

    // Build prediction curve (next 30 days or until target)
    const predictedData: { day: number; amount: number; date: string }[] = [];
    if (averageDailyRate > 0 && remaining > 0) {
      let projectedAmount = totalRaised;
      const futureDays = Math.min(predictedCompletionDays || 60, 60);

      for (let i = 1; i <= futureDays; i++) {
        projectedAmount += averageDailyRate;
        if (projectedAmount > target) projectedAmount = target;
        predictedData.push({
          day: daysActive + i,
          amount: Math.round(projectedAmount),
          date: new Date(now.getTime() + i * 86400000).toISOString().split('T')[0],
        });
        if (projectedAmount >= target) break;
      }
    }

    res.json({
      success: true,
      data: {
        historicalData,
        predictedData,
        totalRaised: Math.round(totalRaised),
        targetAmount: target.toString(),
        daysActive,
        averageDailyRate: Math.round(averageDailyRate),
        predictedCompletionDays,
        confidence,
      },
    });
  } catch (error) {
    next(error);
  }
};
