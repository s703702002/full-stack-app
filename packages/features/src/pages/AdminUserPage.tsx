import { useState } from 'react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { canEditUser } from '../utils/roleHelper';
import BanModal from '../components/BanModal';
import { UserDTO } from '@full-stack-app/shared';
import { cn } from '@full-stack-app/ui';

const getRoleLabelStyles = (roleName: string) =>
  ({
    superadmin: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    editor: 'bg-green-100 text-green-800',
    viewer: 'bg-slate-100 text-slate-600',
  })[roleName] ?? 'bg-slate-100 text-slate-600';

export interface AdminUserPageProps {
  currentUser: UserDTO | null;
  onErrorToast: (message: string) => void;
}

export default function AdminUserPage({
  currentUser,
  onErrorToast,
}: Readonly<AdminUserPageProps>) {
  const [banTarget, setBanTarget] = useState<UserDTO | null>(null);

  const { users, isLoading, isError, changeRole, banUser, liftBan } =
    useAdminUsers();

  if (isLoading || !currentUser) {
    return <div className="text-center mt-20 text-slate-500">載入中...</div>;
  }

  if (isError) {
    return (
      <div className="text-center mt-20 text-red-500 font-bold">載入失敗</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">
          後台管理：使用者權限
        </h2>
        <p className="text-slate-500 mt-2">請謹慎指派管理員 (Admin) 權限。</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">帳號</th>
                <th className="p-4 font-medium">姓名</th>
                <th className="p-4 font-medium">角色</th>
                <th className="p-4 font-medium">狀態</th>
                <th className="p-4 font-medium">角色設定</th>
                <th className="p-4 font-medium">Ban 操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const hasPermission = canEditUser(
                  currentUser.roleName ?? '',
                  u.roleName ?? '',
                );

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td
                      className="p-4 text-slate-500 max-w-[120px] truncate"
                      title={u.id}
                    >
                      {u.id}
                    </td>
                    <td
                      className="p-4 font-medium text-slate-800 max-w-[120px] truncate"
                      title={u.username}
                    >
                      {`@${u.username}`}
                    </td>
                    <td className="p-4 text-slate-600">{u.name}</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-bold',
                          getRoleLabelStyles(u.roleName!),
                        )}
                      >
                        {u.roleName || '無角色'}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.activeBan ? (
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 cursor-help"
                          title={`原因：${u.activeBan.reason}\n到期：${u.activeBan.expiresAt ? new Date(u.activeBan.expiresAt).toLocaleString() : '永久'}`}
                        >
                          已停用
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">正常</span>
                      )}
                    </td>
                    <td className="p-4">
                      {hasPermission ? (
                        <select
                          defaultValue={u.roleName}
                          onChange={(e) =>
                            changeRole(
                              {
                                targetUserId: u.id,
                                newRoleName: e.target.value,
                              },
                              { onError: () => onErrorToast('角色變更失敗') },
                            )
                          }
                          className="border border-slate-300 rounded p-1"
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded cursor-not-allowed">
                          🔒 {u.roleName}
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {u.activeBan ? (
                        <button
                          onClick={() =>
                            liftBan(u.id, {
                              onError: () => onErrorToast('解除停用失敗'),
                            })
                          }
                          className="text-sm text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-3 py-1 rounded transition-colors"
                        >
                          解除停用
                        </button>
                      ) : (
                        <button
                          onClick={() => setBanTarget(u)}
                          className="text-sm text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                        >
                          停用
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {banTarget && (
        <BanModal
          target={banTarget}
          onConfirm={({ reason, durationMinutes }) =>
            banUser(
              { userId: banTarget.id, reason, durationMinutes },
              {
                onSuccess: () => setBanTarget(null),
                onError: () => onErrorToast('停用失敗'),
              },
            )
          }
          onClose={() => setBanTarget(null)}
        />
      )}
    </div>
  );
}
