import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mediaService } from './mediaService.js';
import MediaModel from '../models/mediaModel.js';
import type { Media } from '../generated/client.js';
import { createMockFile } from '../test/helper.js';

vi.mock('../models/mediaModel.js');
vi.mock('../utils/s3Utils.js', () => ({
  deleteFromS3: vi.fn(),
  generatePresignedGetUrl: vi
    .fn()
    .mockResolvedValue('http://mock-s3-url.com/file'),
}));

const createMockMedia = (overrides: Partial<Media> = {}): Media => ({
  id: 'media-1',
  userId: 'user-1',
  title: '美景照片',
  description: '好漂亮的風景',
  fileKey: 'medias/img1.jpg',
  mediaType: 'IMAGE',
  mimeType: 'image/jpeg',
  size: 1024,
  createdAt: new Date('2026-08-07T00:00:00Z'),
  ...overrides,
});

describe('mediaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserMedias', () => {
    it('應該返回格式化後的媒體列表與分頁資訊', async () => {
      const mockMedias: Media[] = [createMockMedia()];

      vi.mocked(MediaModel.findAllByUserId).mockResolvedValue({
        medias: mockMedias,
        total: 1,
      });

      const result = await mediaService.getUserMedias('user-1', 1, 10);

      expect(MediaModel.findAllByUserId).toHaveBeenCalledWith(
        'user-1',
        1,
        10,
        undefined,
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('media-1');
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('createMediaFromFile', () => {
    const mockFile = createMockFile({
      key: 'medias/test.jpg',
      mimetype: 'image/jpeg',
      size: 2048,
    });

    it('已達 5 個媒體上限時應清理 S3 檔案並拋出 400 錯誤', async () => {
      const { deleteFromS3 } = await import('../utils/s3Utils.js');
      vi.mocked(MediaModel.countByUserId).mockResolvedValue(5);

      await expect(
        mediaService.createMediaFromFile('user-1', mockFile, '標題', '描述'),
      ).rejects.toThrow('已達上傳上限（最多 5 個媒體項目）');

      expect(deleteFromS3).toHaveBeenCalledWith('medias/test.jpg');
      expect(MediaModel.createMedia).not.toHaveBeenCalled();
    });

    it('未達 5 個媒體上限時應正常建立媒體項目', async () => {
      vi.mocked(MediaModel.countByUserId).mockResolvedValue(4);
      vi.mocked(MediaModel.createMedia).mockResolvedValue(
        createMockMedia({
          id: 'media-5',
          title: '標題',
          description: '描述',
          fileKey: 'medias/test.jpg',
          size: 2048,
        }),
      );

      const result = await mediaService.createMediaFromFile(
        'user-1',
        mockFile,
        '標題',
        '描述',
      );

      expect(MediaModel.createMedia).toHaveBeenCalled();
      expect(result.id).toBe('media-5');
    });
  });

  describe('deleteMedia', () => {
    it('若非本人刪除應拋出 403 錯誤', async () => {
      vi.mocked(MediaModel.findById).mockResolvedValue(
        createMockMedia({
          id: 'media-1',
          userId: 'owner-user',
        }),
      );

      await expect(
        mediaService.deleteMedia('other-user', 'media-1'),
      ).rejects.toThrow('無權限刪除此媒體項目');
    });

    it('若找到該媒體且為本人，應調用刪除 API', async () => {
      const mockMedia = createMockMedia({
        id: 'media-1',
        userId: 'owner-user',
      });
      vi.mocked(MediaModel.findById).mockResolvedValue(mockMedia);
      vi.mocked(MediaModel.deleteById).mockResolvedValue(mockMedia);

      const result = await mediaService.deleteMedia('owner-user', 'media-1');

      expect(MediaModel.deleteById).toHaveBeenCalledWith('media-1');
      expect(result.success).toBe(true);
    });
  });
});
