import { hashString } from '../utils/hashHelper.js';
import prisma from '../config/db.js';
import type { Permission } from '../generated/client.js';

async function main() {
  console.log('🌱 開始種植系統核心權限與角色...');

  // 定義並建立所有權限 (Permissions)
  const permissionsData = [
    { name: 'post:create', description: '建立留言' },
    { name: 'post:edit:own', description: '編輯自己的留言' },
    { name: 'post:edit:any', description: '編輯任何人的留言 (管理員)' },
    { name: 'post:delete:own', description: '刪除自己的留言' },
    { name: 'post:delete:any', description: '刪除任何人的留言 (管理員)' },
    { name: 'user:manage', description: '管理使用者權限' },
  ];

  const permissions: Record<string, Permission> = {};
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
      permissions: [
        'post:create',
        'post:edit:any',
        'post:delete:any',
        'user:manage',
      ],
    },
    {
      name: 'admin',
      description: '管理員',
      permissions: [
        'post:create',
        'post:edit:own',
        'post:delete:any',
        'user:manage',
      ],
    },
    {
      name: 'editor',
      description: '編輯者',
      permissions: ['post:create', 'post:edit:own', 'post:delete:own'],
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
  const existingRoot = await prisma.user.findUnique({
    where: { username: 'root' },
  });

  if (existingRoot) {
    console.log('⚡ root 帳號已存在，跳過建立');
  } else {
    const hashedRootPassword = await hashString('root123', 10);
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'superadmin' },
    });

    if (superAdminRole) {
      await prisma.user.create({
        data: {
          username: 'root',
          password: hashedRootPassword,
          name: '系統創世神',
          roleId: superAdminRole.id,
        },
      });
    }

    console.log('✅ 預設 root 帳號建立完成');
  }

  console.log('🚀 所有核心資料種植完畢！');
}

// async function seedPostData() {
//   console.log('🌱 開始種植測試貼文資料...');
//   const dummyUserId = 'cmp4uouz80000i40igkjd6e7r';

//   for (let i = 0; i < 5000; i++) {
//     await prisma.post.create({
//       data: {
//         userId: dummyUserId,
//         targetUserId: dummyUserId,
//         content: `這是一則測試留言 #${i + 1}，用來測試分頁功能與資料庫效能。`,
//       },
//     });

//     await new Promise((resolve) => setTimeout(resolve, 10));
//   }

//   console.log('✅ 測試貼文資料建立完成...');
// }

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
