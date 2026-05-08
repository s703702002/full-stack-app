import prisma from '../config/db.js';

const PermissionModel = {
  getByRoleId: async (roleId) => {
    return await prisma.permission.findMany({
      where: {
        roles: {
          some: {
            roleId: Number(roleId),
          },
        },
      },
    });
  },

  checkUserHasPermission: async (userId, permissionName) => {
    const count = await prisma.rolePermission.count({
      where: {
        role: {
          users: { some: { id: userId } },
        },
        permission: { name: permissionName },
      },
    });
    return count > 0;
  },
};

export default PermissionModel;
