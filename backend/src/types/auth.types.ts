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

// Extend AuthenticatedRequest to include the 'files' property from Multer's fields()
export interface AuthenticatedRequestWithFiles extends AuthenticatedRequest {
  // files property will be handled by direct casting in the controller due to Multer type complexities.
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Partial<AuthUser>;
}
