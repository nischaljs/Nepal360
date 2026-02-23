import type { PrismaClient } from '../../../generated/prisma/client.js';

const FACTORS = {
  descriptionLength: 0.15,
  sentiment: 0.20,
  targetAmount: 0.20,
  coverImage: 0.10,
  categoryStrength: 0.15,
  beneficiaryScore: 0.20,
};

const POSITIVE_WORDS = [
  'help', 'support', 'love', 'care', 'save', 'hope', 'dream', 'future',
  'community', 'family', 'children', 'education', 'health', 'home',
  'change', 'impact', 'transform', 'together', 'kindness', 'generous',
  'grateful', 'thank', 'blessing', 'life', 'new', 'better', 'build',
];

const NEGATIVE_WORDS = [
  'suffer', 'die', 'death', 'crisis', 'emergency', 'urgent', 'critical',
  'poverty', 'hungry', 'sick', 'pain', 'lost', 'broken', 'destroyed',
  'disaster', 'tragedy', 'victim', 'poor', 'struggle', 'difficult',
];

export interface PredictionInput {
  title?: string;
  description?: string;
  targetAmount?: number;
  category?: string;
  hasCoverImage?: boolean;
  beneficiaryId?: string;
}

export interface PredictionResult {
  score: number;
  prediction: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  factors: Record<string, number>;
  suggestions: string[];
}

function analyzeSentiment(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let score = 0.5;

  for (const word of words) {
    if (POSITIVE_WORDS.some(pw => word.includes(pw))) score += 0.02;
    if (NEGATIVE_WORDS.some(nw => word.includes(nw))) score -= 0.02;
  }

  return Math.max(0, Math.min(1, score));
}

function scoreDescriptionLength(description: string): number {
  const wordCount = description.split(/\s+/).length;

  if (wordCount >= 200 && wordCount <= 1000) return 1.0;
  if (wordCount >= 100 && wordCount <= 1500) return 0.7;
  if (wordCount < 100) return Math.max(0.3, wordCount / 100);
  return Math.max(0.3, 1 - (wordCount - 1000) / 1000);
}

function scoreTargetAmount(amount: number, category?: string): number {
  if (!amount || amount <= 0) return 0.5;

  const categoryAverages: Record<string, number> = {
    'education': 500000,
    'health': 300000,
    'disaster': 1000000,
    'community': 750000,
    'animals': 200000,
    'arts': 150000,
    'business': 400000,
    'emergency': 200000,
  };

  const average = categoryAverages[category?.toLowerCase() || ''] || 500000;

  if (amount <= average * 0.5) return 1.0;
  if (amount <= average) return 0.85;
  if (amount <= average * 2) return 0.6;
  if (amount <= average * 5) return 0.4;
  return 0.2;
}

function getCategoryStrengthScore(category?: string): number {
  const categorySuccessRates: Record<string, number> = {
    'education': 0.72,
    'health': 0.68,
    'community': 0.65,
    'disaster': 0.78,
    'animals': 0.60,
    'arts': 0.55,
    'business': 0.45,
    'emergency': 0.80,
  };

  return categorySuccessRates[category?.toLowerCase() || ''] || 0.6;
}

export async function predictCampaignSuccess(
  input: PredictionInput,
  prisma: PrismaClient
): Promise<PredictionResult> {
  const factors: Record<string, number> = {};
  const suggestions: string[] = [];

  if (input.description) {
    factors.descriptionLength = scoreDescriptionLength(input.description);
    if (factors.descriptionLength < 0.7) {
      suggestions.push('Consider adding more details to your description (200-1000 words recommended)');
    }
  } else {
    factors.descriptionLength = 0;
    suggestions.push('Please add a description for your campaign');
  }

  const fullText = `${input.title || ''} ${input.description || ''}`;
  factors.sentiment = analyzeSentiment(fullText);
  if (factors.sentiment < 0.4) {
    suggestions.push('Consider using more positive and hopeful language in your description');
  }

  factors.targetAmount = scoreTargetAmount(input.targetAmount || 0, input.category);
  if (factors.targetAmount < 0.5) {
    suggestions.push('Consider adjusting your target amount to be more achievable');
  }

  factors.coverImage = input.hasCoverImage ? 1.0 : 0;
  if (!input.hasCoverImage) {
    suggestions.push('Adding a cover image significantly increases campaign success rate');
  }

  factors.categoryStrength = getCategoryStrengthScore(input.category);

  let beneficiaryScore = 0.5;
  if (input.beneficiaryId) {
    const campaigns = await prisma.campaign.findMany({
      where: { beneficiaryId: input.beneficiaryId },
      select: { donationCount: true, status: true },
    });

    if (campaigns.length > 0) {
      const successfulCampaigns = campaigns.filter(
        c => c.status === 'COMPLETED' || (c.donationCount > 10)
      ).length;
      beneficiaryScore = 0.5 + (successfulCampaigns / campaigns.length) * 0.5;
    }
  }
  factors.beneficiaryScore = beneficiaryScore;

  if (beneficiaryScore < 0.5) {
    suggestions.push('As a new campaigner, consider starting with a smaller, achievable goal');
  }

  let totalScore = 0;
  totalScore += factors.descriptionLength * FACTORS.descriptionLength;
  totalScore += factors.sentiment * FACTORS.sentiment;
  totalScore += factors.targetAmount * FACTORS.targetAmount;
  totalScore += factors.coverImage * FACTORS.coverImage;
  totalScore += factors.categoryStrength * FACTORS.categoryStrength;
  totalScore += factors.beneficiaryScore * FACTORS.beneficiaryScore;

  const finalScore = Math.round(totalScore * 100);

  let prediction: PredictionResult['prediction'];
  if (finalScore >= 90) prediction = 'VERY_HIGH';
  else if (finalScore >= 70) prediction = 'HIGH';
  else if (finalScore >= 50) prediction = 'MODERATE';
  else if (finalScore >= 30) prediction = 'LOW';
  else prediction = 'VERY_LOW';

  return { score: finalScore, prediction, factors, suggestions };
}

export async function predictExistingCampaign(
  campaignId: string,
  prisma: PrismaClient
): Promise<PredictionResult | null> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { beneficiary: true },
  });

  if (!campaign) return null;

  return predictCampaignSuccess(
    {
      title: campaign.title,
      description: campaign.description,
      targetAmount: Number(campaign.targetAmount),
      category: campaign.category || 'general',
      hasCoverImage: !!campaign.coverImage,
      beneficiaryId: campaign.beneficiaryId,
    },
    prisma
  );
}
