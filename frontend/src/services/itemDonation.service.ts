import api from './api';
import type { ItemDonation } from '../types/itemDonation.types';

export interface PledgeItemDonationData {
  campaignId: string;
  itemName: string;
  quantity: string;
  deliveryNote?: string;
}

export interface UpdateItemDonationData {
  status?: 'DELIVERED';
  deliveryNote?: string;
  deliveryPhoto?: string;
}

export const pledgeItemDonation = async (
  data: PledgeItemDonationData
): Promise<ItemDonation> => {
  const response = await api.post<{ success: boolean; data: ItemDonation }>('/donations/items', data);
  return response.data.data;
};

export const getMyItemDonations = async (): Promise<ItemDonation[]> => {
  const response = await api.get<{ success: boolean; data: ItemDonation[] }>('/donations/items/me');
  return response.data.data;
};

export const getItemDonationById = async (donationId: string): Promise<ItemDonation> => {
  const response = await api.get<{ success: boolean; data: ItemDonation }>(`/donations/items/${donationId}`);
  return response.data.data;
};

export const getCampaignItemDonations = async (campaignId: string): Promise<ItemDonation[]> => {
  const response = await api.get<{ success: boolean; data: ItemDonation[] }>(`/donations/items/campaign/${campaignId}`);
  return response.data.data;
};

export const updateItemDonation = async (
  donationId: string,
  data: UpdateItemDonationData
): Promise<ItemDonation> => {
  const response = await api.put<{ success: boolean; data: ItemDonation }>(`/donations/items/${donationId}`, data);
  return response.data.data;
};
