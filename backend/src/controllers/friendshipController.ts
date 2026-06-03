import type { Request, Response } from 'express';
import * as FriendshipService from '../services/friendshipService.js';
import { formatFriend, formatFriendRequest } from '../utils/formatters.js';
import { sendSuccess } from '../utils/response.js';
import { getAuthUser } from '../utils/requestHelper.js';

export const getFriends = async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const friends = await FriendshipService.getFriends(user.id);

  sendSuccess(res, 200, {
    friends: friends.map((f) => formatFriend(f, user.id)),
  });
};

export const getReceivedRequests = async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const requests = await FriendshipService.getReceivedRequests(user.id);
  sendSuccess(res, 200, {
    requests: requests.map((r) => formatFriendRequest(r, r.requester)),
  });
};

export const getSentRequests = async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const requests = await FriendshipService.getSentRequests(user.id);
  sendSuccess(res, 200, {
    requests: requests.map((r) => formatFriendRequest(r, r.receiver)),
  });
};

export const getFriendshipStatus = async (
  req: Request<{ targetUserId: string }>,
  res: Response,
) => {
  const user = getAuthUser(req);
  const status = await FriendshipService.getFriendshipStatus(
    user.id,
    req.params.targetUserId,
  );
  sendSuccess(res, 200, { status });
};

export const sendFriendRequest = async (
  req: Request<{ receiverId: string }>,
  res: Response,
) => {
  const user = getAuthUser(req);
  const friendship = await FriendshipService.sendFriendRequest(
    user.id,
    req.params.receiverId,
    user.name,
  );
  sendSuccess(res, 201, { friendship }, '好友申請已送出');
};

export const respondToFriendRequest = async (
  req: Request<
    { requesterId: string },
    unknown,
    { action: 'accept' | 'reject' }
  >,
  res: Response,
) => {
  const user = getAuthUser(req);
  const { action } = req.body;
  const friendship = await FriendshipService.respondToFriendRequest(
    req.params.requesterId,
    user.id,
    action,
  );
  sendSuccess(
    res,
    200,
    { friendship },
    action === 'accept' ? '已接受好友申請' : '已拒絕好友申請',
  );
};

export const removeFriend = async (
  req: Request<{ friendId: string }>,
  res: Response,
) => {
  const user = getAuthUser(req);
  await FriendshipService.removeFriend(user.id, req.params.friendId);
  sendSuccess(res, 200, {}, '已解除好友關係');
};
