import { useState, SubmitEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { setup2FAQuery, verify2FAMutation } from '../queries/authQueries';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from '@full-stack-app/shared';

export default function Setup2FAPage() {
  const navigate = useNavigate();
  const [totpCode, setTotpCode] = useState('');
  const { error } = useToast();

  const { data: setupData } = useQuery(setup2FAQuery());

  const { mutate: verify2FA, isPending } = useMutation({
    ...verify2FAMutation(),
    onSuccess: () => navigate('/profile'),
    onError: (err: AxiosError<ApiErrorResponse>) =>
      error(err.response?.data?.message || '驗證失敗'),
  });

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    verify2FA({ token: totpCode });
  };

  const handleTotpChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">
        設定雙重驗證 (2FA)
      </h2>

      {setupData ? (
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 text-center bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-4">
              1. 掃描 QR Code
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              請使用 Google Authenticator 掃描下方條碼
            </p>
            <img
              src={setupData.qrCodeImage}
              alt="2FA QR Code"
              className="mx-auto w-48 h-48 border-4 border-white shadow-sm rounded-lg"
            />
            <p className="text-xs text-slate-400 mt-4 break-all">
              無法掃描？請手動輸入金鑰：
              <br />
              <span className="font-mono text-slate-600 font-bold">
                {setupData.secret}
              </span>
            </p>
          </div>

          <div className="flex-1 w-full">
            <h3 className="font-semibold text-slate-700 mb-4">2. 驗證並啟用</h3>
            <p className="text-sm text-slate-500 mb-6">
              輸入 App 上顯示的 6 位數密碼以完成綁定
            </p>

            <form onSubmit={handleSubmit}>
              <InputField
                label="驗證碼"
                type="text"
                value={totpCode}
                onChange={handleTotpChange}
                required
                placeholder="123456"
              />
              <Button loading={isPending}>確認啟用</Button>
            </form>
          </div>
        </div>
      ) : (
        <p className="text-slate-500">載入中...</p>
      )}
    </div>
  );
}
