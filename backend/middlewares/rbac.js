import * as PermissionService from '../services/permissionService.js';
import AppError from '../utils/AppError.js';

export const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const user = req.user;

    const permissionCheck = await PermissionService.verifyUserPermission(
      user.id,
      requiredPermission,
    );

    if (!permissionCheck) {
      throw new AppError(`權限不足：需要 [${requiredPermission}] 權限`, 403);
    }

    next();
  };
};
