import { z } from 'zod';
import {
  initiateKhaltiPaymentSchema,
  verifyKhaltiPaymentSchema,
} from '../schemas/donation.schema';

export type TInitiateKhaltiPayment = z.infer<
  typeof initiateKhaltiPaymentSchema
>;
export type TVerifyKhaltiPayment = z.infer<typeof verifyKhaltiPaymentSchema>;
