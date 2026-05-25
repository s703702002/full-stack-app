import FriendshipModel from '../models/friendshipModel.js';
import UserModel from '../models/userModel.js';
import AppError from '../utils/AppError.js';

export const getReceivedRequests = async (userId) => {
  return await FriendshipModel.findReceivedRequests(userId);
};

export const getSentRequests = async (userId) => {
  return await FriendshipModel.findSentRequests(userId);
};

export const getFriends = async (userId) => {
  return await FriendshipModel.findFriends(userId);
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

  const receiver = await UserModel.findById(receiverId);
  if (!receiver) throw new AppError('找不到該使用者', 404);

  // 確認是否已經有申請紀錄
  const existing = await FriendshipModel.findByPair(requesterId, receiverId);

  if (existing) {
    if (existing.status === 'BLOCKED') {
      throw new AppError('無法送出好友申請', 400);
    }

    if (existing.status === 'ACCEPTED') {
      throw new AppError('你們已經是好友了', 400);
    }

    if (existing.status === 'PENDING') {
      throw new AppError('好友申請已送出，等待對方回應', 400);
    }

    // REJECTED 的情況，重置為 PENDING
    // 同時更新 requesterId，因為這次可能是對方來加你
    if (existing.status === 'REJECTED') {
      return await FriendshipModel.resetFriendRequest(
        existing.id,
        requesterId,
        receiverId,
      );
    }
  }

  return await FriendshipModel.createFriendRequest(requesterId, receiverId);
};

export const respondToFriendRequest = async (
  requesterId,
  receiverId,
  action,
) => {
  // 只能找「別人送給我」的申請，不能操作自己送出的
  const friendship = await FriendshipModel.findPendingRequest(
    requesterId,
    receiverId,
  );
  if (!friendship) throw new AppError('找不到好友申請', 404);

  const status = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
  return await FriendshipModel.updateStatus(friendship.id, status);
};

export const removeFriend = async (userId, friendId) => {
  const friendship = await FriendshipModel.findByPair(userId, friendId);
  if (friendship?.status !== 'ACCEPTED') {
    throw new AppError('找不到好友關係', 404);
  }
  await FriendshipModel.deleteFriendship(friendship.id);
};
