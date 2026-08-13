import { createUploader } from '../utils/uploadFactory.js';

export const mediaUpload = createUploader({
  folder: 'medias',
  filePrefix: 'media',
  allowedMimeTypes: ['image/', 'video/'],
  maxFileSizeMB: 5,
  errorMessage: '只允許上傳圖片 (image) 或影片 (video) 檔案',
});
