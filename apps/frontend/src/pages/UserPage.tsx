import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useLocation, useParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import CreatePostBox from '../components/CreatePostBox';
import UserAlbum from '../components/UserAlbum';
import { Avatar, cn } from '@full-stack-app/ui';
import FriendshipButton from '../components/FriendshipButton';
import {
  getUserProfile,
  getUserTimeline,
  userKeys,
} from '../queries/userQueries';
import { getFriendshipStatus } from '../queries/friendshipQueries';
import { useRequiredParams } from '../hooks/useRequiredParams';

export default function UserPage() {
  const userId = useRequiredParams('userId');
  const location = useLocation();
  const { tab } = useParams<{ tab?: string }>();
  const queryClient = useQueryClient();

  // 判斷當前路徑是否包含相簿 (例如 /profile/:userId/album 或 tab === 'album')
  const activeTab =
    tab === 'album' || location.pathname.endsWith('/album') ? 'album' : 'posts';

  const { data: profile } = useQuery(getUserProfile(userId));

  const { data: friendshipStatus } = useQuery({
    ...getFriendshipStatus(userId),
    enabled: !!userId && profile?.isOwnProfile === false,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...getUserTimeline(userId),
      enabled: !!userId && activeTab === 'posts',
    });

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  if (!profile) return <div className="text-center py-12 text-slate-400">載入中...</div>;

  const isFriend = friendshipStatus === 'ACCEPTED';
  const canCreatePost = profile.isOwnProfile || isFriend;

  const invalidateTimeline = () =>
    queryClient.invalidateQueries({ queryKey: userKeys.timeline(userId) });

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 border border-slate-100">
        <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-cover bg-center" />
        <div className="px-6 relative pb-6">
          <Avatar
            avatarUrl={profile.avatarUrl}
            name={profile.name}
            className="w-24 h-24 object-cover absolute -top-12 border-4 border-white rounded-full shadow-md"
          />
          <div className="mt-2 pt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {profile.name}
              </h1>
              <p className="text-slate-500 text-sm">@{profile.username}</p>
              <p className="mt-3 text-slate-700 text-sm">
                {profile.bio || '這個人很懶，什麼都沒寫。'}
              </p>
            </div>
            {!profile.isOwnProfile && friendshipStatus && (
              <div className="shrink-0">
                <FriendshipButton
                  targetUserId={userId}
                  initialStatus={friendshipStatus}
                />
              </div>
            )}
          </div>
        </div>

        {/* UserPage Navigation Tabs */}
        <div className="flex items-center border-t border-slate-100 px-6 bg-slate-50/50">
          <Link
            to={`/profile/${userId}`}
            className={cn(
              'px-5 py-3.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2',
              activeTab === 'posts'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50',
            )}
          >
            <span>📝</span>
            <span>貼文與動態</span>
          </Link>
          <Link
            to={`/profile/${userId}/album`}
            className={cn(
              'px-5 py-3.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2',
              activeTab === 'album'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50',
            )}
          >
            <span>🖼️</span>
            <span>相簿</span>
          </Link>
        </div>
      </div>

      {/* Tab Content Rendering */}
      {activeTab === 'album' ? (
        /* Album View Path */
        <UserAlbum userId={userId} isOwnProfile={profile.isOwnProfile} />
      ) : (
        /* Posts Timeline Path */
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-slate-700 px-1">貼文</h2>

          {canCreatePost && (
            <CreatePostBox
              currentUser={profile}
              onPostCreated={invalidateTimeline}
            />
          )}

          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl text-center py-12 text-slate-400 border border-slate-100 shadow-sm">
              目前沒有貼文
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={invalidateTimeline}
                onEdit={invalidateTimeline}
                onToggleLike={invalidateTimeline}
              />
            ))
          )}

          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-3 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-sm transition-all"
            >
              {isFetchingNextPage ? '載入中...' : '載入更多'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
