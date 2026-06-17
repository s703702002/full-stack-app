import { privateApi } from '../api';
import { mutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type {
  PostDTO,
  ApiResponse,
  ApiErrorResponse,
} from '@full-stack-app/shared';

export const postKeys = {
  all: ['posts'] as const,
  timeline: (userId: string) => ['users', userId, 'posts'] as const,
};

export interface CreatePostPayload {
  content: string;
  targetUserId?: string;
}

export const createPostMutation = () =>
  mutationOptions<PostDTO, AxiosError<ApiErrorResponse>, CreatePostPayload>({
    mutationFn: (data) =>
      privateApi.post('/api/posts', data).then((r) => r.data.data.post),
  });

export interface UpdatePostPayload {
  id: string;
  content: string;
}

export const updatePostMutation = () =>
  mutationOptions<PostDTO, AxiosError<ApiErrorResponse>, UpdatePostPayload>({
    mutationFn: ({ id, ...data }) =>
      privateApi.put(`/api/posts/${id}`, data).then((r) => r.data.data.post),
  });

export const deletePostMutation = () =>
  mutationOptions<
    ApiResponse<Record<string, never>>,
    AxiosError<ApiErrorResponse>,
    string
  >({
    mutationFn: (id) =>
      privateApi.delete(`/api/posts/${id}`).then((r) => r.data),
  });

export const toggleLikeMutation = () =>
  mutationOptions<
    ApiResponse<{ isLiked: boolean }>,
    AxiosError<ApiErrorResponse>,
    string
  >({
    mutationFn: (postId) =>
      privateApi.post(`/api/posts/${postId}/like`).then((r) => r.data),
  });
