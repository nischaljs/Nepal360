import api from './api';

export interface PredictionResult {
  score: number;
  prediction: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  factors: Record<string, number>;
  suggestions: string[];
}

export interface CampaignWithScore {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  targetAmount: string;
  donationCount: number;
  beneficiaryId: string;
  status: string;
  recommendationScore: number;
  matchReasons: string[];
}

export interface PredictionInput {
  title?: string;
  description?: string;
  targetAmount?: number;
  category?: string;
  hasCoverImage?: boolean;
  campaignId?: string;
}

export const predictCampaignSuccess = async (
  input: PredictionInput
): Promise<PredictionResult> => {
  const { data } = await api.post('/ai/predict-success', input);
  return data.data;
};

export const getRecommendations = async (
  limit = 10,
  excludeDonated = true
): Promise<CampaignWithScore[]> => {
  const { data } = await api.get('/ai/recommendations', {
    params: { limit, excludeDonated },
  });
  return data.data;
};

export const getSimilarCampaigns = async (
  campaignId: string,
  limit = 5
): Promise<CampaignWithScore[]> => {
  const { data } = await api.get(`/ai/recommendations/similar/${campaignId}`, {
    params: { limit },
  });
  return data.data;
};
