const baseUrl = process.env.IMAGE_BASE_URL;

export const withBaseUrl = (path) => (path ? `${baseUrl}/${path}` : null);

export const sanitizeUser = (user) => {
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

export const formatPost = (post) => {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    userId: post.userId,
    username: post.author?.username,
    authorName: post.author?.name,
    authorAvatarUrl: withBaseUrl(post.author?.avatarUrl),
    likeCount: post._count?.likes || 0,
    isLikedByMe: post.likes && post.likes.length > 0,
  };
};

export const formatLikers = (like) => {
  const user = like.user;

  return {
    ...user,
    avatarUrl: withBaseUrl(user.avatarUrl),
  };
};

export const formatFriendRequest = (friendship, perspective = 'received') => {
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
