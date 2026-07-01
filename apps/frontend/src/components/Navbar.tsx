import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/useAuth';
import { useToast } from '../hooks/useToast';
import { userKeys } from '../queries/userQueries';
import { Avatar } from '@full-stack-app/ui';
import { logoutMutation } from '../queries/authQueries';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { error } = useToast();
  const { t, i18n } = useTranslation();

  const canManageUsers =
    user?.roleName === 'superadmin' || user?.roleName === 'admin';

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'zh-TW' ? 'en-US' : 'zh-TW';
    i18n.changeLanguage(nextLng);
  };

  const { mutate: logout } = useMutation({
    ...logoutMutation(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: userKeys.me() });
      globalThis.location.href = '/login';
    },
    onError: (err) =>
      error(err.response?.data?.message || '登出失敗，請稍後再試'),
  });

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold text-slate-950 flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-mono">
            M
          </span>
        </Link>

        {/* 右側選單 */}
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          {canManageUsers && (
            <Link
              to="/admin/users"
              className="text-slate-600 hover:text-purple-600 transition"
            >
              {t('link.user-management')}
            </Link>
          )}

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-slate-200"
            title={
              i18n.language === 'zh-TW' ? 'Switch to English' : '切換至繁體中文'
            }
          >
            <svg
              className="w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2m4.6-4.6a9 9 0 11-13.313-1.464"
              />
            </svg>
            <span>{i18n.language === 'zh-TW' ? 'EN' : '繁中'}</span>
          </button>

          {/* 狀態分隔線 */}
          {user && <div className="h-4 w-px bg-slate-200 mx-2"></div>}

          {/* 使用者專屬區塊 */}
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/friend-requests"
                className="hover:text-primary transition"
              >
                {t('link.friend-request')}
              </Link>
              <Link to="/profile" className="hover:text-primary transition">
                {t('link.profile')}
              </Link>

              <button
                onClick={() => logout()}
                className="text-slate-500 hover:text-red-600 transition"
              >
                {t('button.sign-out')}
              </button>

              <Link
                to={`/profile/${user.id}`}
                className="block"
                title="前往個人主頁"
              >
                <Avatar
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                  className="w-10 h-10 text-lg ring-2 ring-transparent hover:ring-primary/50 transition-all cursor-pointer"
                />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-primary transition">
                {t('button.sign-in')}
              </Link>
              <Link
                to="/register"
                className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition shadow-sm"
              >
                {t('button.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
