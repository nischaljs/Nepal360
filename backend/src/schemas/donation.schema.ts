import { z } from 'zod';

export const initiateKhaltiPaymentSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['NPR']),
  returnUrl: z.string().url('Invalid return URL'),
  visibility: z.enum(['PUBLIC', 'ANONYMOUS']).default('PUBLIC'),
});

export const verifyKhaltiPaymentSchema = z.object({
  pidx: z.string(),
});
