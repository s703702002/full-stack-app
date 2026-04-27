import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1, '姓名為必填欄位'),
});
