import type { Post } from '../generated/client.js';
import type { AuthUser } from '../types/auth.js';

export const PostPolicy = {
  canView(user: AuthUser, post: Post): boolean {
    return post.userId === user.id;
  },

  canDelete(user: AuthUser, post: Post): boolean {
    if (user.permissions.includes('post:delete:any')) return true;
    if (user.permissions.includes('post:delete:own') && post.userId === user.id)
      return true;
    return false;
  },

  canEdit(user: AuthUser, post: Post): boolean {
    if (user.permissions.includes('post:edit:any')) return true;
    if (user.permissions.includes('post:edit:own') && post.userId === user.id)
      return true;
    return false;
  },
};
