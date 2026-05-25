import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleLike } from './postService.js';
import PostModel from '../models/postModel.js';
import PostLikeModel from '../models/postLikeModel.js';
import UserModel from '../models/userModel.js';
import * as sseManager from '../utils/sseManager.js';
import AppError from '../utils/AppError.js';

vi.mock('../config/redis.js');
vi.mock('../models/postModel.js');
vi.mock('../models/postLikeModel.js');
vi.mock('../models/userModel.js');
vi.mock('../utils/sseManager.js');

describe('PostService - toggleLike', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('如果貼文不存在，應該要拋出 404 錯誤', async () => {
    // 安排 (Arrange)：設定 PostModel.findById 回傳 null (找不到貼文)
    PostModel.findById.mockResolvedValue(null);

    // 執行與驗證 (Act & Assert)：預期這支 function 會爆炸，並拋出特定錯誤
    await expect(toggleLike(1, 999)).rejects.toThrow(AppError);
    await expect(toggleLike(1, 999)).rejects.toThrow('留言不存在');
  });

  it('如果已經按過讚，應該要刪除讚，且【不】發送通知，並回傳 false', async () => {
    // 安排：貼文存在，且之前已經按過讚了
    PostModel.findById.mockResolvedValue({ id: 1, userId: 2 });
    PostLikeModel.findUserLike.mockResolvedValue({ userId: 1, postId: 1 });

    // 執行
    const result = await toggleLike(1, 1);

    // 驗證
    expect(result).toBe(false); // 應該回傳 isLiked: false
    expect(PostLikeModel.deleteLike).toHaveBeenCalledWith(1, 1); // 確保有呼叫刪除
    expect(PostLikeModel.createLike).not.toHaveBeenCalled(); // 確保沒呼叫新增
    expect(sseManager.sendNotification).not.toHaveBeenCalled(); // 確保沒亂發通知
  });

  it('如果是第一次按讚，應該要新增讚，且【要】發送通知，並回傳 true', async () => {
    // 安排：貼文存在 (作者是 2 號)，從未按過讚，按讚者 (1 號) 叫 Stanley
    PostModel.findById.mockResolvedValue({ id: 1, userId: 2 });
    PostLikeModel.findUserLike.mockResolvedValue(null);
    UserModel.findById.mockResolvedValue({ id: 1, name: 'Stanley' });

    // 執行
    const result = await toggleLike(1, 1);

    // 驗證
    expect(result).toBe(true);
    expect(PostLikeModel.createLike).toHaveBeenCalledWith(1, 1);

    expect(sseManager.sendNotification).toHaveBeenCalledWith(
      2,
      expect.objectContaining({
        type: 'NEW_LIKE',
        message: 'Stanley 剛剛對你的留言按了讚！',
      }),
    );
  });
});
