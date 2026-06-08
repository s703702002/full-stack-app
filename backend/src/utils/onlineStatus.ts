import redisClient from '../config/redis.js';
import { onlineKey } from '../constants/redisKeys.js';

export const setOnline = (userId: string) =>
  redisClient.set(onlineKey(userId), '1', { EX: 60 * 5 }); // 5 分鐘 TTL

export const setOffline = (userId: string) =>
  redisClient.del(onlineKey(userId));

export const isOnline = async (userId: string) =>
  !!(await redisClient.get(onlineKey(userId)));

export const getOnlineStatuses = async (userIds: string[]) => {
  const results = await Promise.all(userIds.map(isOnline));
  return Object.fromEntries(userIds.map((id, i) => [id, results[i]]));
};
