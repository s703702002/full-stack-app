export const PostPolicy = {
  canView(user, post) {
    return post.userId === user.id;
  },

  canDelete(user, post) {
    if (user.permissions.includes('post:delete:any')) return true;

    if (user.permissions.includes('post:delete:own') && post.userId === user.id)
      return true;

    return false;
  },

  canEdit(user, post) {
    if (user.permissions.includes('post:edit:any')) return true;

    if (user.permissions.includes('post:edit:own') && post.userId === user.id)
      return true;

    return false;
  },
};
