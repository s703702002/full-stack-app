import { publicApi, privateApi } from '../api';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type {
  ApiResponse,
  ApiErrorResponse,
  AuthResponseDTO,
  TwoFAInfoDTO,
} from '@full-stack-app/shared';

export interface ForgotPasswordPayload {
  username: string;
}

export const forgotPasswordMutation = () =>
  mutationOptions<
    ApiResponse<Record<string, never>>,
    AxiosError<ApiErrorResponse>,
    ForgotPasswordPayload
  >({
    mutationFn: (payload) =>
      publicApi.post('/api/auth/forgot-password', payload).then((r) => r.data),
  });

export interface LoginPayload {
  username: string;
  password: string;
}

export const loginMutation = () =>
  mutationOptions<
    ApiResponse<AuthResponseDTO>,
    AxiosError<ApiErrorResponse>,
    LoginPayload
  >({
    mutationFn: (payload) =>
      publicApi.post('/api/auth/login', payload).then((r) => r.data),
  });

export interface Login2FAPayload {
  totpCode: string;
}

export const login2FAMutation = () =>
  mutationOptions<
    ApiResponse<Record<string, never>>,
    AxiosError<ApiErrorResponse>,
    Login2FAPayload
  >({
    mutationFn: (payload) =>
      publicApi.post('/api/auth/login-2fa', payload).then((r) => r.data),
  });

export const setup2FAQuery = () =>
  queryOptions<TwoFAInfoDTO, AxiosError<ApiErrorResponse>>({
    queryKey: ['2fa-setup'],
    queryFn: () =>
      privateApi.get('/api/auth/2fa/setup').then((r) => r.data.data),
  });

export interface Verify2FAPayload {
  token: string;
}

export const verify2FAMutation = () =>
  mutationOptions<
    ApiResponse<Record<string, never>>,
    AxiosError<ApiErrorResponse>,
    Verify2FAPayload
  >({
    mutationFn: (payload) =>
      publicApi.post('/api/auth/2fa/verify', payload).then((r) => r.data),
  });

export interface RegisterPayload {
  name: string;
  username: string;
  password?: string;
  confirmPassword?: string;
}

export const registerMutation = () =>
  mutationOptions<
    ApiResponse<Record<string, never>>,
    AxiosError<ApiErrorResponse>,
    RegisterPayload
  >({
    mutationFn: (payload) =>
      publicApi.post('/api/auth/register', payload).then((r) => r.data),
  });

export interface ResetPasswordPayload {
  newPassword: string;
}

export const resetPasswordMutation = (token: string) =>
  mutationOptions<
    ApiResponse<Record<string, never>>,
    AxiosError<ApiErrorResponse>,
    ResetPasswordPayload
  >({
    mutationFn: (payload) =>
      publicApi
        .post(`/api/auth/reset-password/${token}`, payload)
        .then((r) => r.data),
  });
