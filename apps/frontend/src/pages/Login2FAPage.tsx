import { useState, SubmitEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { login2FAMutation } from '../queries/authQueries';

export default function Login2FAPage() {
  const [totpCode, setTotpCode] = useState('');
  const { error } = useToast();

  const { mutate: verify2FA, isPending } = useMutation({
    ...login2FAMutation(),
    onSuccess: () => {
      globalThis.location.href = '/profile';
    },
    onError: (err) => error(err.response?.data?.message || '驗證失敗'),
  });

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    verify2FA({ totpCode });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">雙重驗證</h2>
        <p className="text-slate-500 mb-8">
          請打開 Google Authenticator 輸入 6 位數驗證碼
        </p>

        <form onSubmit={handleSubmit}>
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
          <Button loading={isPending}>驗證並登入</Button>
        </form>
      </div>
    </div>
  );
}
