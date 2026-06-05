import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1, '姓名為必填欄位'),
});

export const createUserBanSchema = z.object({
  reason: z.string().min(1, '原因為必填').max(500, '原因不能超過 500 字'),
  durationMinutes: z.number().int().min(0, '時長不能為負數'),
});
