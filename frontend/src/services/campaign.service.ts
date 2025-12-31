// frontend/src/services/campaign.service.ts
import api from './api';
import type{
  Campaign,
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

export const getCampaignById = async (campaignId: string): Promise<Campaign> => {
  const response = await api.get<CampaignResponse>(`${BASE_URL}/${campaignId}`);
  return response.data.campaign;
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
