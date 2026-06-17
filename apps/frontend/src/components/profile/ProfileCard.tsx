import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthUser } from '../../context/useAuth';
import { useToast } from '../../hooks/useToast';
import { userKeys, updateProfileMutation } from '../../queries/userQueries';
import { ProfileCard as SharedProfileCard } from '@full-stack-app/ui';

export default function ProfileCard() {
  const user = useAuthUser();
  const { error, success } = useToast();
  const queryClient = useQueryClient();

  const { mutateAsync: updateProfile, isPending } = useMutation({
    ...updateProfileMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });

  return (
    <SharedProfileCard
      user={user}
      isUpdating={isPending}
      onSave={updateProfile}
      onSuccess={success}
      onError={(msg) => error(msg)}
    />
  );
}
