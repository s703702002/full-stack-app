import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from '@tanstack/react-query';
import { Avatar, cn } from '@full-stack-app/ui';
import { formatDateTime } from '../utils/format';
import { useToast } from '../hooks/useToast';
import {
  friendshipKeys,
  getFriends,
  getReceivedRequests,
  getSentRequests,
  respondFriendRequestMutation,
  removeFriendMutation,
} from '../queries/friendshipQueries';
import { FriendDTO, FriendRequestDTO } from '@full-stack-app/shared';

interface FriendCardProps {
  friend: FriendDTO;
  onRemove: (userId: string) => void;
  removing?: boolean;
}

function FriendCard({ friend, onRemove, removing }: FriendCardProps) {
  const { user, since } = friend;

  const sinceDate = since ? formatDateTime(since) : null;

  const handleRemoveClick = () => {
    if (confirm('確定解除？')) {
      onRemove(user.id);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 transition-all duration-300',
        removing
          ? 'opacity-0 translate-x-4 overflow-hidden'
          : 'opacity-100 translate-x-0',
      )}
    >
      <Link to={`/profile/${user.id}`}>
        <Avatar name={user.name} avatarUrl={user.avatarUrl} />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm">{user.name}</span>
          <span className="text-xs text-gray-400">@{user.username}</span>
        </div>
        {user.bio && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{user.bio}</p>
        )}
        {sinceDate && (
          <p className="text-xs text-gray-400 mt-0.5">好友自 {sinceDate}</p>
        )}
      </div>

      <div className="shrink-0">
        <button
          onClick={handleRemoveClick}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          解除好友
        </button>
      </div>
    </div>
  );
}

interface ReceivedCardProps {
  request: FriendRequestDTO;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  removing?: boolean;
}

function ReceivedCard({
  request,
  onAccept,
  onReject,
  removing,
}: ReceivedCardProps) {
  const { user, createdAt } = request;
  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 transition-all duration-300',
        removing
          ? 'opacity-0 translate-x-4 max-h-0 overflow-hidden py-0 mb-0'
          : 'opacity-100 translate-x-0',
      )}
    >
      <Avatar name={user.name} avatarUrl={user.avatarUrl} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm">{user.name}</span>
          <span className="text-xs text-gray-400">@{user.username}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{user.bio}</p>
        {createdAt && (
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDateTime(createdAt)}
          </p>
        )}
      </div>

      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onReject(request.id)}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          拒絕
        </button>
        <button
          onClick={() => onAccept(request.id)}
          className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
        >
          接受
        </button>
      </div>
    </div>
  );
}

interface SentCardProps {
  request: FriendRequestDTO;
}

function SentCard({ request }: SentCardProps) {
  const { user, createdAt } = request;

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4">
      <Avatar name={user.name} avatarUrl={user.avatarUrl} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm">{user.name}</span>
          <span className="text-xs text-gray-400">@{user.username}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{user.bio}</p>
        {createdAt && (
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDateTime(createdAt)}
          </p>
        )}
      </div>

      <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 shrink-0">
        申請中
      </span>
    </div>
  );
}

type TabKey = 'friends' | 'received' | 'sent';

export default function FriendRequestsPage() {
  const [tab, setTab] = useState<TabKey>('friends');
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: friends = [] } = useQuery(getFriends());
  const { data: received = [] } = useQuery(getReceivedRequests());
  const { data: sent = [] } = useQuery(getSentRequests());

  const invalidate = (...keys: readonly QueryKey[]) =>
    keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

  const { mutate: respond } = useMutation({
    ...respondFriendRequestMutation(),
    onSuccess: (_, { action }) => {
      invalidate(friendshipKeys.received());
      if (action === 'accept') {
        invalidate(friendshipKeys.friends());
        success('已接受好友申請');
      } else {
        success('已拒絕好友申請');
      }
    },
    onError: (err) => error(err.response?.data?.message || '操作失敗'),
  });

  const { mutate: removeFriend } = useMutation({
    ...removeFriendMutation(),
    onSuccess: () => {
      invalidate(friendshipKeys.friends());
      success('已解除好友關係');
    },
    onError: (err) => error(err.response?.data?.message || '解除好友失敗'),
  });

  const handleAccept = (id: string) => respond({ id, action: 'accept' });
  const handleReject = (id: string) => respond({ id, action: 'reject' });
  const handleRemoveFriend = (userId: string) => removeFriend(userId);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'friends', label: '好友列表', count: friends.length },
    { key: 'received', label: '收到的申請', count: received.length },
    { key: 'sent', label: '送出的申請', count: sent.length },
  ];

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
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'px-4 py-2.5 text-sm transition-all border-b-2 -mb-px',
              tab === key
                ? 'border-gray-900 text-gray-900 font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-600',
            )}
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

      {tab === 'friends' && (
        <div className="flex flex-col gap-3">
          {friends.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-3xl mb-3">🤝</div>
              <p className="text-sm">還沒有好友，去交朋友吧！</p>
            </div>
          ) : (
            friends.map((friend) => (
              <FriendCard
                key={friend.friendshipId}
                friend={friend}
                onRemove={handleRemoveFriend}
              />
            ))
          )}
        </div>
      )}

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
