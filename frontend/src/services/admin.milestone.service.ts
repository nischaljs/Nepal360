import api from './api';
import type { Milestone } from '../types/campaign.types';

const BASE_URL = '/admin';

export const getAdminMilestones = async (campaignId: string): Promise<Milestone[]> => {
  const res = await api.get(`${BASE_URL}/campaigns/${campaignId}/milestones`);
  return res.data.data;
};

export const releaseMilestoneFunds = async (
  milestoneId: string,
  amount?: number
): Promise<Milestone> => {
  const res = await api.post(`${BASE_URL}/milestones/${milestoneId}/release`, { amount });
  return res.data.data;
};

export const rejectMilestoneClaim = async (
  milestoneId: string,
  reason?: string
): Promise<Milestone> => {
  const res = await api.post(`${BASE_URL}/milestones/${milestoneId}/reject`, { reason });
  return res.data.data;
};
