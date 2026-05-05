import express from 'express';
import {
  getMe,
  getAllUsers,
  updateUserRole,
  updateProfile,
} from '../controllers/userController.js';
import { checkAuthenticated } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/rbac.js';
import { apiLimiter } from '../middlewares/rateLimiter.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import { updateProfileSchema } from '../validators/userValidator.js';

const router = express.Router();

router.use(checkAuthenticated);

router.get('/me', apiLimiter, getMe);
router.get('/', apiLimiter, getAllUsers);
router.put('/:id/role', checkPermission('user:manage'), updateUserRole);
router.put(
  '/profile',
  upload.single('avatar'),
  validate(updateProfileSchema),
  updateProfile,
);

export default router;
