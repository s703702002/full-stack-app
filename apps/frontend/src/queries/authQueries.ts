import { publicApi } from '../api';
import { UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type {
  ApiResponse,
  ApiErrorResponse,
  AuthResponseDTO,
} from '@full-stack-app/shared';

export interface ForgotPasswordPayload {
  username: string;
}

export const forgotPasswordMutation = (): UseMutationOptions<
  ApiResponse<Record<string, never>>,
  AxiosError<ApiErrorResponse>,
  ForgotPasswordPayload
> => ({
  mutationFn: (payload: ForgotPasswordPayload) =>
    publicApi.post('/api/auth/forgot-password', payload).then((r) => r.data),
});

export interface LoginPayload {
  username: string;
  password: string;
}

export const loginMutation = (): UseMutationOptions<
  ApiResponse<AuthResponseDTO>,
  AxiosError<ApiErrorResponse>,
  LoginPayload
> => ({
  mutationFn: (payload: LoginPayload) =>
    publicApi.post('/api/auth/login', payload).then((r) => r.data),
});

export interface Login2FAPayload {
  totpCode: string;
}

export const login2FAMutation = (): UseMutationOptions<
  ApiResponse<Record<string, never>>,
  AxiosError<ApiErrorResponse>,
  Login2FAPayload
> => ({
  mutationFn: (payload: Login2FAPayload) =>
    publicApi.post('/api/auth/login-2fa', payload).then((r) => r.data),
});
