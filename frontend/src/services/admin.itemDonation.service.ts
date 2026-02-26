import api from "./api";
import  type { ItemDonation } from "@/types/itemDonation.types";

export const getItemDonations = async (status: string): Promise<ItemDonation[]> => {
  const { data } = await api.get(`/admin/item-donations?status=${status}`);
  return data.data;
};

export const confirmItemDonation = async (donationId: string): Promise<{ message: string; donation: ItemDonation }> => {
  const { data } = await api.post(`/admin/item-donations/${donationId}/confirm`);
  return data.data;
};

export const rejectItemDonation = async (donationId: string, reason: string): Promise<{ message: string; donation: ItemDonation }> => {
  const { data } = await api.post(`/admin/item-donations/${donationId}/reject`, { reason });
  return data.data;
};
