import { useState, SubmitEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getApi } from '../api';
import {
  ApiErrorResponse,
  ApiResponse,
  AuthResponseDTO,
  Login2FABody,
  LoginBody,
} from '@full-stack-app/shared';
import { AxiosError } from 'axios';

interface UseAuthFlowOptions {
  onError: (message: string) => void;
}

export function useAuthFlow({ onError }: UseAuthFlowOptions) {
  const api = getApi();
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [totpCode, setTotpCode] = useState('');

  const loginCall = useMutation({
    mutationFn: (payload: LoginBody) =>
      api
        .post<ApiResponse<AuthResponseDTO>>('/api/auth/login', payload)
        .then((r) => r.data),
    onSuccess: (res) => {
      const authData = res.data;
      if ('require2FA' in authData && authData.require2FA) {
        setStep('2fa');
        return;
      }
      globalThis.location.href = '/profile';
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      onError(err.response?.data?.message || '登入失敗');
    },
  });

  const verify2FACall = useMutation({
    mutationFn: (payload: Login2FABody) =>
      api.post<ApiResponse>('/api/auth/login-2fa', payload).then((r) => r.data),
    onSuccess: () => {
      globalThis.location.href = '/profile';
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      onError(err.response?.data?.message || '登入失敗');
    },
  });

  const handleLoginSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    loginCall.mutate(formData);
  };

  const handle2FASubmit = (e: SubmitEvent) => {
    e.preventDefault();
    verify2FACall.mutate({ totpCode });
  };

  const handleGoogleLogin = () => {
    globalThis.location.href = 'http://localhost:3000/api/auth/google';
  };

  return {
    // 狀態
    step,
    setStep,
    formData,
    setFormData,
    totpCode,
    setTotpCode,
    isLoginPending: loginCall.isPending,
    is2FAPending: verify2FACall.isPending,
    // 行為
    handleLoginSubmit,
    handle2FASubmit,
    handleGoogleLogin,
  };
}
