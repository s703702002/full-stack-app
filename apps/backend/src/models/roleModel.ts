import prisma from '../config/db.js';

const RoleModel = {
  findByName: async (name: string) => {
    return await prisma.role.findUnique({
      where: { name },
    });
  },

  findAll: async () => {
    return await prisma.role.findMany();
  },

  findById: async (id: string | number) => {
    return await prisma.role.findUnique({
      where: { id: Number(id) },
    });
  },
};

export default RoleModel;
