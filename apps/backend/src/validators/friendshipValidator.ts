import { z } from 'zod';

export const respondFriendRequestSchema = z.object({
  action: z.enum(['accept', 'reject'], {
    error: () => 'action 必須是 accept 或 reject',
  }),
});

export type RespondFriendRequestBody = z.infer<
  typeof respondFriendRequestSchema
>;
