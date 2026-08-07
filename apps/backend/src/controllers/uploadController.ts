import type { Request, Response } from 'express';
import {
  generatePresignedGetUrl,
  generatePresignedPutUrl,
} from '../utils/s3Utils.js';
import { env } from '../utils/validateEnv.js';
import { PresignedUrlBody } from '@full-stack-app/shared';
import { sendSuccess } from '../utils/response.js';
import AppError from '../utils/AppError.js';

function sanitizeFileName(name: string): string {
  // 只保留英數字、底線、連字號、點，避免特殊字元造成 S3 key 問題
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function getPresignedPutUrl(req: Request, res: Response) {
  const { fileName, contentType } = req.body as PresignedUrlBody;

  const userId = req.user?.id;
  const key = `uploads/${userId}/${sanitizeFileName(fileName)}`;
  const url = await generatePresignedPutUrl(key, contentType);

  sendSuccess(res, 200, {
    url,
    key,
    bucket: env.S3_BUCKET,
  });
}

export async function getPresignedGetUrl(
  req: Request<{ key: string }>,
  res: Response,
) {
  const { key } = req.params;
  const userId = req.user!.id;

  if (!key.startsWith(`uploads/${userId}/`)) {
    throw new AppError('Forbidden', 403);
  }

  const url = await generatePresignedGetUrl(key);

  sendSuccess(res, 200, { url });
}
