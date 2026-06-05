import { privateApi } from '../api';

export const userKeys = {
  all: ['users'],
  detail: (id) => ['users', id],
  me: () => ['users', 'me'],
  timeline: (id) => ['users', id, 'posts'],
};

export const getMe = () => ({
  queryKey: userKeys.me(),
  queryFn: () => privateApi.get('/api/users/me').then((r) => r.data.data.user),
});

export const getUserProfile = (userId) => ({
  queryKey: userKeys.detail(userId),
  queryFn: () =>
    privateApi.get(`/api/users/${userId}`).then((r) => r.data.data.user),
  enabled: !!userId,
});

export const getUserTimeline = (userId) => ({
  queryKey: userKeys.timeline(userId),
  queryFn: ({ pageParam = 1 }) =>
    privateApi
      .get(`/api/users/${userId}/posts`, {
        params: { page: pageParam, limit: 10 },
      })
      .then((r) => r.data.data),
});

export const updateProfileMutation = () => ({
  mutationFn: (formData) =>
    privateApi.put('/api/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
});

export const getAllUsers = () => ({
  queryKey: userKeys.all,
  queryFn: () => privateApi.get('/api/users').then((r) => r.data.data.users),
});

export const updateRoleMutation = () => ({
  mutationFn: (payload) =>
    privateApi
      .put(`/api/users/${payload.targetUserId}/role`, payload)
      .then((r) => r.data),
});

export const banUserMutation = () => ({
  mutationFn: (payload) =>
    privateApi
      .post(`/api/users/${payload.userId}/ban`, payload)
      .then((r) => r.data),
});

export const liftBanMutation = () => ({
  mutationFn: (userId) =>
    privateApi.delete(`/api/users/${userId}/ban`).then((r) => r.data),
});
