// frontend/src/services/kyc.service.ts
import api from './api';
import type { GetKYCStatusResponse, SubmitKYCResponse, ResubmitKYCResponse, SubmitKYCData } from '../types/kyc.types';

const BASE_URL = '/kyc';

export const getKycStatus = async (): Promise<GetKYCStatusResponse> => {
  const response = await api.get<GetKYCStatusResponse>(`${BASE_URL}/me`);
  return response.data;
};

export const submitKyc = async (data: SubmitKYCData): Promise<SubmitKYCResponse> => {
  const formData = new FormData();
  formData.append('documentType', data.documentType);
  formData.append('documentNumber', data.documentNumber);
  formData.append('documentImage', data.documentImage);
  formData.append('profilePhoto', data.profilePhoto);
  formData.append('bankAccountName', data.bankAccountName);
  formData.append('bankAccountNo', data.bankAccountNo);
  if (data.walletProvider) {
    formData.append('walletProvider', data.walletProvider);
  }

  const response = await api.post<SubmitKYCResponse>(`${BASE_URL}/submit`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const resubmitKyc = async (data: SubmitKYCData): Promise<ResubmitKYCResponse> => {
  const formData = new FormData();
  formData.append('documentType', data.documentType);
  formData.append('documentNumber', data.documentNumber);
  formData.append('documentImage', data.documentImage);
  formData.append('profilePhoto', data.profilePhoto);
  formData.append('bankAccountName', data.bankAccountName);
  formData.append('bankAccountNo', data.bankAccountNo);
  if (data.walletProvider) {
    formData.append('walletProvider', data.walletProvider);
  }

  const response = await api.put<ResubmitKYCResponse>(`${BASE_URL}/resubmit`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
