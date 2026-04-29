export const sanitizeUser = (user) => {
  if (!user) return null;

  const baseUrl = process.env.IMAGE_BASE_URL;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    roleId: user.roleId,
    roleName: user.role?.name,
    avatarUrl: user.avatarUrl ? `${baseUrl}/${user.avatarUrl}` : null,
  };
};

export const formatPost = (post) => {
  const baseUrl = process.env.IMAGE_BASE_URL;

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
