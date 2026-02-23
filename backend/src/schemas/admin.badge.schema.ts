import { z } from 'zod';

export const grantBadgeSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  badgeCode: z.string().min(1, 'Badge code is required'),
});

export const createBadgeSchema = z.object({
  code: z.string().min(1, 'Badge code is required').max(50, 'Code too long'),
  name: z.string().min(1, 'Badge name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  iconUrl: z.string().url('Invalid icon URL').optional().or(z.literal('')),
  badgeType: z.enum(['FIRST_DONATION', 'LIFETIME_AMOUNT', 'CAMPAIGN_SUPPORTER', 'ITEM_DONOR', 'LEADERBOARD_WINNER']),
});

export const updateBadgeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  iconUrl: z.string().url().optional().or(z.literal('')),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export type GrantBadgeInput = z.infer<typeof grantBadgeSchema>;
export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;
export type UpdateBadgeInput = z.infer<typeof updateBadgeSchema>;
