import prisma from '../config/db';

const friendshipModel = {
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

  findPendingRequest: async (requesterId, receiverId) => {
    return await prisma.friendship.findFirst({
      where: {
        requesterId,
        receiverId,
        status: 'PENDING',
      },
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
};

export default friendshipModel;
