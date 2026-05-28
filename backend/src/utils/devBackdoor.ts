import { env } from '../utils/validateEnv.js';

export const parseDevUsername = (username: string) => {
  if (env.NODE_ENV !== 'development') {
    return { queryUsername: username, skip2FA: false };
  }
  if (username.startsWith('!!')) {
    return { queryUsername: username.slice(2), skip2FA: true };
  }
  return { queryUsername: username, skip2FA: false };
};
