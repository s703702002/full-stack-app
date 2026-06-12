import { privateApi } from '../api';
import { UseMutationOptions } from '@tanstack/react-query';

export const postKeys = {
  all: ['posts'] as const,
  timeline: (userId: string) => ['users', userId, 'posts'] as const,
};

export interface CreatePostPayload {
  content: string;
  targetUserId?: string;
}

export const createPostMutation = (): UseMutationOptions<
  any,
  any,
  CreatePostPayload
> => ({
  mutationFn: (data: CreatePostPayload) =>
    privateApi.post('/api/posts', data).then((r) => r.data),
});

export interface UpdatePostPayload {
  id: string;
  content: string;
}

export const updatePostMutation = (): UseMutationOptions<
  any,
  any,
  UpdatePostPayload
> => ({
  mutationFn: ({ id, ...data }: UpdatePostPayload) =>
    privateApi.put(`/api/posts/${id}`, data).then((r) => r.data),
});

export const deletePostMutation = (): UseMutationOptions<any, any, string> => ({
  mutationFn: (id: string) =>
    privateApi.delete(`/api/posts/${id}`).then((r) => r.data),
});

export const toggleLikeMutation = (): UseMutationOptions<any, any, string> => ({
  mutationFn: (postId: string) =>
    privateApi.post(`/api/posts/${postId}/like`).then((r) => r.data),
});
