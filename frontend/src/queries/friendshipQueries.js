import { privateApi } from '../api';

export const friendshipKeys = {
  friends: () => ['friendships', 'friends'],
  received: () => ['friendships', 'received'],
  sent: () => ['friendships', 'sent'],
  status: (userId) => ['friendships', 'status', userId],
};

export const getFriends = () => ({
  queryKey: friendshipKeys.friends(),
  queryFn: () =>
    privateApi
      .get('/api/friend-requests/friends')
      .then((r) => r.data.data.friends),
});

export const getReceivedRequests = () => ({
  queryKey: friendshipKeys.received(),
  queryFn: () =>
    privateApi
      .get('/api/friend-requests/received')
      .then((r) => r.data.data.requests),
});

export const getSentRequests = () => ({
  queryKey: friendshipKeys.sent(),
  queryFn: () =>
    privateApi
      .get('/api/friend-requests/sent')
      .then((r) => r.data.data.requests),
});

export const getFriendshipStatus = (userId) => ({
  queryKey: friendshipKeys.status(userId),
  queryFn: () =>
    privateApi
      .get(`/api/friend-requests/status/${userId}`)
      .then((r) => r.data.data.status),
  enabled: !!userId,
});

export const sendFriendRequestMutation = () => ({
  mutationFn: (targetUserId) =>
    privateApi.post(`/api/friend-requests/${targetUserId}`).then((r) => r.data),
});

export const respondFriendRequestMutation = () => ({
  mutationFn: (payload) =>
    privateApi
      .patch(`/api/friend-requests/${payload.id}`, payload)
      .then((r) => r.data),
});

export const removeFriendMutation = () => ({
  mutationFn: (userId) =>
    privateApi
      .delete(`/api/friend-requests/friends/${userId}`)
      .then((r) => r.data),
});
