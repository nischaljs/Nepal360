// frontend/src/services/admin.campaign.service.ts
import api from './api';
import type{
  AdminCampaignFilter,
  AdminCampaignListItem,
  AdminCampaignDetail,
  AdminCampaignVerificationQueueItem,
  AdminCampaignStats,
  ApproveCampaignData,
  RejectCampaignData,
  SuspendCampaignData,
  DeleteCampaignData,
  AdminCampaignsResponse,
  AdminCampaignDetailResponse,
  AdminCampaignVerificationQueueResponse,
  AdminCampaignStatsResponse,
  AdminCampaignActionResponse,
  AdminMessageResponse,
} from '../types/admin.campaign.types';

import type{ Campaign } from '../types/campaign.types'; // For action responses

const BASE_URL = '/admin/campaigns';

export const getAdminCampaigns = async (
  filters?: AdminCampaignFilter
): Promise<AdminCampaignListItem[]> => {
  const response = await api.get<AdminCampaignsResponse>(BASE_URL, { params: filters });
  return response.data.campaigns;
};

export const getAdminVerificationQueue = async (): Promise<AdminCampaignVerificationQueueItem[]> => {
  const response = await api.get<AdminCampaignVerificationQueueResponse>(
    `${BASE_URL}/verification-queue`
  );
  return response.data.queue;
};

export const getAdminCampaignDetail = async (campaignId: string): Promise<AdminCampaignDetail> => {
  const response = await api.get<AdminCampaignDetailResponse>(`${BASE_URL}/${campaignId}`);
  return response.data.campaign;
};

export const getAdminCampaignStats = async (campaignId: string): Promise<AdminCampaignStats> => {
  const response = await api.get<AdminCampaignStatsResponse>(`${BASE_URL}/${campaignId}/stats`);
  return response.data.stats;
};

export const approveCampaign = async (
  campaignId: string,
  data?: ApproveCampaignData
): Promise<Campaign> => {
  const response = await api.post<AdminCampaignActionResponse>(
    `${BASE_URL}/${campaignId}/approve`,
    data
  );
  return response.data.campaign as Campaign; // Backend doc says it returns campaign object
};

export const rejectCampaign = async (
  campaignId: string,
  data: RejectCampaignData
): Promise<Campaign> => {
  const response = await api.post<AdminCampaignActionResponse>(
    `${BASE_URL}/${campaignId}/reject`,
    data
  );
  return response.data.campaign as Campaign; // Backend doc says it returns campaign object
};

export const suspendCampaign = async (
  campaignId: string,
  data: SuspendCampaignData
): Promise<Campaign> => {
  const response = await api.post<AdminCampaignActionResponse>(
    `${BASE_URL}/${campaignId}/suspend`,
    data
  );
  return response.data.campaign as Campaign; // Backend doc says it returns campaign object
};

export const resumeCampaign = async (campaignId: string): Promise<Campaign> => {
  const response = await api.post<AdminCampaignActionResponse>(
    `${BASE_URL}/${campaignId}/resume`
  );
  return response.data.campaign as Campaign; // Backend doc says it returns campaign object
};

export const deleteCampaign = async (
  campaignId: string,
  data: DeleteCampaignData
): Promise<AdminMessageResponse> => {
  const response = await api.delete<AdminMessageResponse>(`${BASE_URL}/${campaignId}`, { data });
  return response.data;
};
