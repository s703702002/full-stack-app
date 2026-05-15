import { z } from 'zod';

export const respondFriendRequestSchema = z.object({
  action: z.enum(['accept', 'reject'], {
    errorMap: () => ({ message: 'action 必須是 accept 或 reject' }),
  }),
});
