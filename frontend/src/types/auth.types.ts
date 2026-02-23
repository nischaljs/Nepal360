export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  userId: string;
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface CurrentUser {
    id: string;
    name: string;
    email: string;
    emailStatus: "PENDING" | "VERIFIED";
    createdAt: string;
    kycProfile: {
        id: string;
        status: "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";
        rejectionReason?: string;
    } | null;
    roles: {
        isAdmin: boolean;
        isVerifiedBeneficiary: boolean;
        isDonor: boolean;
    };
}
