import type { User, UserBan, Post } from '../generated/client.js';
import { env } from './validateEnv.js';
import type {
  FindReceivedRequestsResult,
  FindSentRequestsResult,
  FindFriendsResult,
  UserInFriendship,
} from '../models/friendshipModel.js';

export const withBaseUrl = (path: string | null | undefined): string | null =>
  path ? `${env.IMAGE_BASE_URL}/${path}` : null;

type UserWithRole = User & {
  role?: { name: string } | null;
};

export const sanitizeUser = (user: UserWithRole | null) => {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    roleId: user.roleId,
    roleName: user.role?.name,
    avatarUrl: withBaseUrl(user.avatarUrl),
    bio: user.bio,
  };
};

export const formatPost = (post: Post) => {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    userId: post.userId,
  };
};

export const formatFriendRequest = (
  friendship:
    | FindReceivedRequestsResult[number]
    | FindSentRequestsResult[number],
  user: UserInFriendship,
) => {
  return {
    id: friendship.id,
    status: friendship.status,
    createdAt: friendship.createdAt,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      avatarUrl: withBaseUrl(user.avatarUrl),
      bio: user.bio,
    },
  };
};

export const formatFriend = (
  friendship: FindFriendsResult[number],
  currentUserId: string,
) => {
  const friend =
    friendship.requesterId === currentUserId
      ? friendship.receiver
      : friendship.requester;

  return {
    friendshipId: friendship.id,
    since: friendship.updatedAt,
    user: {
      id: friend.id,
      name: friend.name,
      username: friend.username,
      avatarUrl: withBaseUrl(friend.avatarUrl),
      bio: friend.bio,
    },
  };
};

export const formatBanInfo = (ban: UserBan) => {
  return {
    id: ban.id,
    reason: ban.reason,
    adminId: ban.adminId,
    expiresAt: ban.expiresAt,
  };
};
