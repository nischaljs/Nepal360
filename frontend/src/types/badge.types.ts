export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  badgeType: string;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  awardedAt: string;
  badge?: Badge;
}
