import { Link } from 'react-router-dom';

export default function SecurityCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800">帳號安全與設定</h3>
      </div>

      <div className="divide-y divide-slate-100">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-medium text-slate-900">
              雙重驗證 (2FA)
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              啟用 Authenticator 驗證碼，為您的帳號增加額外的安全保護層。
            </p>
          </div>
          <Link
            to="2fa-setup"
            className="shrink-0 text-center px-5 py-2 bg-slate-50 border border-slate-200 text-primary hover:bg-slate-100 font-medium rounded-lg transition"
          >
            設定 2FA
          </Link>
        </div>
      </div>
    </div>
  );
}
