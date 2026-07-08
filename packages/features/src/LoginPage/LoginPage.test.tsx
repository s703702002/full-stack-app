import { render, screen } from '@testing-library/react';
import type { SubmitEvent } from 'react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import 'vitest-axe/extend-expect';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import LoginPage from './LoginPage';
import { useAuthFlow } from './hooks/useAuthFlow';

const mockSubmit = vi.fn((e: SubmitEvent) => e.preventDefault());
const mockLogin = vi.fn();

vi.mock('./hooks/useAuthFlow', () => ({
  useAuthFlow: vi.fn(() => useAuthFlowStub()),
}));

vi.mock('./hooks/useTrans', () => ({
  useTrans: vi.fn(() => ({ t: (key: string) => key })),
}));

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
    isLoginPending: false,
    is2FAPending: false,
    handleLoginSubmit: mockSubmit,
    handle2FASubmit: mockSubmit,
    handleGoogleLogin: mockLogin,
  };
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  it('點擊 Google 登入按鈕時呼叫 handleGoogleLogin', async () => {
    const user = userEvent.setup();
    render(<LoginPage onErrorToast={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'login.google-btn' }));

    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it('不應該有明顯的可及性(accessibility)違規', async () => {
    const { container } = render(<LoginPage onErrorToast={vi.fn()} />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
