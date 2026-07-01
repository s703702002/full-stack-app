import { useState, SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { forgotPasswordMutation } from '../queries/authQueries';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const { success, error } = useToast();
  const { t } = useTranslation();

  const { mutate: forgotPassword, isPending } = useMutation({
    ...forgotPasswordMutation(),
    onSuccess: () => success('若帳號存在，重設連結已發送'),
    onError: (err) => error(err.response?.data?.message || '發送失敗'),
  });

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    forgotPassword({ username });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          {t('forgot-password.title')}
        </h2>
        <p className="text-slate-500 mb-8">{t('forgot-password.subtitle')}</p>

        <form onSubmit={handleSubmit}>
          <InputField
            label={t('input-label.username')}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder={t('input-placeholder.username')}
          />
          <div className="mb-8"></div>
          <Button loading={isPending}>{t('link.send-reset-link')}</Button>
        </form>

        <div className="text-center mt-8">
          <Link
            to="/login"
            className="text-sm text-slate-500 hover:text-primary transition font-medium"
          >
            {t('forgot-password.back-to-login')}
          </Link>
        </div>
      </div>
    </div>
  );
}
