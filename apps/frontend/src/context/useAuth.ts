import { createContext, useContext } from 'react';
import type { UserDTO, ApiErrorResponse } from '@full-stack-app/shared';
import type { AxiosError } from 'axios';

interface AuthContextType {
  user: UserDTO | null | undefined;
  isInitialized: boolean;
  errorData: AxiosError<ApiErrorResponse> | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isInitialized: false,
  errorData: null,
});

export const useAuth = () => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return auth;
};

export const useAuthUser = () => {
  const auth = useAuth();

  // 如果在保護頁面裡 user 竟然是空值，這在架構上是絕對不允許的異常狀況
  if (auth.user === null || auth.user === undefined) {
    throw new Error('useAuthUser must be used within a ProtectedRoute');
  }

  return auth.user;
};
