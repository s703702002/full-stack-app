import { privateApi } from '../api';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type {
  FriendDTO,
  FriendRequestDTO,
  FriendshipStatus,
  ApiResponse,
  FriendshipDTO,
  ApiErrorResponse,
} from '@full-stack-app/shared';

export const friendshipKeys = {
  friends: () => ['friendships', 'friends'] as const,
  received: () => ['friendships', 'received'] as const,
  sent: () => ['friendships', 'sent'] as const,
  status: (userId: string) => ['friendships', 'status', userId] as const,
};

export const getFriends = () =>
  queryOptions<FriendDTO[], AxiosError<ApiErrorResponse>>({
    queryKey: friendshipKeys.friends(),
    queryFn: () =>
      privateApi
        .get<ApiResponse<{ friends: FriendDTO[] }>>(
          '/api/friend-requests/friends',
        )
        .then((r) => r.data.data.friends),
  });

export const getReceivedRequests = () =>
  queryOptions<FriendRequestDTO[], AxiosError<ApiErrorResponse>>({
    queryKey: friendshipKeys.received(),
    queryFn: () =>
      privateApi
        .get<ApiResponse<{ requests: FriendRequestDTO[] }>>(
          '/api/friend-requests/received',
        )
        .then((r) => r.data.data.requests),
  });

export const getSentRequests = () =>
  queryOptions<FriendRequestDTO[], AxiosError<ApiErrorResponse>>({
    queryKey: friendshipKeys.sent(),
    queryFn: () =>
      privateApi
        .get<ApiResponse<{ requests: FriendRequestDTO[] }>>(
          '/api/friend-requests/sent',
        )
        .then((r) => r.data.data.requests),
  });

export const getFriendshipStatus = (userId: string) =>
  queryOptions<FriendshipStatus, AxiosError<ApiErrorResponse>>({
    queryKey: friendshipKeys.status(userId),
    queryFn: () =>
      privateApi
        .get<ApiResponse<{ status: FriendshipStatus }>>(
          `/api/friend-requests/status/${userId}`,
        )
        .then((r) => r.data.data.status),
    enabled: !!userId,
  });

export const sendFriendRequestMutation = () =>
  mutationOptions<
    ApiResponse<{ friendship: FriendshipDTO }>,
    AxiosError<ApiErrorResponse>,
    string
  >({
    mutationFn: (targetUserId) =>
      privateApi
        .post(`/api/friend-requests/${targetUserId}`)
        .then((r) => r.data),
  });

export interface RespondFriendRequestPayload {
  id: string;
  action: 'accept' | 'reject';
}

export const respondFriendRequestMutation = () =>
  mutationOptions<
    ApiResponse<{ friendship: FriendshipDTO }>,
    AxiosError<ApiErrorResponse>,
    RespondFriendRequestPayload
  >({
    mutationFn: (payload) =>
      privateApi
        .patch(`/api/friend-requests/${payload.id}`, payload)
        .then((r) => r.data),
  });

export const removeFriendMutation = () =>
  mutationOptions<
    ApiResponse<Record<string, never>>,
    AxiosError<ApiErrorResponse>,
    string
  >({
    mutationFn: (userId) =>
      privateApi
        .delete(`/api/friend-requests/friends/${userId}`)
        .then((r) => r.data),
  });
