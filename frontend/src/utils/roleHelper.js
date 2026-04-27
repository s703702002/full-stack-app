export const canEditTargetUser = (currentUserRole, targetUserRole) => {
  if (currentUserRole === 'superadmin') return true;

  if (currentUserRole === 'admin') {
    return targetUserRole === 'editor' || targetUserRole === 'viewer';
  }

  return false;
};
