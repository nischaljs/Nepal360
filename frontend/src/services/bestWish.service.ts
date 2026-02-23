import api from './api';

export interface BestWish {
  id: string;
  donationId: string;
  userId: string;
  campaignId: string;
  message: string;
  cardStyle: 'simple' | 'heartfelt' | 'festive' | 'minimal';
  isAnonymous: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface PaginatedWishes {
  wishes: BestWish[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const getCampaignWishes = async (
  campaignId: string,
  page = 1,
  limit = 10
): Promise<PaginatedWishes> => {
  const { data } = await api.get(`/campaigns/${campaignId}/wishes`, {
    params: { page, limit },
  });
  return data.data;
};

export const createBestWish = async (
  donationId: string,
  wish: {
    message: string;
    cardStyle?: 'simple' | 'heartfelt' | 'festive' | 'minimal';
    isAnonymous?: boolean;
  }
): Promise<BestWish> => {
  const { data } = await api.post(`/donations/${donationId}/wish`, wish);
  return data.data;
};

export const getDonationWish = async (donationId: string): Promise<BestWish> => {
  const { data } = await api.get(`/donations/${donationId}/wish`);
  return data.data;
};

export const updateBestWish = async (
  donationId: string,
  wish: Partial<{
    message: string;
    cardStyle: 'simple' | 'heartfelt' | 'festive' | 'minimal';
    isAnonymous: boolean;
  }>
): Promise<BestWish> => {
  const { data } = await api.put(`/donations/${donationId}/wish`, wish);
  return data.data;
};

export const deleteBestWish = async (donationId: string): Promise<void> => {
  await api.delete(`/donations/${donationId}/wish`);
};
