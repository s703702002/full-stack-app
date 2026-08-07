import type { Request, Response } from 'express';
import { mediaService } from '../services/mediaService.js';
import { sendSuccess } from '../utils/response.js';
import AppError from '../utils/AppError.js';
import type { MediaType } from '../generated/client.js';

export async function getUserMedias(req: Request, res: Response) {
  const userId = req.params.userId as string;
  const page = Math.max(1, Number.parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit as string) || 30));
  const mediaType = req.query.type as MediaType | undefined;

  const result = await mediaService.getUserMedias(userId, page, limit, mediaType);
  sendSuccess(res, 200, result);
}

export async function uploadMedia(req: Request, res: Response) {
  const currentUserId = req.user!.id;
  const { title, description } = req.body;

  if (!req.file) {
    throw new AppError('請提供上傳檔案', 400);
  }

  const media = await mediaService.createMediaFromFile(
    currentUserId,
    req.file,
    title,
    description,
  );

  sendSuccess(res, 201, media, '媒體檔案上傳成功');
}

export async function deleteMedia(req: Request, res: Response) {
  const currentUserId = req.user!.id;
  const mediaId = req.params.id as string;

  const result = await mediaService.deleteMedia(currentUserId, mediaId);
  sendSuccess(res, 200, result, '媒體刪除成功');
}
