import { createContext, useContext } from 'react';

export const AuthContext = createContext({
  user: {},
  isInitialized: false,
  errorData: {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};
