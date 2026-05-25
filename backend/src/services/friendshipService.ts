import FriendshipModel from '../models/friendshipModel.js';
import UserModel from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import type { FriendshipStatus } from '../generated/client.js';

export const getReceivedRequests = async (userId: string) => {
  return await FriendshipModel.findReceivedRequests(userId);
};

export const getSentRequests = async (userId: string) => {
  return await FriendshipModel.findSentRequests(userId);
};

export const getFriends = async (userId: string) => {
  return await FriendshipModel.findFriends(userId);
};

type FriendshipState =
  | { state: 'NONE' }
  | { state: 'SENT' | 'RECEIVED' | FriendshipStatus; friendshipId: string };

export const getFriendshipStatus = async (
  userId: string,
  targetUserId: string,
): Promise<FriendshipState> => {
  const friendship = await FriendshipModel.findByPair(userId, targetUserId);

  if (!friendship) return { state: 'NONE' };

  if (friendship.status === 'PENDING') {
    return {
      state: friendship.requesterId === userId ? 'SENT' : 'RECEIVED',
      friendshipId: friendship.id,
    };
  }

  return { state: friendship.status, friendshipId: friendship.id };
};

export const sendFriendRequest = async (
  requesterId: string,
  receiverId: string,
) => {
  if (requesterId === receiverId) {
    throw new AppError('不能加自己為好友', 400);
  }

  const receiver = await UserModel.findById(receiverId);
  if (!receiver) throw new AppError('找不到該使用者', 404);

  const existing = await FriendshipModel.findByPair(requesterId, receiverId);

  if (existing) {
    if (existing.status === 'BLOCKED')
      throw new AppError('無法送出好友申請', 400);
    if (existing.status === 'ACCEPTED')
      throw new AppError('你們已經是好友了', 400);
    if (existing.status === 'PENDING')
      throw new AppError('好友申請已送出，等待對方回應', 400);

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
  requesterId: string,
  receiverId: string,
  action: 'accept' | 'reject',
) => {
  const friendship = await FriendshipModel.findPendingRequest(
    requesterId,
    receiverId,
  );
  if (!friendship) throw new AppError('找不到好友申請', 404);

  const status: FriendshipStatus =
    action === 'accept' ? 'ACCEPTED' : 'REJECTED';
  return await FriendshipModel.updateStatus(friendship.id, status);
};

export const removeFriend = async (
  userId: string,
  friendId: string,
): Promise<void> => {
  const friendship = await FriendshipModel.findByPair(userId, friendId);
  if (friendship?.status !== 'ACCEPTED') {
    throw new AppError('找不到好友關係', 404);
  }
  await FriendshipModel.deleteFriendship(friendship.id);
};
