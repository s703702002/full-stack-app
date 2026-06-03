import type { User } from '../generated/client.js';
import { env } from './validateEnv.js';
import type {
  FriendshipWithUsers,
  ReceivedFriendship,
  SentFriendship,
} from '../models/friendshipModel.js';
import type {
  FindAllByUserIdResult,
  GetPostLikersResult,
} from '../models/postModel.js';

type FriendRequestInput = ReceivedFriendship | SentFriendship;

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

export const formatPost = (
  post: FindAllByUserIdResult[number],
  reqUserId: string,
) => {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    userId: post.userId,
    authorName: post.author?.name,
    authorAvatarUrl: withBaseUrl(post.author?.avatarUrl),
    likeCount: post.likes.length ?? 0,
    isLikedByMe: post.likes.some((like) => like.userId === reqUserId),
  };
};

export const formatLikers = (like: GetPostLikersResult[number]) => {
  return {
    ...like.user,
    avatarUrl: withBaseUrl(like.user.avatarUrl),
  };
};

export const formatFriendRequest = (
  friendship: FriendRequestInput,
  perspective: 'received' | 'sent',
) => {
  const user =
    perspective === 'received'
      ? (friendship as ReceivedFriendship).requester
      : (friendship as SentFriendship).receiver;

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
  friendship: FriendshipWithUsers,
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
