import type { User, Post, PostLike, Friendship } from '../generated/client.js';
import { env } from './validateEnv.js';

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

type PostWithRelations = Post & {
  author?: { name: string; avatarUrl: string | null } | null;
  likes?: PostLike[];
  _count?: { likes: number };
};

export const formatPost = (post: PostWithRelations) => {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    userId: post.userId,
    authorName: post.author?.name,
    authorAvatarUrl: withBaseUrl(post.author?.avatarUrl),
    likeCount: post._count?.likes ?? 0,
    isLikedByMe: post.likes ? post.likes.length > 0 : false,
  };
};

type LikeWithUser = PostLike & {
  user: User;
};

export const formatLikers = (like: LikeWithUser) => {
  return {
    ...like.user,
    avatarUrl: withBaseUrl(like.user.avatarUrl),
  };
};

type FriendshipWithUsers = Friendship & {
  requester: User;
  receiver: User;
};

export const formatFriendRequest = (
  friendship: FriendshipWithUsers,
  perspective: 'received' | 'sent' = 'received',
) => {
  const user =
    perspective === 'received' ? friendship.requester : friendship.receiver;

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
