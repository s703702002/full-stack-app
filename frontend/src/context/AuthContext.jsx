import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './useAuth';
import { privateApi } from '../api';
import useApiAction from '../hooks/useApiAction';

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const { execute, data, errorData } = useApiAction(
    () => privateApi.get('/api/users/me'),
    {
      successToast: false,
      errorToast: false,
    },
  );

  useEffect(() => {
    const initAuth = async () => {
      await execute();
      setIsInitialized(true);
    };

    initAuth();
  }, [execute, navigate]);

  return (
    <AuthContext.Provider
      value={{ user: data?.data?.user, isInitialized, errorData: errorData }}
    >
      {children}
    </AuthContext.Provider>
  );
};
