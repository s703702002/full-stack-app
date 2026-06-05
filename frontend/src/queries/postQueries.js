import { privateApi } from '../api';

export const postKeys = {
  all: ['posts'],
  timeline: (userId) => ['users', userId, 'posts'],
};

export const createPostMutation = () => ({
  mutationFn: (data) => privateApi.post('/api/posts', data).then((r) => r.data),
});

export const updatePostMutation = () => ({
  mutationFn: ({ id, ...data }) =>
    privateApi.put(`/api/posts/${id}`, data).then((r) => r.data),
});

export const deletePostMutation = () => ({
  mutationFn: (id) => privateApi.delete(`/api/posts/${id}`).then((r) => r.data),
});

export const toggleLikeMutation = () => ({
  mutationFn: (postId) =>
    privateApi.post(`/api/posts/${postId}/like`).then((r) => r.data),
});
