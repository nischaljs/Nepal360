import { z } from 'zod';

export const submitKycSchema = z.object({
  documentType: z.string().min(1, 'Document type is required'),
  documentNumber: z.string().min(1, 'Document number is required'),
  documentImage: z.string().min(1, 'Document image is required'),
  profilePhoto: z.string().min(1, 'Profile photo is required'),
  bankAccountName: z.string().min(1, 'Bank account name is required'),
  bankAccountNo: z.string().min(1, 'Bank account number is required'),
  walletProvider: z.string().optional(),
});
