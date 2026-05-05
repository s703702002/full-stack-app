export const PREFIX = {
  SESSION: 'my-app-session:',
  RATE_LIMIT_AUTH: 'rate-limit:auth:',
  RATE_LIMIT_API: 'rate-limit:api:',
  RATE_LIMIT_ACCOUNT: 'rate-limit:account:',
  REFRESH_TOKEN: 'refresh-token:',
  USER_PERMISSION: 'user_perms:',
};

export const getAccountRateLimitKey = (username) =>
  `${PREFIX.RATE_LIMIT_ACCOUNT}${username}`;

export const getRefreshTokenKey = (userId) =>
  `${PREFIX.REFRESH_TOKEN}${userId}`;

export const getUserPermissionKey = (userId) =>
  `${PREFIX.USER_PERMISSION}${userId}`;
