import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import useNotificationListener from '../hooks/useNotificationListener';

export default function ProtectedRoute() {
  const { user, isInitialized } = useAuth();
  const location = useLocation();
  useNotificationListener();

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-slate-500">驗證身分中...</span>
      </div>
    );
  }

  if (isInitialized && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
