import passport from 'passport';
import * as AuthService from '../services/authService.js';
import { sanitizeUser } from '../utils/formatters.js';
import { sendSuccess } from '../utils/response.js';
import AppError from '../utils/AppError.js';
import { clearAllAuthCookies } from '../utils/cookieHelper.js';

export const register = async (req, res) => {
  const { username, password, name } = req.body;
  const newUser = await AuthService.registerUser(username, password, name);
  sendSuccess(res, 201, { user: sanitizeUser(newUser) }, '註冊成功');
};

export const login = (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) return next(err);
    if (!user) return next(new AppError(info?.message || '登入失敗', 401));

    if (user.twoFactorAuth?.isEnabled && !user._skip2FA) {
      req.session.tempUserId = user.id;

      // 確保 Session 已經寫入記憶體/資料庫後再回傳前端
      return req.session.save((err) => {
        if (err) return next(err);
        return sendSuccess(res, 200, { require2FA: true }, '請輸入 2FA 驗證碼');
      });
    }

    req.login(user, (err) => {
      if (err) return next(err);

      return sendSuccess(res, 200, { user: sanitizeUser(user) }, '登入成功');
    });
  })(req, res, next);
};

export const login2FA = async (req, res, next) => {
  const { totpCode } = req.body;

  const tempUserId = req.session.tempUserId;
  if (!tempUserId) {
    throw new AppError('缺少驗證資訊或驗證時效已過', 400);
  }

  const user = await AuthService.verify2FALogin(tempUserId, totpCode);

  req.login(user, (err) => {
    if (err) return next(err);

    // 登入成功後，把臨時的暫存欄位清空，避免佔用空間
    delete req.session.tempUserId;

    sendSuccess(res, 200, { user: sanitizeUser(user) }, '登入成功');
  });
};

export const logout = async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      clearAllAuthCookies(res);
      sendSuccess(res, 200, {}, '登出成功');
    });
  });
};

export const forgotPassword = async (req, res) => {
  const { username } = req.body;
  await AuthService.processForgotPassword(username);

  // 無論帳號是否存在，為了資安皆回傳相同的成功訊息
  sendSuccess(res, 200, {}, '若帳號存在，重設密碼的連結已寄出');
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  await AuthService.processResetPassword(token, newPassword);
  sendSuccess(res, 200, {}, '密碼重設成功，請使用新密碼登入！');
};

export const setup2FA = async (req, res) => {
  const { secret, qrCodeImage } = await AuthService.setupUser2FA(
    req.user.id,
    req.user.username,
  );
  sendSuccess(res, 200, { qrCodeImage, secret });
};

export const verify2FA = async (req, res) => {
  const { token } = req.body;
  await AuthService.verifyAndEnable2FA(req.user.id, token);
  sendSuccess(res, 200, {}, '2FA 雙重驗證已成功啟用！');
};

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'], // 我們要跟 Google 拿的資料
});

// 使用者在 Google 按下同意後，Google 會把人導向回這支 API
export const googleCallback = (req, res, next) => {
  passport.authenticate('google', async (err, user) => {
    if (err || !user) {
      console.error('🚨 [Google OAuth 系統錯誤]:', err);

      // 登入失敗，導回前端的登入頁面並帶上錯誤訊息
      return res.redirect(
        'http://localhost:5173/login?error=google_login_failed',
      );
    }

    req.login(user, (err) => {
      if (err) return next(err);

      return res.redirect('http://localhost:5173/profile');
    });
  })(req, res, next);
};
