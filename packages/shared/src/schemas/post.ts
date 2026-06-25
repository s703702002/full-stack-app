import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().min(1, '留言內容不能為空'),
  targetUserId: z.cuid2('目標使用者 ID 格式不正確'),
});

export type CreatePostBody = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  content: z.string().min(1, '留言內容不能為空'),
});

export type UpdatePostBody = z.infer<typeof updatePostSchema>;
