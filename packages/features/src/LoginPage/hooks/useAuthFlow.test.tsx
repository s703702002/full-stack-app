import type { ReactNode, SubmitEvent } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AxiosInstance, AxiosError } from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useAuthFlow } from './useAuthFlow';
import { getApi } from '../../api';
import type { ApiErrorResponse } from '@full-stack-app/shared';

// 只 mock 最底層的 axios instance 來源,
// react-query 的 useMutation 保持真實運作,才能測到「成功/失敗/pending」的完整生命週期。
vi.mock('../../api', () => ({
  getApi: vi.fn(),
}));

const mockedGetApi = vi.mocked(getApi);

function createFakeSubmitEvent(): SubmitEvent {
  return { preventDefault: vi.fn() } as unknown as SubmitEvent;
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function mockApi(overrides: Partial<AxiosInstance> = {}) {
  const instance = { post: vi.fn(), ...overrides } as unknown as AxiosInstance;
  mockedGetApi.mockReturnValue(instance);
  return instance;
}

beforeEach(() => {
  vi.clearAllMocks();
  // @ts-expect-error 測試環境刻意覆寫 location,方便斷言 href 被設成什麼值
  delete window.location;
  // @ts-expect-error 測試環境刻意覆寫 location,方便斷言 href 被設成什麼值
  window.location = {
    href: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  };
});

describe('useAuthFlow', () => {
  it('初始狀態為 credentials 步驟,表單資料為空,沒有任何 pending', () => {
    mockApi();
    const { result } = renderHook(() => useAuthFlow({ onError: vi.fn() }), {
      wrapper: createWrapper(),
    });

    expect(result.current.step).toBe('credentials');
    expect(result.current.formData).toEqual({ username: '', password: '' });
    expect(result.current.totpCode).toBe('');
    expect(result.current.isLoginPending).toBe(false);
    expect(result.current.is2FAPending).toBe(false);
  });

  describe('登入(handleLoginSubmit)', () => {
    it('登入成功且不需要 2FA 時,導向 /profile', async () => {
      mockApi({
        post: vi
          .fn()
          .mockResolvedValue({ data: { data: { require2FA: false } } }),
      });
      const { result } = renderHook(() => useAuthFlow({ onError: vi.fn() }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.handleLoginSubmit(createFakeSubmitEvent());
      });

      await waitFor(() => {
        expect(window.location.href).toBe('/profile');
      });
    });

    it('登入成功但需要 2FA 時,切換 step 為 2fa,且不導頁', async () => {
      mockApi({
        post: vi
          .fn()
          .mockResolvedValue({ data: { data: { require2FA: true } } }),
      });
      const { result } = renderHook(() => useAuthFlow({ onError: vi.fn() }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.handleLoginSubmit(createFakeSubmitEvent());
      });

      await waitFor(() => {
        expect(result.current.step).toBe('2fa');
      });
      expect(window.location.href).toBe('');
    });

    it('登入失敗時,呼叫 onError 並帶上後端回傳的訊息', async () => {
      const axiosError = {
        response: { data: { message: '帳號或密碼錯誤' } },
      } as AxiosError<ApiErrorResponse>;
      mockApi({ post: vi.fn().mockRejectedValue(axiosError) });
      const onError = vi.fn();
      const { result } = renderHook(() => useAuthFlow({ onError }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.handleLoginSubmit(createFakeSubmitEvent());
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('帳號或密碼錯誤');
      });
    });

    it('登入失敗且後端沒回傳訊息時,使用預設的「登入失敗」訊息', async () => {
      const axiosError = {
        response: undefined,
      } as AxiosError<ApiErrorResponse>;
      mockApi({ post: vi.fn().mockRejectedValue(axiosError) });
      const onError = vi.fn();
      const { result } = renderHook(() => useAuthFlow({ onError }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.handleLoginSubmit(createFakeSubmitEvent());
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('登入失敗');
      });
    });

    it('API 回應前,isLoginPending 為 true;回應後恢復 false', async () => {
      let resolvePost: (value: unknown) => void = () => {};
      const pending = new Promise((resolve) => {
        resolvePost = resolve;
      });
      mockApi({ post: vi.fn().mockReturnValue(pending) });
      const { result } = renderHook(() => useAuthFlow({ onError: vi.fn() }), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.handleLoginSubmit(createFakeSubmitEvent());
      });

      await waitFor(() => {
        expect(result.current.isLoginPending).toBe(true);
      });

      await act(async () => {
        resolvePost({ data: { data: { require2FA: false } } });
        await pending;
      });

      await waitFor(() => {
        expect(result.current.isLoginPending).toBe(false);
      });
    });
  });

  describe('2FA 驗證(handle2FASubmit)', () => {
    it('驗證成功時導向 /profile', async () => {
      mockApi({ post: vi.fn().mockResolvedValue({ data: {} }) });
      const { result } = renderHook(() => useAuthFlow({ onError: vi.fn() }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.handle2FASubmit(createFakeSubmitEvent());
      });

      await waitFor(() => {
        expect(window.location.href).toBe('/profile');
      });
    });

    it('驗證失敗時呼叫 onError 並帶上後端訊息', async () => {
      const axiosError = {
        response: { data: { message: '驗證碼錯誤' } },
      } as AxiosError<ApiErrorResponse>;
      mockApi({ post: vi.fn().mockRejectedValue(axiosError) });
      const onError = vi.fn();
      const { result } = renderHook(() => useAuthFlow({ onError }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.handle2FASubmit(createFakeSubmitEvent());
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('驗證碼錯誤');
      });
    });
  });

  describe('handleGoogleLogin', () => {
    it('直接同步導向 Google 登入的 OAuth 端點', () => {
      mockApi();
      const { result } = renderHook(() => useAuthFlow({ onError: vi.fn() }), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.handleGoogleLogin();
      });

      expect(window.location.href).toBe(
        'http://localhost:3000/api/auth/google',
      );
    });
  });
});
