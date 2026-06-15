import { privateApi } from '../api';
import { UseMutationOptions } from '@tanstack/react-query';
import type {
  FriendDTO,
  FriendRequestDTO,
  FriendshipStatus,
  ApiResponse,
  FriendshipDTO,
} from '@full-stack-app/shared';

export const friendshipKeys = {
  friends: () => ['friendships', 'friends'] as const,
  received: () => ['friendships', 'received'] as const,
  sent: () => ['friendships', 'sent'] as const,
  status: (userId: string) => ['friendships', 'status', userId] as const,
};

export const getFriends = () => ({
  queryKey: friendshipKeys.friends(),
  queryFn: () =>
    privateApi
      .get<
        ApiResponse<{ friends: FriendDTO[] }>
      >('/api/friend-requests/friends')
      .then((r) => r.data.data.friends),
});

export const getReceivedRequests = () => ({
  queryKey: friendshipKeys.received(),
  queryFn: () =>
    privateApi
      .get<
        ApiResponse<{ requests: FriendRequestDTO[] }>
      >('/api/friend-requests/received')
      .then((r) => r.data.data.requests),
});

export const getSentRequests = () => ({
  queryKey: friendshipKeys.sent(),
  queryFn: () =>
    privateApi
      .get<
        ApiResponse<{ requests: FriendRequestDTO[] }>
      >('/api/friend-requests/sent')
      .then((r) => r.data.data.requests),
});

export const getFriendshipStatus = (userId: string) => ({
  queryKey: friendshipKeys.status(userId),
  queryFn: () =>
    privateApi
      .get<
        ApiResponse<{ status: FriendshipStatus }>
      >(`/api/friend-requests/status/${userId}`)
      .then((r) => r.data.data.status),
  enabled: !!userId,
});

export const sendFriendRequestMutation = (): UseMutationOptions<
  ApiResponse<{ friendship: FriendshipDTO }>,
  Error,
  string
> => ({
  mutationFn: (targetUserId: string) =>
    privateApi
      .post<
        ApiResponse<{ friendship: FriendshipDTO }>
      >(`/api/friend-requests/${targetUserId}`)
      .then((r) => r.data),
});

export interface RespondFriendRequestPayload {
  id: string;
  action: 'accept' | 'reject';
}

export const respondFriendRequestMutation = (): UseMutationOptions<
  ApiResponse<{ friendship: FriendshipDTO }>,
  Error,
  RespondFriendRequestPayload
> => ({
  mutationFn: (payload: RespondFriendRequestPayload) =>
    privateApi
      .patch<
        ApiResponse<{ friendship: FriendshipDTO }>
      >(`/api/friend-requests/${payload.id}`, payload)
      .then((r) => r.data),
});

export const removeFriendMutation = (): UseMutationOptions<
  ApiResponse<Record<string, never>>,
  Error,
  string
> => ({
  mutationFn: (userId: string) =>
    privateApi
      .delete<
        ApiResponse<Record<string, never>>
      >(`/api/friend-requests/friends/${userId}`)
      .then((r) => r.data),
});
