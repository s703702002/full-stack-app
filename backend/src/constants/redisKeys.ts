export const PREFIX = {
  SESSION: 'my-app-session:',
  RATE_LIMIT_AUTH: 'rate-limit:auth:',
  RATE_LIMIT_API: 'rate-limit:api:',
  RATE_LIMIT_ACCOUNT: 'rate-limit:account:',
  REFRESH_TOKEN: 'refresh-token:',
  USER_PERMISSION: 'user_perms:',
  RESET_PWD: 'reset:',
};

export const getAccountRateLimitKey = (username: string) =>
  `${PREFIX.RATE_LIMIT_ACCOUNT}${username}`;

export const getRefreshTokenKey = (userId: string) =>
  `${PREFIX.REFRESH_TOKEN}${userId}`;

export const getUserPermissionKey = (userId: string) =>
  `${PREFIX.USER_PERMISSION}${userId}`;

export const getResetPasswordKey = (token: string) =>
  `${PREFIX.RESET_PWD}${token}`;
