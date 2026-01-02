import { z } from 'zod';

export const pledgeItemDonationSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID'),
  itemName: z.string().min(1, 'Item name is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  deliveryNote: z.string().optional(),
  deliveryPhoto: z.string().optional(),
});
