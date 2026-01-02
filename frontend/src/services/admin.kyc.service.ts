import api from "./api";
import type { KYCProfile } from "@/types/kyc.types";

export const getKycProfiles = async (status: string): Promise<KYCProfile[]> => {
  const response = await api.get(`/admin/kyc?status=${status}`);
  return response.data;
};

export const getKycProfileDetails = async (userId: string): Promise<KYCProfile> => {
  const response = await api.get(`/admin/kyc/${userId}`);
  return response.data;
};

export const approveKyc = async (userId: string): Promise<{ message: string; kycProfile: KYCProfile }> => {
  const response = await api.post(`/admin/kyc/${userId}/approve`);
  return response.data;
};

export const rejectKyc = async (userId: string, reason: string): Promise<{ message: string; kycProfile: KYCProfile }> => {
  const response = await api.post(`/admin/kyc/${userId}/reject`, { reason });
  return response.data;
};
