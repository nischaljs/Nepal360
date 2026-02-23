import api from './api';

export interface PredictionData {
  historicalData: { day: number; amount: number; date: string }[];
  predictedData: { day: number; amount: number; date: string }[];
  totalRaised: number;
  targetAmount: string;
  daysActive: number;
  averageDailyRate: number;
  predictedCompletionDays: number | null;
  confidence: 'high' | 'medium' | 'low';
}

export const getFundraisingPrediction = async (campaignId: string): Promise<PredictionData> => {
  const { data } = await api.get(`/predictions/${campaignId}`);
  return data.data;
};
