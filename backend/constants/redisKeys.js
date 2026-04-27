const PREFIX = {
  SESSION: 'my-app-session:',
  RATE_LIMIT_AUTH: 'rate-limit:auth:',
  RATE_LIMIT_API: 'rate-limit:api:',
  RATE_LIMIT_ACCOUNT: 'rate-limit:account:',
  REFRESH_TOKEN: 'refresh-token:',
};
const getAccountRateLimitKey = (username) =>
  `${PREFIX.RATE_LIMIT_ACCOUNT}${username}`;
const getRefreshTokenKey = (userId) => `${PREFIX.REFRESH_TOKEN}${userId}`;

export { PREFIX, getAccountRateLimitKey, getRefreshTokenKey };
