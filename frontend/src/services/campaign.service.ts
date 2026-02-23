// frontend/src/services/campaign.service.ts
import api from './api';
import type{
  Campaign,
  CampaignFilters,
  Milestone,
  CreateCampaignData,
  UpdateCampaignData,
  AddMilestoneData,
  CampaignResponse,
  CampaignsResponse,
  MilestoneResponse,
  MessageResponse,
} from '../types/campaign.types';

const BASE_URL = '/campaigns';

export const createCampaign = async (data: CreateCampaignData): Promise<Campaign> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('targetAmount', data.targetAmount.toString());
  if (data.category) formData.append('category', data.category);
  if (data.district) formData.append('district', data.district);
  formData.append('coverImage', data.coverImage);

  if (data.proofs) {
    data.proofs.forEach((proofFile) => {
      formData.append('proofs', proofFile);
    });
  }

  const response = await api.post<CampaignResponse>(BASE_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.campaign;
};

export const getMyCampaigns = async (): Promise<Campaign[]> => {
  const response = await api.get<CampaignsResponse>(`${BASE_URL}/me`);
  return response.data.campaigns;
};

export const getBeneficiaryCampaignById = async (campaignId: string): Promise<Campaign> => {
  const response = await api.get<CampaignResponse>(`${BASE_URL}/me/${campaignId}`);
  return response.data.campaign;
};

export const getCampaignById = async (campaignId: string): Promise<Campaign> => {
  const response = await api.get<CampaignResponse>(`${BASE_URL}/public/${campaignId}`);
  return response.data.campaign;
};

export const getCampaignStats = async (campaignId: string): Promise<any> => {
  const response = await api.get<any>(`${BASE_URL}/${campaignId}/stats`);
  return response.data.stats;
};

export const updateCampaign = async (
  campaignId: string,
  data: UpdateCampaignData
): Promise<Campaign> => {
  const response = await api.put<CampaignResponse>(`${BASE_URL}/${campaignId}`, data);
  return response.data.campaign;
};

export const addMilestone = async (
  campaignId: string,
  data: AddMilestoneData
): Promise<Milestone> => {
  const response = await api.post<MilestoneResponse>(`${BASE_URL}/${campaignId}/milestones`, data);
  return response.data.milestone;
};

export const deleteMilestone = async (
  campaignId: string,
  milestoneId: string
): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>(
    `${BASE_URL}/${campaignId}/milestones/${milestoneId}`
  );
  return response.data;
};

export const claimMilestone = async (
  milestoneId: string,
  claimProof?: string
): Promise<Milestone> => {
  const response = await api.post(`${BASE_URL}/milestones/${milestoneId}/claim`, { claimProof });
  return response.data.data;
};

export const getAllCampaigns = async (filters?: CampaignFilters): Promise<Campaign[]> => {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
  if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
  if (filters?.sort) params.append('sort', filters.sort);

  const query = params.toString();
  const response = await api.get<CampaignsResponse>(`${BASE_URL}${query ? `?${query}` : ''}`);
  return response.data.campaigns;
};

export const incrementShareCount = async (campaignId: string) => {
  try {
    const response = await api.post(`/campaigns/public/${campaignId}/share`);
    return response.data;
  } catch (error) {
    console.error('Error incrementing share count:', error);
    throw error;
  }
};
