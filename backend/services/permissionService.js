import redisClient from '../config/redis.js';
import { getUserPermissionKey } from '../constants/redisKeys.js';
import PermissionModel from '../models/permissionModel.js';

export const verifyUserPermission = async (userId, permissionName) => {
  const cacheKey = getUserPermissionKey(userId);

  // 用 hGet (Hash Get) 尋找特定欄位
  const cachedHasPermission = await redisClient.hGet(cacheKey, permissionName);
  if (cachedHasPermission) return cachedHasPermission === 'true';

  // 如果沒中，去查資料庫
  const hasPermission = await PermissionModel.checkUserHasPermission(
    userId,
    permissionName,
  );

  // 用 hSet (Hash Set) 存入欄位
  await redisClient.hSet(cacheKey, permissionName, hasPermission.toString());

  // 設定整個 Hash 表的過期時間 (避免冷門 user 佔用記憶體)
  await redisClient.expire(cacheKey, 3600);

  return hasPermission;
};

// 新增一個專門用來「炸毀」快取的函式，提供給外面呼叫
export const clearUserPermissionCache = async (userId) => {
  await redisClient.del(getUserPermissionKey(userId));
};
