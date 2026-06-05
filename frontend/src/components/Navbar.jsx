import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/useAuth';
import { privateApi } from '../api';
import { useToast } from '../hooks/useToast';
import { userKeys } from '../queries/userQueries';
import Avatar from './Avatar';

export default function Navbar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { error } = useToast();

  const canManageUsers =
    user?.roleName === 'superadmin' || user?.roleName === 'admin';

  const { mutate: logout } = useMutation({
    mutationFn: () => privateApi.post('/api/auth/logout'),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: userKeys.me() });
      globalThis.location.href = '/login';
    },
    onError: () => error('登出失敗，請稍後再試'),
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
              權限管理
            </Link>
          )}

          {/* 狀態分隔線 (選用：讓選單跟使用者區塊稍微隔開) */}
          {user && <div className="h-4 w-px bg-slate-200 mx-2"></div>}

          {/* 使用者專屬區塊 */}
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/friend-requests"
                className="hover:text-primary transition"
              >
                好友管理
              </Link>
              <Link to="/profile" className="hover:text-primary transition">
                個人設定
              </Link>

              <button
                onClick={logout}
                className="text-slate-500 hover:text-red-600 transition"
              >
                登出
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
                登入
              </Link>
              <Link
                to="/register"
                className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition shadow-sm"
              >
                註冊
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
