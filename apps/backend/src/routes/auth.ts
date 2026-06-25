import express from 'express';
import {
  login,
  login2FA,
  register,
  forgotPassword,
  resetPassword,
  logout,
  setup2FA,
  verify2FA,
  googleAuth,
  googleCallback,
} from '../controllers/authController.js';
import { checkAuthenticated } from '../middlewares/auth.js';
import { accountAuthLimiter, apiLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validateMiddleware.js';
import {
  registerSchema,
  login2FASchema,
  loginSchema,
  verify2FASchema,
} from '@full-stack-app/shared';

const router = express.Router();

router.post('/login', validate(loginSchema), accountAuthLimiter, login);
router.post('/login-2fa', validate(login2FASchema), login2FA);
router.post('/register', validate(registerSchema), register);
router.post('/forgot-password', apiLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

router.get('/2fa/setup', checkAuthenticated, setup2FA);
router.post('/logout', checkAuthenticated, logout);
router.post(
  '/2fa/verify',
  validate(verify2FASchema),
  checkAuthenticated,
  verify2FA,
);

export default router;
