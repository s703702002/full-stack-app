import { useState } from 'react';
import Avatar from '../components/Avatar';
import useApiAction from '../hooks/useApiAction';
import { privateApi } from '../api';

function ReceivedCard({ request, onAccept, onReject, removing }) {
  const { user } = request;
  return (
    <div
      className={`flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 transition-all duration-300 ${
        removing
          ? 'opacity-0 translate-x-4 max-h-0 overflow-hidden py-0 mb-0'
          : 'opacity-100 translate-x-0'
      }`}
    >
      <Avatar name={user.name} avatarUrl={user.avatarUrl} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm">{user.name}</span>
          <span className="text-xs text-gray-400">@{user.username}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{user.bio}</p>
        <p className="text-xs text-gray-400 mt-0.5">{user.sentAt}</p>
      </div>

      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onReject(user.id)}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          拒絕
        </button>
        <button
          onClick={() => onAccept(user.id)}
          className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
        >
          接受
        </button>
      </div>
    </div>
  );
}

function SentCard({ request }) {
  const { user } = request;

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4">
      <Avatar name={user.name} avatarUrl={user.avatarUrl} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm">{user.name}</span>
          <span className="text-xs text-gray-400">@{user.username}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{user.bio}</p>
        <p className="text-xs text-gray-400 mt-0.5">{user.sentAt}</p>
      </div>

      <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 shrink-0">
        申請中
      </span>
    </div>
  );
}

export default function FriendRequestsPage() {
  const [tab, setTab] = useState('received');
  const { data: receivedData } = useApiAction(
    () => privateApi.get('/api/friend-requests/received'),
    { runOnMount: true, successToast: false },
  );
  const { data: sentData } = useApiAction(
    () => privateApi.get('/api/friend-requests/sent'),
    { runOnMount: true, successToast: false },
  );
  const { execute: respond } = useApiAction((payload) =>
    privateApi.patch(`/api/friend-requests/${payload.id}`, payload),
  );

  const received = receivedData?.data?.requests ?? [];
  const sent = sentData?.data?.requests ?? [];

  const handleAccept = (id) => {
    respond({ id, action: 'accept' });
  };

  const handleReject = (id) => {
    respond({ id, action: 'reject' });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-gray-900">好友申請</h1>
        {received.length > 0 && (
          <span className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-0.5">
            {received.length} 個待處理
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100 mb-5">
        {[
          { key: 'received', label: '收到的申請', count: received.length },
          { key: 'sent', label: '送出的申請', count: sent.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm transition-all border-b-2 -mb-px ${
              tab === key
                ? 'border-gray-900 text-gray-900 font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {label}
            {count > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Received Tab */}
      {tab === 'received' && (
        <div className="flex flex-col gap-3">
          {received.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-3xl mb-3">👋</div>
              <p className="text-sm">沒有待處理的好友申請</p>
            </div>
          ) : (
            received.map((request) => (
              <ReceivedCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      )}

      {/* Sent Tab */}
      {tab === 'sent' && (
        <div className="flex flex-col gap-3">
          {sent.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-3xl mb-3">📨</div>
              <p className="text-sm">沒有送出中的好友申請</p>
            </div>
          ) : (
            sent.map((request) => (
              <SentCard key={request.id} request={request} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
