import api from './api';

export const incrementVisitCount = async (campaignId: string) => {
  try {
    const response = await api.post(`/campaigns/public/${campaignId}/visit`);
    return response.data;
  } catch (error) {
    console.error('Error incrementing visit count:', error);
    throw error;
  }
};
