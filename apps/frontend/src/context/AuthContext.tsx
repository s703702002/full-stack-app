import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from './useAuth';
import { getMe } from '../queries/userQueries';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading, error } = useQuery(getMe());

  return (
    <AuthContext.Provider
      value={{
        user: user,
        isInitialized: !isLoading,
        errorData: error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
