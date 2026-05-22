import prisma from '../config/db';

const FriendshipModel = {
  findReceivedRequests: async (userId) => {
    return await prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findSentRequests: async (userId) => {
    return await prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: 'PENDING',
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findByPair: async (operatorUserId, targetUserId) => {
    return await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: operatorUserId, receiverId: targetUserId },
          { requesterId: targetUserId, receiverId: operatorUserId },
        ],
      },
    });
  },

  findAcceptedByPair: async (userId, targetUserId) => {
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

  findPendingRequest: async (requesterId, receiverId) => {
    return await prisma.friendship.findFirst({
      where: {
        requesterId,
        receiverId,
        status: 'PENDING',
      },
    });
  },

  findFriends: async (userId) => {
    return await prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  createFriendRequest: async (requesterId, receiverId) => {
    return await prisma.friendship.create({
      data: { requesterId, receiverId },
    });
  },

  updateStatus: async (id, status) => {
    return await prisma.friendship.update({
      where: { id },
      data: { status },
    });
  },

  deleteFriendship: async (id) => {
    return await prisma.friendship.delete({ where: { id } });
  },

  resetFriendRequest: async (id, requesterId, receiverId) => {
    return await prisma.friendship.update({
      where: { id },
      data: {
        status: 'PENDING',
        requesterId, // 更新成這次發送的人
        receiverId,
      },
    });
  },
};

export default FriendshipModel;
