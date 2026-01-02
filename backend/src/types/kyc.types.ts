import { z } from 'zod';
import { submitKycSchema } from '../schemas/kyc.schema';

export type TSubmitKyc = z.infer<typeof submitKycSchema>;
