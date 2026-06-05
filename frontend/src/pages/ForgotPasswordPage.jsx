import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { publicApi } from '../api';
import { useToast } from '../hooks/useToast';
import InputField from '../components/InputField';
import Button from '../components/Button';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const { success, error } = useToast();

  const { mutate: forgotPassword, isPending } = useMutation({
    mutationFn: (payload) =>
      publicApi.post('/api/auth/forgot-password', payload).then((r) => r.data),
    onSuccess: () => success('若帳號存在，重設連結已發送'),
    onError: (err) => error(err.response?.data?.message || '發送失敗'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotPassword({ username });
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
          <Button loading={isPending}>發送重設連結</Button>
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
