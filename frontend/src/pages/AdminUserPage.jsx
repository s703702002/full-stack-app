import { privateApi } from '../api';
import { useAuth } from '../context/useAuth';
import { canEditTargetUser } from '../utils/roleHelper';
import useApiAction from '../hooks/useApiAction';

const getUsersApi = () => privateApi.get('/api/users');

export default function AdminUserPage() {
  const { user } = useAuth();
  const {
    execute: fetchUsers,
    message,
    loading,
    data,
  } = useApiAction(getUsersApi, { successToast: false, runOnMount: true });
  const { execute } = useApiAction((payload) =>
    privateApi.put(`/api/users/${payload.targetUserId}/role`, payload),
  );

  const handleRoleChange = async (targetUserId, newRoleName) => {
    await execute({ targetUserId, newRoleName });
    await fetchUsers();
  };

  if (loading)
    return <div className="text-center mt-20 text-slate-500">載入中...</div>;

  if (message)
    return (
      <div className="text-center mt-20 text-red-500 font-bold">{message}</div>
    );

  const users = data?.users ?? [];

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">
            後台管理：使用者權限
          </h2>
          <p className="text-slate-500 mt-2">請謹慎指派管理員 (Admin) 權限。</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">帳號 (Username)</th>
              <th className="p-4 font-medium">姓名 (Name)</th>
              <th className="p-4 font-medium">當前角色</th>
              <th className="p-4 font-medium">操作設定</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((targetUser) => {
              const hasPermission = canEditTargetUser(
                user.roleName,
                targetUser.roleName,
              );

              return (
                <tr
                  key={targetUser.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-slate-500">#{targetUser.id}</td>
                  <td className="p-4 font-medium text-slate-800">
                    {targetUser.username}
                  </td>
                  <td className="p-4 text-slate-600">{targetUser.name}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        targetUser.roleName === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : targetUser.roleName === 'editor'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {targetUser.roleName || '無角色'}
                    </span>
                  </td>
                  <td className="p-4">
                    {hasPermission ? (
                      <select
                        defaultValue={targetUser.roleName}
                        onChange={(e) =>
                          handleRoleChange(targetUser.id, e.target.value)
                        }
                        className="border border-slate-300 rounded p-1"
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded cursor-not-allowed">
                        🔒 {targetUser.roleName}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
