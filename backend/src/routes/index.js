import express from 'express';

import authRoutes from './auth.js';
import postRoutes from './posts.js';
import userRoutes from './users.js';
import notificationsRoutes from './notifications.js';
import friendshipRoutes from './friendship.js';

const router = express.Router();

router.use('/api/auth', authRoutes);
router.use('/api/posts', postRoutes);
router.use('/api/users', userRoutes);
router.use('/api/notifications', notificationsRoutes);
router.use('/api/friend-requests', friendshipRoutes);

export default router;
