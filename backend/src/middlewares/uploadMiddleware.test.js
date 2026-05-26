import { describe, it, expect, vi } from 'vitest';
import { fileFilter } from './uploadMiddleware.js';
import AppError from '../utils/AppError.js';

vi.mock('multer-s3');

describe('Upload Middleware - fileFilter', () => {
  it('如果上傳 JPG 圖片 (image/jpeg)，應該回傳 null 與 true (允許上傳)', () => {
    // 安排 (Arrange)
    const req = {}; // filter 裡沒用到 req，給個空物件即可
    const file = { mimetype: 'image/jpeg', originalname: 'avatar.jpg' };
    const cb = vi.fn();

    // 執行 (Act)
    fileFilter(req, file, cb);

    // 驗證 (Assert)
    // 確保留下了沒有錯誤 (null)，並且放行 (true)
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('如果上傳 PNG 圖片 (image/png)，應該回傳 null 與 true (允許上傳)', () => {
    const req = {};
    const file = { mimetype: 'image/png', originalname: 'logo.png' };
    const cb = vi.fn();

    fileFilter(req, file, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('如果上傳 PDF (application/pdf)，應該拋出 400 AppError 並回傳 false (拒絕上傳)', () => {
    // 安排
    const req = {};
    const file = { mimetype: 'application/pdf', originalname: 'hacker.pdf' };
    const cb = vi.fn();

    // 執行
    fileFilter(req, file, cb);

    // 驗證
    expect(cb).toHaveBeenCalledTimes(1);

    // cb.mock.calls[0] 代表第一次呼叫的參數陣列：[error, acceptFile]
    const [errorArg] = cb.mock.calls[0];

    // 1. 驗證第一個參數是不是我們自訂的 AppError 實例
    expect(errorArg).toBeInstanceOf(AppError);
    expect(errorArg.message).toBe('只允許上傳圖片檔案');
    expect(errorArg.statusCode).toBe(400);
  });

  it('如果上傳純文字檔 (text/plain)，應該拋出 400 AppError', () => {
    const req = {};
    const file = { mimetype: 'text/plain', originalname: 'script.txt' };
    const cb = vi.fn();

    fileFilter(req, file, cb);

    const [errorArg] = cb.mock.calls[0];
    expect(errorArg).toBeInstanceOf(AppError);
    expect(errorArg.statusCode).toBe(400);
  });
});
