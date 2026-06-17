import { useLocation } from 'react-router-dom';

interface BannedPageState {
  reason?: string;
  expiresAt?: string | null;
}

export default function BannedPage() {
  const location = useLocation();
  const state = location.state as BannedPageState | undefined;
  const reason = state?.reason ?? '違反使用條款';
  const expiresAt = state?.expiresAt;

  return (
    <div className="flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">帳號已被停用</h1>
        <p className="text-slate-500 mb-4">{`原因：${reason}`}</p>
        {expiresAt ? (
          <p className="text-slate-400 text-sm">
            停用至：{new Date(expiresAt).toLocaleString()}
          </p>
        ) : (
          <p className="text-slate-400 text-sm">此帳號已被永久停用</p>
        )}
      </div>
    </div>
  );
}
