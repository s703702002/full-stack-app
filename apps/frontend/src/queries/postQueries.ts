import { privateApi } from '../api';
import { UseMutationOptions } from '@tanstack/react-query';
import type { PostDTO, ApiResponse } from '@full-stack-app/shared';

export const postKeys = {
  all: ['posts'] as const,
  timeline: (userId: string) => ['users', userId, 'posts'] as const,
};

export interface CreatePostPayload {
  content: string;
  targetUserId?: string;
}

export const createPostMutation = (): UseMutationOptions<
  PostDTO,
  Error,
  CreatePostPayload
> => ({
  mutationFn: (data: CreatePostPayload) =>
    privateApi
      .post<ApiResponse<{ post: PostDTO }>>('/api/posts', data)
      .then((r) => r.data.data.post),
});

export interface UpdatePostPayload {
  id: string;
  content: string;
}

export const updatePostMutation = (): UseMutationOptions<
  PostDTO,
  Error,
  UpdatePostPayload
> => ({
  mutationFn: ({ id, ...data }: UpdatePostPayload) =>
    privateApi
      .put<ApiResponse<{ post: PostDTO }>>(`/api/posts/${id}`, data)
      .then((r) => r.data.data.post),
});

export const deletePostMutation = (): UseMutationOptions<
  ApiResponse<Record<string, never>>,
  Error,
  string
> => ({
  mutationFn: (id: string) =>
    privateApi
      .delete<ApiResponse<Record<string, never>>>(`/api/posts/${id}`)
      .then((r) => r.data),
});

export const toggleLikeMutation = (): UseMutationOptions<
  ApiResponse<{ isLiked: boolean }>,
  Error,
  string
> => ({
  mutationFn: (postId: string) =>
    privateApi
      .post<ApiResponse<{ isLiked: boolean }>>(`/api/posts/${postId}/like`)
      .then((r) => r.data),
});
