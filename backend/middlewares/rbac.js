import AppError from '../utils/AppError.js';

export const checkPermission = (allowedPermissions) => {
  // 為了方便，允許傳入單一字串 'user:manage' 或陣列 ['post:delete:own', 'post:delete:any']
  const permissionsToCheck = Array.isArray(allowedPermissions)
    ? allowedPermissions
    : [allowedPermissions];

  return (req, res, next) => {
    const userPermissions = req.user?.permissions || [];

    const hasPermission = permissionsToCheck.some((p) =>
      userPermissions.includes(p),
    );

    if (!hasPermission) {
      throw new AppError(`權限不足：請確認您是否有操作權限`, 403);
    }

    next();
  };
};
