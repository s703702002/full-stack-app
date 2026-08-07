// oxlint-disable typescript/no-explicit-any
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mediaService } from './mediaService.js';
import MediaModel from '../models/mediaModel.js';

vi.mock('../models/mediaModel');
vi.mock('../utils/s3Utils', () => ({
  deleteFromS3: vi.fn(),
  generatePresignedGetUrl: vi
    .fn()
    .mockResolvedValue('http://mock-s3-url.com/file'),
}));

describe('mediaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserMedias', () => {
    it('應該返回格式化後的媒體列表與分頁資訊', async () => {
      const mockMedias = [
        {
          id: 'media-1',
          userId: 'user-1',
          title: '美景照片',
          description: '好漂亮的風景',
          url: 'http://example.com/img1.jpg',
          fileKey: 'medias/img1.jpg',
          mediaType: 'IMAGE' as const,
          mimeType: 'image/jpeg',
          size: 1024,
          createdAt: new Date('2026-08-07T00:00:00Z'),
        },
      ];

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

  describe('deleteMedia', () => {
    it('若非本人刪除應拋出 403 錯誤', async () => {
      vi.mocked(MediaModel.findById).mockResolvedValue({
        id: 'media-1',
        userId: 'owner-user',
        fileKey: 'medias/img1.jpg',
      } as any);

      await expect(
        mediaService.deleteMedia('other-user', 'media-1'),
      ).rejects.toThrow('無權限刪除此媒體項目');
    });

    it('若找到該媒體且為本人，應調用刪除 API', async () => {
      vi.mocked(MediaModel.findById).mockResolvedValue({
        id: 'media-1',
        userId: 'owner-user',
        fileKey: 'medias/img1.jpg',
      } as any);
      vi.mocked(MediaModel.deleteById).mockResolvedValue({} as any);

      const result = await mediaService.deleteMedia('owner-user', 'media-1');

      expect(MediaModel.deleteById).toHaveBeenCalledWith('media-1');
      expect(result.success).toBe(true);
    });
  });
});
