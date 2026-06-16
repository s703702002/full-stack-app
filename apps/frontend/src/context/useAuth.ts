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
  return useContext(AuthContext);
};
