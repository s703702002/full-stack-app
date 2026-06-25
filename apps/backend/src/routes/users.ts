import express from 'express';
import {
  getMe,
  getAllUsers,
  updateUserRole,
  updateProfile,
  getUserProfile,
  getUserTimeline,
  banUser,
  liftBanUser,
} from '../controllers/userController.js';
import { checkAuthenticated } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/rbac.js';
import { apiLimiter } from '../middlewares/rateLimiter.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import {
  createUserBanSchema,
  updateProfileSchema,
  updateRoleSchema,
} from '@full-stack-app/shared';

const router = express.Router();

router.use(checkAuthenticated);

router.get('/me', apiLimiter, getMe);
router.get('/', apiLimiter, getAllUsers);
router.get('/:id', apiLimiter, getUserProfile);
router.get('/:id/posts', apiLimiter, getUserTimeline);
router.put(
  '/:id/role',
  checkPermission('user:manage'),
  validate(updateRoleSchema),
  updateUserRole,
);
router.put(
  '/profile',
  upload.single('avatar'),
  validate(updateProfileSchema),
  updateProfile,
);
router.post(
  '/:id/ban',
  checkPermission('user:manage'),
  validate(createUserBanSchema),
  banUser,
);
router.delete('/:id/ban', checkPermission('user:manage'), liftBanUser);

export default router;
