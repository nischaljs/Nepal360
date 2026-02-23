import api from './api';
import type {
  SignupData,
  SignupResponse,
  VerifyEmailData,
  VerifyEmailResponse,
  LoginData,
  LoginResponse,
  ForgotPasswordData,
  ForgotPasswordResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  CurrentUser,
} from '../types/auth.types';

export const signup = async (data: SignupData): Promise<SignupResponse> => {
  const response = await api.post<SignupResponse>('/auth/signup', data);
  return response.data;
};

export const verifyEmail = async (data: VerifyEmailData): Promise<VerifyEmailResponse> => {
  const response = await api.post<VerifyEmailResponse>('/auth/verify-email', data);
  return response.data;
};

export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);

  return response.data;
};

export const forgotPassword = async (data: ForgotPasswordData): Promise<ForgotPasswordResponse> => {
  const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordData): Promise<ResetPasswordResponse> => {
  const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await api.get<{ user: CurrentUser }>('/auth/me');
  return response.data.user;
};

export const logout = () => {
  localStorage.removeItem('token');
};
