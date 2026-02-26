import api from "./api";
import type { UserBadge } from "@/types/badge.types";

export interface GrantBadgeData {
  userId: string;
  badgeCode: string;
}

export interface BadgeOption {
  id: string;
  code: string;
  name: string;
  description: string;
  badgeType: string;
}

export interface UserOption {
  id: string;
  name: string;
  email: string;
}

export const grantBadge = async (reqData: GrantBadgeData): Promise<UserBadge> => {
  const { data } = await api.post("/admin/badges/grant", reqData);
  return data.data;
};

export const listBadges = async (): Promise<BadgeOption[]> => {
  const { data } = await api.get("/admin/badges");
  return data.badges;
};

export const listUsersForAdmin = async (search?: string): Promise<UserOption[]> => {
  const { data } = await api.get("/admin/users", { params: search ? { search } : undefined });
  return data.data;
};
