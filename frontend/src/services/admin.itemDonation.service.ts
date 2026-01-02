import api from "./api";
import  type { ItemDonation } from "@/types/itemDonation.types";

export const getItemDonations = async (status: string): Promise<ItemDonation[]> => {
  const response = await api.get(`/admin/item-donations?status=${status}`);
  return response.data;
};

export const confirmItemDonation = async (donationId: string): Promise<{ message: string; donation: ItemDonation }> => {
  const response = await api.post(`/admin/item-donations/${donationId}/confirm`);
  return response.data;
};

export const rejectItemDonation = async (donationId: string, reason: string): Promise<{ message: string; donation: ItemDonation }> => {
  const response = await api.post(`/admin/item-donations/${donationId}/reject`, { reason });
  return response.data;
};
