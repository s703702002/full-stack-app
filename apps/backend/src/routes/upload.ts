import express from 'express';
import { checkAuthenticated } from '../middlewares/auth.js';
import {
  getPresignedGetUrl,
  getPresignedPutUrl,
} from '../controllers/uploadController.js';
import validate from '../middlewares/validateMiddleware.js';
import { presignedUrlSchema } from '@full-stack-app/shared';

const router = express.Router();

router.use(checkAuthenticated);

router.post('/presigned-url', validate(presignedUrlSchema), getPresignedPutUrl);
router.get('/presigned-url/:key', getPresignedGetUrl);

export default router;
