import { z } from 'zod';
import { rejectKycSchema } from '../schemas/admin.kyc.schema';

export type TRejectKyc = z.infer<typeof rejectKycSchema>;
