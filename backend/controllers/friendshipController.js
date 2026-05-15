import * as FriendshipService from '../services/friendshipService.js';
import { formatFriend, formatFriendRequest } from '../utils/formatters.js';
import { sendSuccess } from '../utils/response.js';

export const getFriends = async (req, res) => {
  const friends = await FriendshipService.getFriends(req.user.id);

  sendSuccess(res, 200, {
    friends: friends.map((f) => formatFriend(f, req.user.id)),
  });
};

export const getReceivedRequests = async (req, res) => {
  const requests = await FriendshipService.getReceivedRequests(req.user.id);

  sendSuccess(res, 200, {
    requests: requests.map((r) => formatFriendRequest(r, 'received')),
  });
};

export const getSentRequests = async (req, res) => {
  const requests = await FriendshipService.getSentRequests(req.user.id);

  sendSuccess(res, 200, {
    requests: requests.map((r) => formatFriendRequest(r, 'sent')),
  });
};

export const getFriendshipStatus = async (req, res) => {
  const status = await FriendshipService.getFriendshipStatus(
    req.user.id,
    req.params.targetUserId,
  );
  sendSuccess(res, 200, { status });
};

export const sendFriendRequest = async (req, res) => {
  const requesterId = req.user.id;
  const { receiverId } = req.params;

  const friendship = await FriendshipService.sendFriendRequest(
    requesterId,
    receiverId,
  );
  sendSuccess(res, 201, { friendship }, '好友申請已送出');
};

export const respondToFriendRequest = async (req, res) => {
  const receiverId = req.user.id;
  const { requesterId } = req.params;
  const { action } = req.body;

  const friendship = await FriendshipService.respondToFriendRequest(
    requesterId,
    receiverId,
    action,
  );
  sendSuccess(
    res,
    200,
    { friendship },
    action === 'accept' ? '已接受好友申請' : '已拒絕好友申請',
  );
};

export const removeFriend = async (req, res) => {
  await FriendshipService.removeFriend(req.user.id, req.params.friendId);
  sendSuccess(res, 200, {}, '已解除好友關係');
};
