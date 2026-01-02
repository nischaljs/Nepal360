import { z } from 'zod';
import { pledgeItemDonationSchema } from '../schemas/itemDonation.schema';

export type TPledgeItemDonation = z.infer<typeof pledgeItemDonationSchema>;
