import { describe, it, expect, vi } from 'vitest';
import { createFileFilter } from './uploadFactory.js';
import AppError from '../utils/AppError.js';
import { createMockFile, createMockRequest } from '../test/helper.js';

describe('createFileFilter', () => {
  describe('avatar filter (only image/)', () => {
    const avatarFilter = createFileFilter(['image/'], '只允許上傳圖片檔案');

    it('如果上傳 JPG 圖片，應該回傳 null 與 true', () => {
      const req = createMockRequest();
      const file = createMockFile({
        mimetype: 'image/jpeg',
        originalname: 'avatar.jpg',
      });
      const cb = vi.fn();

      avatarFilter(req, file, cb);

      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('如果上傳 PDF，應該拋出 400 AppError', () => {
      const req = createMockRequest();
      const file = createMockFile({
        mimetype: 'application/pdf',
        originalname: 'hacker.pdf',
      });
      const cb = vi.fn();

      avatarFilter(req, file, cb);

      const [errorArg] = cb.mock.calls[0];
      expect(errorArg).toBeInstanceOf(AppError);
      expect(errorArg.message).toBe('只允許上傳圖片檔案');
      expect(errorArg.statusCode).toBe(400);
    });
  });

  describe('media filter (image/ + video/)', () => {
    const mediaFilter = createFileFilter(
      ['image/', 'video/'],
      '只允許上傳圖片 (image) 或影片 (video) 檔案',
    );

    it('如果上傳 MP4 影片，應該回傳 null 與 true', () => {
      const req = createMockRequest();
      const file = createMockFile({
        mimetype: 'video/mp4',
        originalname: 'clip.mp4',
      });
      const cb = vi.fn();

      mediaFilter(req, file, cb);

      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('如果上傳純文字檔，應該拋出 400 AppError', () => {
      const req = createMockRequest();
      const file = createMockFile({
        mimetype: 'text/plain',
        originalname: 'script.txt',
      });
      const cb = vi.fn();

      mediaFilter(req, file, cb);

      const [errorArg] = cb.mock.calls[0];
      expect(errorArg).toBeInstanceOf(AppError);
      expect(errorArg.statusCode).toBe(400);
    });
  });
});
