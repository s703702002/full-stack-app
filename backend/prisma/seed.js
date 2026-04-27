import { hashString } from '../utils/hashHelper.js';
import prisma from '../config/db.js';

async function main() {
  console.log('🌱 開始種植系統核心權限與角色...');

  // 1. 定義並建立所有權限 (Permissions)
  const permissionsData = [
    { name: 'post:create', description: '建立留言' },
    { name: 'post:delete', description: '刪除留言' },
    { name: 'user:manage', description: '管理使用者權限' },
  ];

  const permissions = {};
  for (const p of permissionsData) {
    const createdP = await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
    permissions[p.name] = createdP;
    console.log(`✅ 權限已就緒: ${p.name}`);
  }

  // 2. 定義角色及其對應的權限
  const rolesConfig = [
    {
      name: 'superadmin',
      description: '系統最高權限管理員',
      permissions: ['post:create', 'post:delete', 'user:manage'],
    },
    {
      name: 'admin',
      description: '管理員',
      permissions: ['post:create', 'post:delete', 'user:manage'],
    },
    {
      name: 'editor',
      description: '編輯者',
      permissions: ['post:create', 'post:delete'],
    },
    {
      name: 'viewer',
      description: '一般瀏覽者',
      permissions: ['post:create'],
    },
  ];

  for (const r of rolesConfig) {
    // 建立角色
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name, description: r.description },
    });

    // 建立角色與權限的關聯 (RolePermission)
    for (const pName of r.permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permissions[pName].id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permissions[pName].id,
        },
      });
    }
    console.log(`✅ 角色設定完成: ${r.name}`);
  }

  // 3. 建立預設管理員 (避免登入不了)
  const hashedRootPassword = await hashString('root123', 10);
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'superadmin' },
  });

  await prisma.user.upsert({
    where: { username: 'root' }, // 🚀 系統的唯一識別碼
    update: {}, // 如果 root 已經存在，就不做任何事，保護他的資料
    create: {
      username: 'root',
      password: hashedRootPassword,
      name: '系統創世神',
      roleId: superAdminRole.id,
    },
  });

  console.log('🚀 所有核心資料種植完畢！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
