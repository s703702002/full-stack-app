import { useState, SubmitEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { registerMutation, RegisterPayload } from '../queries/authQueries';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from '@full-stack-app/shared';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [formData, setFormData] = useState<RegisterPayload>({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const { mutate: register, isPending } = useMutation({
    ...registerMutation(),
    onSuccess: () => {
      success('註冊成功，將為您跳轉至登入頁面');
      setTimeout(() => navigate('/login'), 2000);
    },
    onError: (err: AxiosError<ApiErrorResponse>) =>
      error(err.response?.data?.message || '註冊失敗'),
  });

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      error('密碼不一致');
      return;
    }
    register(formData);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">註冊帳號</h2>
        <p className="text-slate-500 mb-8">加入我們，開啟您的專屬體驗</p>

        <form onSubmit={handleSubmit}>
          <InputField
            label="姓名 (Name)"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="帳號 (Username)"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="密碼 (Password)"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="確認密碼"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
          <div className="mb-8"></div>
          <Button loading={isPending}>建立帳號</Button>
        </form>

        <p className="text-center text-slate-600 mt-8 text-sm">
          已經有帳號了？{' '}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            點此登入
          </Link>
        </p>
      </div>
    </div>
  );
}
