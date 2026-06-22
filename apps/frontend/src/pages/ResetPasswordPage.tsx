import { useState, SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { resetPasswordMutation } from '../queries/authQueries';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from '@full-stack-app/shared';
import { useRequiredParams } from '../hooks/useRequiredParams';

export default function ResetPasswordPage() {
  const token = useRequiredParams('token');
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const { success, error } = useToast();

  const {
    mutate: resetPassword,
    isPending,
    isSuccess,
  } = useMutation({
    ...resetPasswordMutation(token),
    onSuccess: () => {
      success('正在為您導向登入頁...');
      setTimeout(() => navigate('/login'), 3000);
    },
    onError: (err: AxiosError<ApiErrorResponse>) =>
      error(err.response?.data?.message || '重設失敗，連結可能已過期'),
  });

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (!token) return;
    resetPassword({ newPassword });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">設定新密碼</h2>
        <p className="text-slate-500 mb-8">請為您的帳號設定一組全新的密碼</p>

        <form onSubmit={handleSubmit}>
          <InputField
            label="輸入新密碼"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="請設定至少 6 位數密碼"
          />
          <div className="mb-8"></div>
          <Button loading={isPending} disabled={isSuccess}>
            確認修改
          </Button>
        </form>

        <div className="text-center mt-8">
          <Link
            to="/login"
            className="text-sm text-slate-500 hover:text-primary transition font-medium"
          >
            &larr; 返回登入頁面
          </Link>
        </div>
      </div>
    </div>
  );
}
