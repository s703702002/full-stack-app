import prisma from '../config/db.js';

const PermissionModel = {
  checkUserHasPermission: async (userId, permissionName) => {
    const count = await prisma.rolePermission.count({
      where: {
        role: {
          users: { some: { id: Number(userId) } },
        },
        permission: { name: permissionName },
      },
    });
    return count > 0;
  },
};

export default PermissionModel;
