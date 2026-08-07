import express from 'express';
import { checkAuthenticated } from '../middlewares/auth.js';
import { mediaUpload } from '../middlewares/mediaUploadMiddleware.js';
import {
  getUserMedias,
  uploadMedia,
  deleteMedia,
} from '../controllers/mediaController.js';

const router = express.Router();

// 取得特定使用者的相簿媒體 (公開或登入者皆可，也可放登入驗證)
router.get('/user/:userId', getUserMedias);

// 以下需登入
router.use(checkAuthenticated);

router.post('/', mediaUpload.single('file'), uploadMedia);
router.delete('/:id', deleteMedia);

export default router;
