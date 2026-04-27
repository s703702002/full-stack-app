import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Navbar() {
  const { user } = useAuth();

  const canManageUsers =
    user?.roleName === 'superadmin' || user?.roleName === 'admin';

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
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/message-board" className="hover:text-primary transition">
            留言板
          </Link>
          {canManageUsers ? (
            <Link
              to="/admin/users"
              className="text-slate-600 hover:text-purple-600 font-medium"
            >
              權限管理
            </Link>
          ) : null}
          {user ? (
            <>
              <Link to="/profile" className="hover:text-primary transition">
                個人主頁
              </Link>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
                {user.name[0].toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary transition">
                登入
              </Link>
              <Link
                to="/register"
                className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
              >
                註冊
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
