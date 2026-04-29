import { AuthContext } from './useAuth';
import { privateApi } from '../api';
import useApiAction from '../hooks/useApiAction';
import { useState, useEffect } from 'react';

const getMe = () => privateApi.get('/api/users/me');

export const AuthProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { execute, data } = useApiAction(getMe, {
    successToast: false,
    errorToast: false,
  });

  useEffect(() => {
    const initAuth = async () => {
      await execute();
      setIsInitialized(true);
    };

    initAuth();
  }, [execute]);

  return (
    <AuthContext.Provider value={{ user: data?.data?.user, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};
