import multer from 'multer';
import { existsSync, mkdirSync } from '../utils/fsHelper';
import { extname } from '../utils/pathHelper';

const uploadDir = 'public/uploads/avatars';

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// 設定磁碟儲存引擎 (DiskStorage)
const storage = multer.diskStorage({
  // 決定檔案要放在哪裡
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  // 決定檔案的名稱 (避免檔名重複覆蓋)
  filename: function (req, file, cb) {
    // 產生唯一後綴：時間戳記 + 隨機數
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // 取得原始檔案的副檔名 (例如 .jpg, .png)
    const ext = extname(file.originalname);
    // 最終檔名長這樣：avatar-1631234567890-123456789.jpg
    cb(null, 'avatar-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允許上傳圖片檔案！'), false);
  }
};

// (限制檔案大小為 5MB)
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
