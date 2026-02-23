import api from './api';

export const downloadReceipt = async (donationId: string): Promise<Blob> => {
  const { data } = await api.get(`/donations/${donationId}/receipt`, {
    responseType: 'blob',
  });
  return data;
};

export const getMyReceipts = async (): Promise<Array<{
  id: string;
  amount: string;
  campaignTitle: string;
  createdAt: string;
  receiptNumber: string;
}>> => {
  const { data } = await api.get('/donations/me/receipts');
  return data.data;
};

export const downloadAllReceipts = async (): Promise<Blob> => {
  const { data } = await api.get('/donations/me/receipts/download-all', {
    responseType: 'blob',
  });
  return data;
};

export const emailReceipt = async (donationId: string): Promise<void> => {
  await api.post(`/donations/${donationId}/receipt/email`);
};
