import { Button, InputField } from '@full-stack-app/ui';
import { useAuthFlow } from '../hooks/useAuthFlow';

export interface LoginPageProps {
  onErrorToast: (message: string) => void;
}

export default function LoginPage({ onErrorToast }: Readonly<LoginPageProps>) {
  const {
    step,
    setStep,
    formData,
    setFormData,
    totpCode,
    setTotpCode,
    isLoginPending,
    is2FAPending,
    handleLoginSubmit,
    handle2FASubmit,
    handleGoogleLogin,
  } = useAuthFlow({ onError: onErrorToast });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden relative min-h-[550px] flex flex-col justify-center">
        <div
          className="w-[200%] flex transition-transform duration-500 ease-in-out"
          style={{
            transform: step === '2fa' ? 'translateX(-50%)' : 'translateX(0%)',
          }}
        >
          <div className="w-1/2 p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">歡迎回來</h2>
            <p className="text-slate-500 mb-8">請輸入您的帳號密碼以登入</p>

            <form onSubmit={handleLoginSubmit}>
              <div className="space-y-4">
                <InputField
                  label="帳號 (Username)"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  placeholder="例如: testuser"
                />
                <InputField
                  label="密碼 (Password)"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-end mt-2 mb-6">
                <a
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  忘記密碼？
                </a>
              </div>

              <Button loading={isLoginPending} className="w-full py-2.5">
                立即登入
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-medium">
                  或使用其他方式
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-medium py-2.5 px-4 rounded-lg hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-slate-200 focus:outline-none"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              使用 Google 登入
            </button>

            <p className="text-center text-slate-600 mt-8 text-sm">
              還沒有帳號？{' '}
              <a
                href="/register"
                className="text-primary font-bold hover:underline"
              >
                立即註冊
              </a>
            </p>
          </div>

          <div className="w-1/2 p-8 flex flex-col justify-center relative">
            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              返回修改
            </button>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              兩階段驗證
            </h2>
            <p className="text-slate-500 mb-8 text-center">
              請打開 Google Authenticator 輸入您的 6 位數驗證碼
            </p>

            <form onSubmit={handle2FASubmit}>
              <div className="mb-6">
                <InputField
                  label="6 位數驗證碼"
                  type="text"
                  value={totpCode}
                  onChange={(e) =>
                    setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  required
                  placeholder="例如: 123456"
                  autoComplete="one-time-code"
                />
              </div>

              <Button loading={is2FAPending} className="w-full py-2.5">
                驗證並登入
              </Button>
            </form>

            <p className="text-center text-slate-400 mt-8 text-xs">
              驗證碼每 30 秒自動更新一次
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
