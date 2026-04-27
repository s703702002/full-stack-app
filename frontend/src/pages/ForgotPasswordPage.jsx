import { useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import useApiAction from '../hooks/useApiAction';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const { execute, loading } = useApiAction((payload) =>
    publicApi.post('/api/auth/forgot-password', payload),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute({ username });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">忘記密碼</h2>
        <p className="text-slate-500 mb-8">
          請輸入您的帳號，我們將發送重設密碼的連結給您。
        </p>

        <form onSubmit={handleSubmit}>
          <InputField
            label="您的帳號 (Username)"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="請輸入註冊時的帳號"
          />
          <div className="mb-8"></div>
          <Button loading={loading}>發送重設連結</Button>
        </form>

        <div className="text-center mt-8">
          <Link
            to="/login"
            className="text-sm text-slate-500 hover:text-primary transition font-medium"
          >
            返回登入頁面
          </Link>
        </div>
      </div>
    </div>
  );
}
