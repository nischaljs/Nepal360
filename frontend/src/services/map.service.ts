import api from './api';

export interface CampaignMapItem {
  id: string;
  title: string;
  district: string;
  category: string;
  targetAmount: string;
  coverImage: string;
  donationCount: number;
  beneficiary: string;
  lat: number;
  lng: number;
}

export const getCampaignMapData = async (): Promise<CampaignMapItem[]> => {
  const { data } = await api.get('/map/campaigns');
  return data.data;
};

export const getDistrictList = async (): Promise<string[]> => {
  const { data } = await api.get('/map/districts');
  return data.data;
};
