import express from 'express';
import {
  getAllPosts,
  getPostLikers,
  createPost,
  toggleLikePost,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { checkAuthenticated } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/rbac.js';
import validate from '../middlewares/validateMiddleware.js';
import { createPostSchema } from '../validators/postValidator.js';

const router = express.Router();

router.use(checkAuthenticated);

router.get('/', getAllPosts);
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
  checkPermission(['post:edit:own', 'post:edit:any']),
  updatePost,
);
router.delete(
  '/:id',
  checkPermission(['post:delete:own', 'post:delete:any']),
  deletePost,
);

export default router;
