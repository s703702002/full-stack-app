import { publicApi } from '../api';
import { mutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type {
  ApiResponse,
  ApiErrorResponse,
  AuthResponseDTO,
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
