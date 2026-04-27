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

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">歡迎回來</h2>
        <p className="text-slate-500 mb-8">請輸入您的帳號密碼以登入</p>

        <form onSubmit={handleSubmit}>
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
          <div className="text-right mb-6">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              忘記密碼？
            </Link>
          </div>
          <Button loading={loading}>立即登入</Button>
        </form>

        <p className="text-center text-slate-600 mt-8 text-sm">
          還沒有帳號？{' '}
          <Link
            to="/register"
            className="text-primary font-medium hover:underline"
          >
            立即註冊
          </Link>
        </p>
      </div>
    </div>
  );
}
