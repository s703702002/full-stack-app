import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { publicApi } from '../api';
import useApiAction from '../hooks/useApiAction';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const { data, execute, loading } = useApiAction((payload) =>
    publicApi.post('/api/auth/login', payload),
  );

  useEffect(() => {
    if (!data) return;
    if (data.require2FA) {
      navigate('/login/2fa');
      return;
    }

    if (data.success) {
      globalThis.location.href = '/profile';
    }
  }, [data, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(formData);
  };

  const handleGoogleLogin = () => {
    globalThis.location.href = 'http://localhost:3000/api/auth/google';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">歡迎回來</h2>
        <p className="text-slate-500 mb-8">請輸入您的帳號密碼以登入</p>

        {/* --- 1. 一般帳密登入區塊 --- */}
        <form onSubmit={handleSubmit}>
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
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline font-medium"
            >
              忘記密碼？
            </Link>
          </div>

          {/* 確保你的 Button 元件有加上 w-full 撐滿寬度 */}
          <Button loading={loading} className="w-full py-2.5">
            立即登入
          </Button>
        </form>

        {/* --- 2. 帶有文字的優雅分隔線 --- */}
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

        {/* --- 3. Google 專屬登入按鈕 --- */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-medium py-2.5 px-4 rounded-lg hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-slate-200 focus:outline-none"
        >
          {/* Google 原廠配色 SVG Icon */}
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
          <Link
            to="/register"
            className="text-primary font-bold hover:underline"
          >
            立即註冊
          </Link>
        </p>
      </div>
    </div>
  );
}
