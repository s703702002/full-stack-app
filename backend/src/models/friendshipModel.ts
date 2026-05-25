import prisma from '../config/db.js';
import type { FriendshipStatus } from '../generated/client.js';

const userSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  bio: true,
} as const;

const FriendshipModel = {
  findReceivedRequests: async (userId: string) => {
    return await prisma.friendship.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: { requester: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findSentRequests: async (userId: string) => {
    return await prisma.friendship.findMany({
      where: { requesterId: userId, status: 'PENDING' },
      include: { receiver: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findByPair: async (operatorUserId: string, targetUserId: string) => {
    return await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: operatorUserId, receiverId: targetUserId },
          { requesterId: targetUserId, receiverId: operatorUserId },
        ],
      },
    });
  },

  findAcceptedByPair: async (userId: string, targetUserId: string) => {
    return await prisma.friendship.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { requesterId: userId, receiverId: targetUserId },
          { requesterId: targetUserId, receiverId: userId },
        ],
      },
    });
  },

  findPendingRequest: async (requesterId: string, receiverId: string) => {
    return await prisma.friendship.findFirst({
      where: { requesterId, receiverId, status: 'PENDING' },
    });
  },

  findFriends: async (userId: string) => {
    return await prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: { select: userSelect },
        receiver: { select: userSelect },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  createFriendRequest: async (requesterId: string, receiverId: string) => {
    return await prisma.friendship.create({
      data: { requesterId, receiverId },
    });
  },

  updateStatus: async (id: string, status: FriendshipStatus) => {
    return await prisma.friendship.update({
      where: { id },
      data: { status },
    });
  },

  deleteFriendship: async (id: string) => {
    return await prisma.friendship.delete({ where: { id } });
  },

  resetFriendRequest: async (
    id: string,
    requesterId: string,
    receiverId: string,
  ) => {
    return await prisma.friendship.update({
      where: { id },
      data: { status: 'PENDING', requesterId, receiverId },
    });
  },
};

export default FriendshipModel;
