// frontend/src/services/donation.service.ts
import api from './api';
import type {
  InitiateKhaltiPaymentData,
  InitiateKhaltiPaymentResponse,
  VerifyKhaltiPaymentData,
  VerifyKhaltiPaymentResponse,
  CampaignDonorsResponse,
} from '../types/donation.types';

const BASE_URL = '/donations';
const CAMPAIGN_BASE_URL = '/campaigns';

export const initiateKhaltiPayment = async (
  data: InitiateKhaltiPaymentData
): Promise<InitiateKhaltiPaymentResponse> => {
  const response = await api.post<InitiateKhaltiPaymentResponse>(
    `${BASE_URL}/money/khalti/initiate`,
    data
  );
  return response.data;
};

export const verifyKhaltiPayment = async (
  data: VerifyKhaltiPaymentData
): Promise<VerifyKhaltiPaymentResponse> => {
  const response = await api.post<VerifyKhaltiPaymentResponse>(
    `${BASE_URL}/money/khalti/verify`,
    data
  );
  return response.data;
};

export const getCampaignDonors = async (
  campaignId: string,
  page: number = 1,
  limit: number = 10
): Promise<CampaignDonorsResponse> => {
  const response = await api.get<CampaignDonorsResponse>(
    `${CAMPAIGN_BASE_URL}/${campaignId}/donors`,
    {
      params: { page, limit },
    }
  );
  return response.data;
};
