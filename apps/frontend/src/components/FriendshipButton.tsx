import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import { sendFriendRequestMutation } from '../queries/friendshipQueries';
import { FriendshipStatus } from '@full-stack-app/shared';

interface FriendshipButtonProps {
  targetUserId: string;
  initialStatus?: FriendshipStatus;
}

export default function FriendshipButton({
  targetUserId,
  initialStatus,
}: Readonly<FriendshipButtonProps>) {
  const [state, setState] = useState<FriendshipStatus | undefined>(
    initialStatus,
  );
  const { error } = useToast();

  const { mutate: sendRequest, isPending } = useMutation({
    ...sendFriendRequestMutation(),
    onSuccess: () => setState('PENDING'),
    onError: (err) => error(err.response?.data?.message || '送出好友申請失敗'),
  });

  if (state === 'ACCEPTED') return null;

  if (state === 'PENDING') {
    return (
      <button
        disabled
        className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed"
      >
        申請中
      </button>
    );
  }

  return (
    <button
      onClick={() => sendRequest(targetUserId)}
      disabled={isPending}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
    >
      {isPending ? '傳送中...' : '加好友'}
    </button>
  );
}
