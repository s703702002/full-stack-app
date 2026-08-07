import express from 'express';

import authRoutes from './auth.js';
import postRoutes from './posts.js';
import userRoutes from './users.js';
import notificationsRoutes from './notifications.js';
import friendshipRoutes from './friendship.js';
import uploadRoutes from './upload.js';
import mediaRoutes from './media.js';
import { checkHealth } from '../controllers/healthController.js';

const router = express.Router();

router.get('/health', checkHealth);
router.use('/api/auth', authRoutes);
router.use('/api/posts', postRoutes);
router.use('/api/users', userRoutes);
router.use('/api/notifications', notificationsRoutes);
router.use('/api/friend-requests', friendshipRoutes);
router.use('/api/upload', uploadRoutes);
router.use('/api/medias', mediaRoutes);

export default router;
