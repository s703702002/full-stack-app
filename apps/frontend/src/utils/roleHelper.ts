export const canEditUser = (
  currentUserRole: string,
  targetUserRole: string,
): boolean => {
  if (currentUserRole === 'superadmin') return true;

  if (currentUserRole === 'admin') {
    return targetUserRole === 'editor' || targetUserRole === 'viewer';
  }

  return false;
};
