import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../../api';
import type { AxiosError } from 'axios';
import type {
  UserDTO,
  ApiResponse,
  ApiErrorResponse,
  CreateUserBanBody,
  UpdateRoleBody,
} from '@full-stack-app/shared';

export const adminUserKeys = {
  all: ['admin-feature', 'users'] as const,
};

export interface UpdateRolePayload extends UpdateRoleBody {
  targetUserId: string;
}

export interface BanUserPayload extends CreateUserBanBody {
  userId: string;
}

export function useAdminUsers() {
  const queryClient = useQueryClient();
  const api = getApi();

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: adminUserKeys.all });

  const usersQuery = useQuery<UserDTO[], AxiosError<ApiErrorResponse>>({
    queryKey: adminUserKeys.all,
    queryFn: () => api.get('/api/users').then((res) => res.data.data.users),
  });

  const changeRoleMutation = useMutation({
    mutationFn: (payload: UpdateRolePayload) =>
      api
        .put<ApiResponse>(`/api/users/${payload.targetUserId}/role`, payload)
        .then((r) => r.data),
    onSuccess: invalidateUsers,
  });

  const banUserMutation = useMutation({
    mutationFn: (payload: BanUserPayload) =>
      api
        .post<ApiResponse>(`/api/users/${payload.userId}/ban`, payload)
        .then((r) => r.data),
    onSuccess: invalidateUsers,
  });

  const liftBanMutation = useMutation<
    ApiResponse<Record<string, never>>,
    AxiosError<ApiErrorResponse>,
    string
  >({
    mutationFn: (userId) =>
      api.delete(`/api/users/${userId}/ban`).then((r) => r.data),
    onSuccess: invalidateUsers,
  });

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    changeRole: changeRoleMutation.mutate,
    banUser: banUserMutation.mutate,
    liftBan: liftBanMutation.mutate,
  };
}
