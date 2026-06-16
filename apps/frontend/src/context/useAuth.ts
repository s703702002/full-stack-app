import { createContext, useContext } from 'react';
import type { UserDTO } from '@full-stack-app/shared';

interface AuthContextType {
  user: UserDTO | null | undefined;
  isInitialized: boolean;
  errorData: any;
}

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isInitialized: false,
  errorData: null,
});

export const useAuth = () => {
  return useContext(AuthContext);
};
