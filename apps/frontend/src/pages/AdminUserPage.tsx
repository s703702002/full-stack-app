import { AdminUserPage, initApi } from '@full-stack-app/features';
import { privateApi } from '../api';
import { useAuthUser } from '../context/useAuth';
import { useToast } from '../hooks/useToast';

initApi(privateApi);

export default function ManageUserPage() {
  const user = useAuthUser();
  const { error } = useToast();

  return (
    <AdminUserPage currentUser={user} onErrorToast={(msg) => error(msg)} />
  );
}
