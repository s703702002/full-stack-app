import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Avatar from './Avatar';
import useApiAction from '../hooks/useApiAction';
import { privateApi } from '../api';

export default function Navbar() {
  const { user } = useAuth();
  const { execute: logoutApi } = useApiAction(() =>
    privateApi.post('/api/auth/logout'),
  );

  const canManageUsers =
    user?.roleName === 'superadmin' || user?.roleName === 'admin';

  const handleApiLogout = async () => {
    const { success } = await logoutApi();
    if (success) {
      globalThis.location.href = '/login';
    }
  };

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* 左側 Logo */}
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
          {/* 一般全域連結 */}
          <Link to="/message-board" className="hover:text-primary transition">
            留言板
          </Link>

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
              <Link to="/profile" className="hover:text-primary transition">
                個人設定
              </Link>

              <button
                onClick={handleApiLogout}
                className="text-slate-500 hover:text-red-600 transition"
              >
                登出
              </button>

              {/* 🚀 把大頭貼變成前往 Profile 的捷徑，這非常符合現代 UX 直覺 */}
              <Link to="/profile" className="block" title="前往個人主頁">
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
