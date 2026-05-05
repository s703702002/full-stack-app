import PermissionModel from '../models/permissionModel.js';

export const verifyUserPermission = async (userId, permissionName) => {
  // 💡 未來擴充點：先去 Redis 查這個 user 有沒有這個 permission
  // const cachedHasPermission = await redisClient.get(`perms:${userId}:${permissionName}`);
  // if (cachedHasPermission) return cachedHasPermission === 'true';

  // 如果 Redis 沒有，才去叫 Model 查資料庫
  const hasPermission = await PermissionModel.checkUserHasPermission(
    userId,
    permissionName,
  );

  // 💡 未來擴充點：查完之後存入 Redis
  // await redisClient.setEx(`perms:${userId}:${permissionName}`, 3600, hasPermission.toString());

  return hasPermission;
};
