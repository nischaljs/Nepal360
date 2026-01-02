import { z } from 'zod';

export const grantBadgeSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  badgeCode: z.string().min(1, 'Badge code is required'),
});
