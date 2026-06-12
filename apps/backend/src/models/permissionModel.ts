import prisma from '../config/db.js';

const PermissionModel = {
  getByRoleId: async (roleId: string | number) => {
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

  checkUserHasPermission: async (userId: string, permissionName: string) => {
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
