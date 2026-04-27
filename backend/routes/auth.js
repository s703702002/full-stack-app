import express from 'express';
import {
  login,
  login2FA,
  register,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  setup2FA,
  verify2FA,
} from '../controllers/authController.js';
import { checkAuthenticated } from '../middlewares/auth.js';
import { accountAuthLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validateMiddleware.js';
import {
  registerSchema,
  login2FASchema,
  loginSchema,
  verify2FASchema,
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/login', validate(loginSchema), accountAuthLimiter, login);
router.post('/login-2fa', validate(login2FASchema), login2FA);
router.post('/register', validate(registerSchema), register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh', refreshToken);

// 只有這三個需要登入
router.post('/logout', checkAuthenticated, logout);
router.post('/2fa/setup', checkAuthenticated, setup2FA);
router.post(
  '/2fa/verify',
  validate(verify2FASchema),
  checkAuthenticated,
  verify2FA,
);

export default router;
