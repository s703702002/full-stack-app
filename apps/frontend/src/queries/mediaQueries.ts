import { privateApi } from '../api';
import { infiniteQueryOptions, mutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type {
  MediaDTO,
  MediaType,
  PaginatedResponse,
  ApiResponse,
  ApiErrorResponse,
} from '@full-stack-app/shared';

export const mediaKeys = {
  all: ['medias'] as const,
  userMedias: (userId: string, type?: MediaType) =>
    ['medias', 'user', userId, type ?? 'all'] as const,
};

export const getUserMedias = (userId: string, type?: MediaType) =>
  infiniteQueryOptions({
    queryKey: mediaKeys.userMedias(userId, type),
    queryFn: ({ pageParam }): Promise<PaginatedResponse<MediaDTO>> =>
      privateApi
        .get(`/api/users/${userId}/medias`, {
          params: { page: pageParam, limit: 12, type },
        })
        .then((r) => r.data.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: !!userId,
  });

export const uploadMediaMutation = () =>
  mutationOptions<
    ApiResponse<MediaDTO>,
    AxiosError<ApiErrorResponse>,
    FormData
  >({
    mutationFn: (formData) =>
      privateApi.post('/api/medias', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
  });

export const deleteMediaMutation = () =>
  mutationOptions<
    ApiResponse<{ success: boolean }>,
    AxiosError<ApiErrorResponse>,
    string
  >({
    mutationFn: (mediaId) =>
      privateApi.delete(`/api/medias/${mediaId}`).then((r) => r.data),
  });
