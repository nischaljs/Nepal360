import { z } from 'zod';

export const rejectItemDonationSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});
