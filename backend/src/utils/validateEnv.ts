import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().optional().default('3000'),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  REDIS_SHARED_DB: z.string(),

  SESSION_SECRET: z.string(),
  SESSION_EXPIRY: z.string(),

  S3_BUCKET: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_ACCESS_SECRET: z.string(),
  S3_ENDPOINT_URL: z.url(),
  IMAGE_BASE_URL: z.url(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  DATABASE_URL: z.string(),
});

export const env = envSchema.parse(process.env);
