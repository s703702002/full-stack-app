import { privateApi } from '../api';
import {
  queryOptions,
  infiniteQueryOptions,
  mutationOptions,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type {
  UserDTO,
  PostDTO,
  PaginatedResponse,
  ApiResponse,
  ApiErrorResponse,
} from '@full-stack-app/shared';

export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
  me: () => ['users', 'me'] as const,
  timeline: (id: string) => ['users', id, 'posts'] as const,
};

export const getMe = () =>
  queryOptions<UserDTO, AxiosError<ApiErrorResponse>>({
    queryKey: userKeys.me(),
    queryFn: () =>
      privateApi.get('/api/users/me').then((r) => r.data.data.user),
  });

export const getUserProfile = (userId: string) =>
  queryOptions<UserDTO, AxiosError<ApiErrorResponse>>({
    queryKey: userKeys.detail(userId),
    queryFn: () =>
      privateApi.get(`/api/users/${userId}`).then((r) => r.data.data.user),
    enabled: !!userId,
  });

export const getUserTimeline = (userId: string) =>
  infiniteQueryOptions({
    queryKey: userKeys.timeline(userId),
    queryFn: ({ pageParam }): Promise<PaginatedResponse<PostDTO>> =>
      privateApi
        .get(`/api/users/${userId}/posts`, {
          params: { page: pageParam, limit: 10 },
        })
        .then((r) => r.data.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
  });

export const updateProfileMutation = () =>
  mutationOptions<ApiResponse<UserDTO>, AxiosError<ApiErrorResponse>, FormData>(
    {
      mutationFn: (formData) =>
        privateApi.put('/api/users/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
    },
  );

export const getAllUsers = () =>
  queryOptions<UserDTO[], AxiosError<ApiErrorResponse>>({
    queryKey: userKeys.all,
    queryFn: () => privateApi.get('/api/users').then((r) => r.data.data.users),
  });

export interface UpdateRolePayload {
  targetUserId: string;
  newRoleName: string;
}

export const updateRoleMutation = () =>
  mutationOptions<
    ApiResponse<Record<string, never>>,
    AxiosError<ApiErrorResponse>,
    UpdateRolePayload
  >({
    mutationFn: (payload) =>
      privateApi
        .put(`/api/users/${payload.targetUserId}/role`, payload)
        .then((r) => r.data),
  });

export interface BanUserPayload {
  userId: string;
  reason: string;
  durationMinutes: number;
}

export const banUserMutation = () =>
  mutationOptions<
    ApiResponse<Record<string, never>>,
    AxiosError<ApiErrorResponse>,
    BanUserPayload
  >({
    mutationFn: (payload) =>
      privateApi
        .post(`/api/users/${payload.userId}/ban`, payload)
        .then((r) => r.data),
  });

export const liftBanMutation = () =>
  mutationOptions<
    ApiResponse<Record<string, never>>,
    AxiosError<ApiErrorResponse>,
    string
  >({
    mutationFn: (userId) =>
      privateApi.delete(`/api/users/${userId}/ban`).then((r) => r.data),
  });
