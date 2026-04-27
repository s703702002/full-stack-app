/**
 * 清洗 User 物件，只保留前端需要的、安全的欄位
 */
export const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    roleId: user.roleId,
    roleName: user.role?.name,
    avatarUrl: user.avatarUrl,
  };
};
