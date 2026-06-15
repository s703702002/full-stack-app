import { privateApi } from '../api';
import { UseMutationOptions } from '@tanstack/react-query';
import type {
  UserDTO,
  PostDTO,
  PaginatedResponse,
  ApiResponse,
} from '@full-stack-app/shared';

export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
  me: () => ['users', 'me'] as const,
  timeline: (id: string) => ['users', id, 'posts'] as const,
};

export const getMe = () => ({
  queryKey: userKeys.me(),
  queryFn: () =>
    privateApi
      .get<ApiResponse<{ user: UserDTO }>>('/api/users/me')
      .then((r) => r.data.data.user),
});

export const getUserProfile = (userId: string) => ({
  queryKey: userKeys.detail(userId),
  queryFn: () =>
    privateApi
      .get<ApiResponse<{ user: UserDTO }>>(`/api/users/${userId}`)
      .then((r) => r.data.data.user),
  enabled: !!userId,
});

export const getUserTimeline = (userId: string) => ({
  queryKey: userKeys.timeline(userId),
  queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
    privateApi
      .get<ApiResponse<PaginatedResponse<PostDTO>>>(
        `/api/users/${userId}/posts`,
        {
          params: { page: pageParam, limit: 10 },
        },
      )
      .then((r) => r.data.data),
});

export const updateProfileMutation = () => ({
  mutationFn: (formData: FormData) =>
    privateApi.put<ApiResponse<UserDTO>>('/api/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
});

export const getAllUsers = () => ({
  queryKey: userKeys.all,
  queryFn: () =>
    privateApi
      .get<ApiResponse<{ users: UserDTO[] }>>('/api/users')
      .then((r) => r.data.data.users),
});

export interface UpdateRolePayload {
  targetUserId: string;
  newRoleName: string;
}

export const updateRoleMutation = (): UseMutationOptions<
  ApiResponse<Record<string, never>>,
  Error,
  UpdateRolePayload
> => ({
  mutationFn: (payload: UpdateRolePayload) =>
    privateApi
      .put<
        ApiResponse<Record<string, never>>
      >(`/api/users/${payload.targetUserId}/role`, payload)
      .then((r) => r.data),
});

export interface BanUserPayload {
  userId: string;
  reason: string;
  durationMinutes: number;
}

export const banUserMutation = (): UseMutationOptions<
  ApiResponse<Record<string, never>>,
  Error,
  BanUserPayload
> => ({
  mutationFn: (payload: BanUserPayload) =>
    privateApi
      .post<
        ApiResponse<Record<string, never>>
      >(`/api/users/${payload.userId}/ban`, payload)
      .then((r) => r.data),
});

export const liftBanMutation = (): UseMutationOptions<
  ApiResponse<Record<string, never>>,
  Error,
  string
> => ({
  mutationFn: (userId: string) =>
    privateApi
      .delete<ApiResponse<Record<string, never>>>(`/api/users/${userId}/ban`)
      .then((r) => r.data),
});
