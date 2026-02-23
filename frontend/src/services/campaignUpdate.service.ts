import api from './api';

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  userId: string;
  title: string;
  content: string;
  images: string[];
  isMilestone: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface PaginatedUpdates {
  updates: CampaignUpdate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const getCampaignUpdates = async (
  campaignId: string,
  page = 1,
  limit = 10
): Promise<PaginatedUpdates> => {
  const { data } = await api.get(`/campaigns/${campaignId}/updates`, {
    params: { page, limit },
  });
  return data.data;
};

export const getCampaignUpdate = async (
  campaignId: string,
  updateId: string
): Promise<CampaignUpdate> => {
  const { data } = await api.get(`/campaigns/${campaignId}/updates/${updateId}`);
  return data.data;
};

export const createCampaignUpdate = async (
  campaignId: string,
  update: {
    title: string;
    content: string;
    images?: string[];
    isMilestone?: boolean;
  }
): Promise<CampaignUpdate> => {
  const { data } = await api.post(`/campaigns/${campaignId}/updates`, update);
  return data.data;
};

export const updateCampaignUpdate = async (
  campaignId: string,
  updateId: string,
  update: Partial<{
    title: string;
    content: string;
    images: string[];
    isMilestone: boolean;
  }>
): Promise<CampaignUpdate> => {
  const { data } = await api.put(
    `/campaigns/${campaignId}/updates/${updateId}`,
    update
  );
  return data.data;
};

export const deleteCampaignUpdate = async (
  campaignId: string,
  updateId: string
): Promise<void> => {
  await api.delete(`/campaigns/${campaignId}/updates/${updateId}`);
};
