export const PREFIX = {
  SESSION: 'my-app-session:',
  RATE_LIMIT_AUTH: 'rate-limit:auth:',
  RATE_LIMIT_API: 'rate-limit:api:',
  RATE_LIMIT_ACCOUNT: 'rate-limit:account:',
  REFRESH_TOKEN: 'refresh-token:',
  USER_PERMISSION: 'user_perms:',
  RESET_PWD: 'reset:',
  ONLINE: 'online:',
};

export const accountRateLimitKey = (username: string) =>
  `${PREFIX.RATE_LIMIT_ACCOUNT}${username}`;

export const refreshTokenKey = (userId: string) =>
  `${PREFIX.REFRESH_TOKEN}${userId}`;

export const resetPasswordKey = (token: string) =>
  `${PREFIX.RESET_PWD}${token}`;

export const onlineKey = (userId: string) => `online:${userId}`;
