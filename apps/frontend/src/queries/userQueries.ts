import { privateApi } from '../api';
import { UseMutationOptions } from '@tanstack/react-query';

export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
  me: () => ['users', 'me'] as const,
  timeline: (id: string) => ['users', id, 'posts'] as const,
};

export const getMe = () => ({
  queryKey: userKeys.me(),
  queryFn: () => privateApi.get('/api/users/me').then((r) => r.data.data.user),
});

export const getUserProfile = (userId: string) => ({
  queryKey: userKeys.detail(userId),
  queryFn: () =>
    privateApi.get(`/api/users/${userId}`).then((r) => r.data.data.user),
  enabled: !!userId,
});

export const getUserTimeline = (userId: string) => ({
  queryKey: userKeys.timeline(userId),
  queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
    privateApi
      .get(`/api/users/${userId}/posts`, {
        params: { page: pageParam, limit: 10 },
      })
      .then((r) => r.data.data),
});

export const updateProfileMutation = () => ({
  mutationFn: (formData: FormData) =>
    privateApi.put('/api/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
});

export const getAllUsers = () => ({
  queryKey: userKeys.all,
  queryFn: () => privateApi.get('/api/users').then((r) => r.data.data.users),
});

export interface UpdateRolePayload {
  targetUserId: string;
  newRoleName: string;
}

export const updateRoleMutation = (): UseMutationOptions<
  any,
  any,
  UpdateRolePayload
> => ({
  mutationFn: (payload: UpdateRolePayload) =>
    privateApi
      .put(`/api/users/${payload.targetUserId}/role`, payload)
      .then((r) => r.data),
});

export interface BanUserPayload {
  userId: string;
  reason: string;
  durationMinutes: number;
}

export const banUserMutation = (): UseMutationOptions<
  any,
  any,
  BanUserPayload
> => ({
  mutationFn: (payload: BanUserPayload) =>
    privateApi
      .post(`/api/users/${payload.userId}/ban`, payload)
      .then((r) => r.data),
});

export const liftBanMutation = (): UseMutationOptions<any, any, string> => ({
  mutationFn: (userId: string) =>
    privateApi.delete(`/api/users/${userId}/ban`).then((r) => r.data),
});
