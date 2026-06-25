import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, '帳號至少需 3 個字元')
    .max(20, '帳號不能超過 20 個字元'),
  password: z.string().min(6, '密碼至少需 6 個字元'),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, '帳號至少需 3 個字元')
      .max(20, '帳號不能超過 20 個字元'),
    password: z.string().min(6, '密碼至少需 6 個字元'),
    name: z.string().min(1, '姓名為必填'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '兩次輸入的密碼不一致',
    path: ['confirmPassword'],
  });

export type RegisterBody = z.infer<typeof registerSchema>;

export const login2FASchema = z.object({
  totpCode: z
    .string()
    .length(6, '驗證碼必須剛好是 6 位數字')
    .regex(/^\d+$/, '驗證碼只能包含數字'),
});

export type Login2FABody = z.infer<typeof login2FASchema>;

export const verify2FASchema = z.object({
  token: z
    .string()
    .length(6, '請提供 6 位數驗證碼')
    .regex(/^\d+$/, '驗證碼只能包含數字'),
});

export type Verify2FABody = z.infer<typeof verify2FASchema>;
