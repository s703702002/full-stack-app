import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { privateApi } from '../api';
import { useToast } from '../hooks/useToast';

export default function FriendshipButton({ targetUserId, initialStatus }) {
  const [state, setState] = useState(initialStatus?.state);
  const { error } = useToast();

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: () =>
      privateApi
        .post(`/api/friend-requests/${targetUserId}`)
        .then((r) => r.data),
    onSuccess: () => setState('PENDING'),
    onError: () => error('送出好友申請失敗'),
  });

  if (state === 'ACCEPTED') return null;

  if (state === 'PENDING' || state === 'SENT') {
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
      onClick={() => sendRequest()}
      disabled={isPending}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
    >
      {isPending ? '傳送中...' : '加好友'}
    </button>
  );
}
