import { Response } from 'express';
import { predictCampaignSuccess, predictExistingCampaign } from '../ai/prediction/index.js';
import { getRecommendations, getSimilarCampaigns } from '../ai/recommendations/index.js';
import { catchAsync } from '../middlewares/errohandler.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { prisma } from '../lib/prisma.js';

export const predictSuccess = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, targetAmount, category, hasCoverImage, campaignId } = req.body;

  let result;

  if (campaignId) {
    result = await predictExistingCampaign(campaignId, prisma);
  } else {
    result = await predictCampaignSuccess(
      {
        title,
        description,
        targetAmount: targetAmount ? Number(targetAmount) : undefined,
        category,
        hasCoverImage,
      },
      prisma
    );
  }

  if (!result) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  res.json({ success: true, data: result });
});

export const getRecommendationsHandler = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const user = authMiddleware(req);
  const userId = user?.userId;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const excludeDonated = req.query.excludeDonated !== 'false';

  const recommendations = await getRecommendations(
    { userId, limit, excludeDonated },
    prisma
  );

  res.json({ success: true, data: recommendations });
});

export const getSimilarCampaignsHandler = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { campaignId } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

  const similarCampaigns = await getSimilarCampaigns(campaignId, limit, prisma);

  res.json({ success: true, data: similarCampaigns });
});
