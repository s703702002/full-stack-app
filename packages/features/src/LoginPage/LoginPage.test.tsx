import { render, screen } from '@testing-library/react';
import type { SubmitEvent } from 'react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import LoginPage from './LoginPage';
import { useAuthFlow } from './hooks/useAuthFlow';

const mockLoginSubmit = vi.fn((e: SubmitEvent) => e.preventDefault());
const mock2FASubmit = vi.fn((e: SubmitEvent) => e.preventDefault());
const mockGoogleLogin = vi.fn();

vi.mock('./hooks/useAuthFlow', () => ({
  useAuthFlow: vi.fn(() => useAuthFlowStub()),
}));

vi.mock('./hooks/useTrans', () => ({
  useTrans: vi.fn(() => ({ t: (key: string) => key })),
}));

let isLoginPending = false;

function useAuthFlowStub() {
  const [step, setStep] = useState('credentials');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [totpCode, setTotpCode] = useState('');

  return {
    step,
    setStep,
    formData,
    setFormData,
    totpCode,
    setTotpCode,
    isLoginPending,
    is2FAPending: false,
    handleLoginSubmit: mockLoginSubmit,
    handle2FASubmit: mock2FASubmit,
    handleGoogleLogin: mockGoogleLogin,
  };
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isLoginPending = false;
  });

  it('把 onErrorToast 正確傳給 useAuthFlow', () => {
    const onErrorToast = vi.fn();
    render(<LoginPage onErrorToast={onErrorToast} />);

    expect(useAuthFlow).toHaveBeenCalledWith({ onError: onErrorToast });
  });

  it('輸入帳號密碼時,畫面上的值會跟著更新', async () => {
    const user = userEvent.setup();
    render(<LoginPage onErrorToast={vi.fn()} />);

    const usernameInput = screen.getByLabelText('input-label.username');
    const passwordInput = screen.getByLabelText('input-label.password');

    await user.type(usernameInput, 'alice');
    await user.type(passwordInput, 's3cret');

    expect(usernameInput).toHaveValue('alice');
    expect(passwordInput).toHaveValue('s3cret');
  });

  it('送出登入表單時呼叫 handleLoginSubmit', async () => {
    const user = userEvent.setup();
    render(<LoginPage onErrorToast={vi.fn()} />);
    const usernameInput = screen.getByLabelText('input-label.username');
    const passwordInput = screen.getByLabelText('input-label.password');

    await user.type(usernameInput, 'alice');
    await user.type(passwordInput, 's3cret');
    await user.click(screen.getByRole('button', { name: 'login.submit-btn' }));

    expect(mockLoginSubmit).toHaveBeenCalledTimes(1);
  });

  it('點擊 Google 登入按鈕時呼叫 handleGoogleLogin', async () => {
    const user = userEvent.setup();
    render(<LoginPage onErrorToast={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'login.google-btn' }));

    expect(mockGoogleLogin).toHaveBeenCalledTimes(1);
  });

  it('登入送出中(isLoginPending)時,登入按鈕會拿到 loading 狀態', () => {
    isLoginPending = true;
    render(<LoginPage onErrorToast={vi.fn()} />);

    const submitButton = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('data-loading') === 'true');

    expect(submitButton).toBeDefined();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('處理中...');
  });

  it('不應該有明顯的可及性(accessibility)違規', async () => {
    const { container } = render(<LoginPage onErrorToast={vi.fn()} />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
