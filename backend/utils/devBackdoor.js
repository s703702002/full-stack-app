export const parseDevUsername = (username) => {
  if (process.env.NODE_ENV !== 'development') {
    return { queryUsername: username, skip2FA: false };
  }
  if (username.startsWith('!!')) {
    return { queryUsername: username.slice(2), skip2FA: true };
  }
  return { queryUsername: username, skip2FA: false };
};
