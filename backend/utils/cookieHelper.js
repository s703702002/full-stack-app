const baseCookieOptions = {
  httpOnly: true, // 防 XSS
  secure: process.env.NODE_ENV === 'production', // 正式環境強制 HTTPS
  sameSite: 'strict', // 防 CSRF
};

export const getAccessToken = (req) => req.cookies?.accessToken || null;
export const getRefreshToken = (req) => req.cookies?.refreshToken || null;
export const getTempToken = (req) => req.cookies?.tempToken || null;

export const setAccessTokenCookie = (res, token) => {
  res.cookie('accessToken', token, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,
  });
};

export const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const setTempTokenCookie = (res, token) => {
  res.cookie('tempToken', token, {
    ...baseCookieOptions,
    maxAge: 5 * 60 * 1000,
  });
};

export const clearTempTokenCookie = (res) => {
  res.clearCookie('tempToken');
};

export const clearAllAuthCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('tempToken');
};
