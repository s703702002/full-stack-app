import { useParams } from 'react-router-dom';
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import PostCard from '../components/PostCard';
import CreatePostBox from '../components/CreatePostBox';
import Avatar from '../components/Avatar';
import FriendshipButton from '../components/FriendshipButton';
import {
  getUserProfile,
  getUserTimeline,
  userKeys,
} from '../queries/userQueries';
import { getFriendshipStatus } from '../queries/friendshipQueries';

export default function UserPage() {
  const { userId } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery(getUserProfile(userId!));

  const { data: friendshipStatus } = useQuery({
    ...getFriendshipStatus(userId!),
    enabled: !!userId && profile?.isOwnProfile === false,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...getUserTimeline(userId!),
      enabled: !!userId,
    });

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  if (!profile) return <div>載入中...</div>;

  const isFriend = friendshipStatus === 'ACCEPTED';
  const canCreatePost = profile.isOwnProfile || isFriend;

  const invalidateTimeline = () =>
    queryClient.invalidateQueries({ queryKey: userKeys.timeline(userId!) });

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="h-48 bg-slate-200 bg-cover bg-center" />
        <div className="px-6 relative pb-6">
          <Avatar
            avatarUrl={profile.avatarUrl}
            name={profile.name}
            className="w-24 h-24 object-cover absolute -top-12 border-4 border-white rounded-full"
          />
          <div className="mt-2 pt-16">
            <h1 className="text-2xl font-bold text-slate-800">
              {profile.name}
            </h1>
            <p className="text-slate-500">@{profile.username}</p>
            <p className="mt-3 text-slate-700">
              {profile.bio || '這個人很懶，什麼都沒寫。'}
            </p>
          </div>
          {!profile.isOwnProfile && friendshipStatus && (
            <div className="mt-2">
              <FriendshipButton
                targetUserId={userId!}
                initialStatus={friendshipStatus}
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-bold text-lg text-slate-700 px-1">貼文</h2>

        {canCreatePost && (
          <CreatePostBox
            currentUser={profile}
            onPostCreated={invalidateTimeline}
          />
        )}

        {posts.length === 0 ? (
          <div className="text-center py-10 text-slate-400">目前沒有貼文</div>
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
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full py-3 text-slate-500 hover:text-slate-700"
          >
            {isFetchingNextPage ? '載入中...' : '載入更多'}
          </button>
        )}
      </div>
    </div>
  );
}
