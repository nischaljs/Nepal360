import api from "./api";
import type { UserBadge } from "@/types/badge.types";

export interface GrantBadgeData {
  userId: string;
  badgeCode: string;
}

export const grantBadge = async (data: GrantBadgeData): Promise<UserBadge> => {
  const response = await api.post("/admin/badges/grant", data);
  return response.data;
};
