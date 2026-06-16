import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import useNotificationListener from '../hooks/useNotificationListener';

export default function ProtectedRoute() {
  const { user, isInitialized, errorData } = useAuth();
  const location = useLocation();
  useNotificationListener();

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-slate-500">驗證身分中...</span>
      </div>
    );
  }

  if (isInitialized && errorData) {
    if ((errorData as any).errorCode === 40301)
      return (
        <Navigate
          to="/banned"
          state={{
            reason: (errorData as any).reason,
            expiresAt: (errorData as any).expiresAt,
          }}
          replace
        />
      );
  }

  if (isInitialized && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
