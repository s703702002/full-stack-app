import { createContext, useContext } from 'react';

export const AuthContext = createContext({
  user: {},
  isInitialized: false,
});

export const useAuth = () => {
  return useContext(AuthContext);
};
