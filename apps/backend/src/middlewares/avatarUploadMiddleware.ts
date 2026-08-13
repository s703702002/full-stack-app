import { createUploader } from '../utils/uploadFactory.js';

export const avatarUpload = createUploader({
  folder: 'avatars',
  filePrefix: 'avatar',
  allowedMimeTypes: ['image/'],
  maxFileSizeMB: 5,
  errorMessage: '只允許上傳圖片檔案',
});
