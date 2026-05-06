import multer from 'multer';
import multerS3 from 'multer-s3';
import { extname } from '../utils/pathHelper';
import { s3Client } from '../utils/s3Utils';
import AppError from '../utils/AppError';

const storage = multerS3({
  s3: s3Client,
  bucket: process.env.S3_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE, // 自動判斷是 jpg 還是 png
  key: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `avatars/avatar-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('只允許上傳圖片檔案！', 400), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
