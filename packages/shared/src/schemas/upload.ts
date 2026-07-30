import { z } from 'zod';

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const presignedUrlSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
});

export type PresignedUrlBody = z.infer<typeof presignedUrlSchema>;
