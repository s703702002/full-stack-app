import { AdminUserPage } from '@full-stack-app/features';
import { useAuthUser } from '../context/useAuth';
import { useToast } from '../hooks/useToast';

export default function ManageUserPage() {
  const user = useAuthUser();
  const { error } = useToast();

  return (
    <AdminUserPage currentUser={user} onErrorToast={(msg) => error(msg)} />
  );
}
