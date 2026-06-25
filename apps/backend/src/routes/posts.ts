import express from 'express';
import {
  getPostLikers,
  createPost,
  toggleLikePost,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { checkAuthenticated } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/rbac.js';
import validate from '../middlewares/validateMiddleware.js';
import { createPostSchema, updatePostSchema } from '@full-stack-app/shared';

const router = express.Router();

router.use(checkAuthenticated);

router.get('/:id/likes', getPostLikers);
router.post(
  '/',
  validate(createPostSchema),
  checkPermission('post:create'),
  createPost,
);
router.post('/:id/like', toggleLikePost);
router.put(
  '/:id',
  validate(updatePostSchema),
  checkPermission(['post:edit:own', 'post:edit:any']),
  updatePost,
);
router.delete(
  '/:id',
  checkPermission(['post:delete:own', 'post:delete:any']),
  deletePost,
);

export default router;
