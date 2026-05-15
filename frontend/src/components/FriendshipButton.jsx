import { useState } from 'react';
import useApiAction from '../hooks/useApiAction';
import { privateApi } from '../api';

export default function FriendshipButton({ targetUserId, initialStatus }) {
  const [state, setState] = useState(initialStatus?.state);

  const { execute: sendRequest, loading } = useApiAction(() =>
    privateApi.post(`/api/friend-requests/${targetUserId}`),
  );

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
      onClick={async () => {
        const { success } = await sendRequest();
        if (success) setState('PENDING');
      }}
      disabled={loading}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
    >
      {loading ? '傳送中...' : '加好友'}
    </button>
  );
}
