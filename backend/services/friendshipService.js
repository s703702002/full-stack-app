import FriendshipModel from '../models/friendshipModel.js';
import UserModel from '../models/userModel.js';
import AppError from '../utils/AppError.js';

export const getReceivedRequests = async (userId) => {
  return await FriendshipModel.findReceivedRequests(userId);
};

export const getSentRequests = async (userId) => {
  return await FriendshipModel.findSentRequests(userId);
};

export const getFriendshipStatus = async (userId, targetUserId) => {
  const friendship = await FriendshipModel.findByPair(userId, targetUserId);

  if (!friendship) return { state: 'NONE' };

  // 區分「我送出的」還是「對方送來的」
  if (friendship.status === 'PENDING') {
    return {
      state: friendship.requesterId === userId ? 'SENT' : 'RECEIVED',
      friendshipId: friendship.id,
    };
  }

  return { state: friendship.status, friendshipId: friendship.id };
};

export const sendFriendRequest = async (requesterId, receiverId) => {
  if (requesterId === receiverId) {
    throw new AppError('不能加自己為好友', 400);
  }

  // 確認對方存在
  const receiver = await UserModel.findById(receiverId);
  if (!receiver) throw new AppError('找不到該使用者', 404);

  // 確認是否已經有申請紀錄
  const existing = await FriendshipModel.findByPair(requesterId, receiverId);

  if (existing) {
    const messages = {
      PENDING: '好友申請已送出，等待對方回應',
      ACCEPTED: '你們已經是好友了',
      REJECTED: '對方已拒絕你的好友申請',
      BLOCKED: '無法送出好友申請',
    };
    throw new AppError(messages[existing.status], 400);
  }

  return await FriendshipModel.createFriendRequest(requesterId, receiverId);
};

export const respondToFriendRequest = async (
  requesterId,
  receiverId,
  action,
) => {
  if (!['accept', 'reject'].includes(action)) {
    throw new AppError('無效的操作', 400);
  }

  // 只能找「別人送給我」的申請，不能操作自己送出的
  const friendship = await FriendshipModel.findPendingRequest(
    requesterId,
    receiverId,
  );
  if (!friendship) throw new AppError('找不到好友申請', 404);

  const status = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
  return await FriendshipModel.updateStatus(friendship.id, status);
};
