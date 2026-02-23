import api from './api';

export interface RecurringDonation {
  id: string;
  donorId: string;
  campaignId: string;
  amount: string;
  frequency: 'MONTHLY' | 'WEEKLY';
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  nextDueDate: string;
  lastPaidDate: string | null;
  totalPaid: string;
  paymentCount: number;
  createdAt: string;
  updatedAt: string;
  campaign: {
    id: string;
    title: string;
    coverImage?: string;
    status?: string;
  };
}

export const createRecurringDonation = async (data: {
  campaignId: string;
  amount: number;
  frequency: 'MONTHLY' | 'WEEKLY';
}): Promise<RecurringDonation> => {
  const res = await api.post('/recurring-donations', data);
  return res.data.data;
};

export const getMyRecurringDonations = async (): Promise<RecurringDonation[]> => {
  const res = await api.get('/recurring-donations/me');
  return res.data.data;
};

export const pauseRecurringDonation = async (id: string): Promise<RecurringDonation> => {
  const res = await api.patch(`/recurring-donations/${id}/pause`);
  return res.data.data;
};

export const resumeRecurringDonation = async (id: string): Promise<RecurringDonation> => {
  const res = await api.patch(`/recurring-donations/${id}/resume`);
  return res.data.data;
};

export const cancelRecurringDonation = async (id: string): Promise<RecurringDonation> => {
  const res = await api.patch(`/recurring-donations/${id}/cancel`);
  return res.data.data;
};
