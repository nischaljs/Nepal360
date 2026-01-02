// frontend/src/types/kyc.types.ts

import type { CurrentUser } from "./auth.types";

export type KYCStatus = "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";

export interface KYCProfile {
  id?: string; // Optional for submission
  userId: string;
  documentType: string;
  documentNumber: string;
  documentImage: string; // URL after upload
  profilePhoto: string;  // URL after upload
  bankAccountName: string;
  bankAccountNo: string;
  walletProvider?: string | null;
  status: KYCStatus;
  rejectionReason?: string | null;
  submittedAt?: string;
  reviewedAt?: string;
  user?: Partial<CurrentUser>;
}

export interface SubmitKYCData {
  documentType: string;
  documentNumber: string;
  documentImage: File;
  profilePhoto: File;
  bankAccountName: string;
  bankAccountNo: string;
  walletProvider?: string | null;
}

export interface GetKYCStatusResponse {
  status: KYCStatus;
  rejectionReason?: string | null;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface SubmitKYCResponse {
  message: string;
  kyc: KYCProfile;
}

export interface ResubmitKYCResponse {
  message: string;
  kyc: KYCProfile;
}

