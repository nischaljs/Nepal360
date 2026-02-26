// frontend/src/services/kyc.service.ts
import api from './api';
import type { GetKYCStatusResponse, SubmitKYCResponse, ResubmitKYCResponse, SubmitKYCData } from '../types/kyc.types';

const BASE_URL = '/kyc';

export const getKycStatus = async (): Promise<GetKYCStatusResponse> => {
  const { data } = await api.get(`${BASE_URL}/me`);
  return data.data;
};

export const submitKyc = async (kycData: SubmitKYCData): Promise<SubmitKYCResponse> => {
  const formData = new FormData();
  formData.append('documentType', kycData.documentType);
  formData.append('documentNumber', kycData.documentNumber);
  formData.append('documentImage', kycData.documentImage);
  formData.append('profilePhoto', kycData.profilePhoto);
  formData.append('bankAccountName', kycData.bankAccountName);
  formData.append('bankAccountNo', kycData.bankAccountNo);
  if (kycData.walletProvider) {
    formData.append('walletProvider', kycData.walletProvider);
  }

  const { data } = await api.post(`${BASE_URL}/submit`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.data;
};

export const resubmitKyc = async (kycData: SubmitKYCData): Promise<ResubmitKYCResponse> => {
  const formData = new FormData();
  formData.append('documentType', kycData.documentType);
  formData.append('documentNumber', kycData.documentNumber);
  formData.append('documentImage', kycData.documentImage);
  formData.append('profilePhoto', kycData.profilePhoto);
  formData.append('bankAccountName', kycData.bankAccountName);
  formData.append('bankAccountNo', kycData.bankAccountNo);
  if (kycData.walletProvider) {
    formData.append('walletProvider', kycData.walletProvider);
  }

  const { data } = await api.put(`${BASE_URL}/resubmit`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.data;
};
