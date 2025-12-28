import { Request } from 'express';

export interface TokenPayload {
  userId: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthUser extends TokenPayload {
  name?: string;
  roles?: {
    isAdmin: boolean;
    isVerifiedBeneficiary: boolean;
    isDonor: boolean;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Partial<AuthUser>;
}
