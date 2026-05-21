import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { privateApi } from '../api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import useApiAction from '../hooks/useApiAction';

export default function Setup2FAPage() {
  const navigate = useNavigate();
  const [totpCode, setTotpCode] = useState('');
  const { data, execute: fetch2FA } = useApiAction(
    () => privateApi.post('/api/auth/2fa/setup'),
    { successToast: false },
  );
  const {
    data: verifyData,
    execute,
    loading,
  } = useApiAction((payload) =>
    privateApi.post('/api/auth/2fa/verify', payload),
  );

  useEffect(() => {
    if (verifyData?.success) {
      navigate('/profile');
    }
  }, [navigate, verifyData?.success]);

  useEffect(() => {
    fetch2FA();
  }, [fetch2FA]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute({ token: totpCode });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">
        設定雙重驗證 (2FA)
      </h2>

      {data ? (
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 text-center bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-4">
              1. 掃描 QR Code
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              請使用 Google Authenticator 掃描下方條碼
            </p>
            <img
              src={data.data.qrCodeImage}
              alt="2FA QR Code"
              className="mx-auto w-48 h-48 border-4 border-white shadow-sm rounded-lg"
            />
            <p className="text-xs text-slate-400 mt-4 break-all">
              無法掃描？請手動輸入金鑰：
              <br />
              <span className="font-mono text-slate-600 font-bold">
                {data.data.secret}
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
                onChange={(e) =>
                  setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                required
                placeholder="123456"
              />
              <Button loading={loading}>確認啟用</Button>
            </form>
          </div>
        </div>
      ) : (
        <p className="text-slate-500">載入中...</p>
      )}
    </div>
  );
}
