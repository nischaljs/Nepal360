import { z } from 'zod';

export const createRecurringSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID'),
  amount: z.number().positive('Amount must be positive').min(10, 'Minimum amount is 10'),
  frequency: z.enum(['MONTHLY', 'WEEKLY']),
});

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
