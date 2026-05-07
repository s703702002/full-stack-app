const baseUrl = process.env.IMAGE_BASE_URL;

export const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    roleId: user.roleId,
    roleName: user.role?.name,
    avatarUrl: user.avatarUrl ? `${baseUrl}/${user.avatarUrl}` : null,
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
    authorAvatarUrl: post.author?.avatarUrl
      ? `${baseUrl}/${post.author.avatarUrl}`
      : null,
    likeCount: post._count?.likes || 0,
    isLikedByMe: post.likes && post.likes.length > 0,
  };
};

export const formatLikers = (like) => {
  const user = like.user;

  return {
    ...user,
    avatarUrl: user.avatarUrl ? `${baseUrl}/${user.avatarUrl}` : null,
  };
};
