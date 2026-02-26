import api from "./api";
import type { KYCProfile } from "@/types/kyc.types";

export const getKycProfiles = async (status: string): Promise<KYCProfile[]> => {
  const { data } = await api.get(`/admin/kyc?status=${status}`);
  return data.data;
};

export const getKycProfileDetails = async (userId: string): Promise<KYCProfile> => {
  const { data } = await api.get(`/admin/kyc/${userId}`);
  return data.data;
};

export const approveKyc = async (userId: string): Promise<{ message: string; kycProfile: KYCProfile }> => {
  const { data } = await api.post(`/admin/kyc/${userId}/approve`);
  return data.data;
};

export const rejectKyc = async (userId: string, reason: string): Promise<{ message: string; kycProfile: KYCProfile }> => {
  const { data } = await api.post(`/admin/kyc/${userId}/reject`, { reason });
  return data.data;
};
