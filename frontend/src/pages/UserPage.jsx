import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import useApiAction from '../hooks/useApiAction';
import { privateApi } from '../api';
import CreatePostBox from '../components/CreatePostBox';

export default function UserPage() {
  const { userId } = useParams();
  const { data: profileData } = useApiAction(
    () => privateApi.get(`/api/users/${userId}`),
    { runOnMount: true, successToast: false },
  );
  const { data: postsData, execute } = useApiAction(
    () => privateApi.get(`/api/users/${userId}/posts`),
    { runOnMount: true, successToast: false },
  );

  const profile = profileData?.data?.user;
  const posts = postsData?.data?.posts ?? [];

  if (!profile) return <div>載入中...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* 🖼️ 上半部：封面與個人資訊 (Profile Header) */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {/* 封面圖 */}
        <div
          className="h-48 bg-slate-200 bg-cover bg-center"
          style={{
            backgroundImage: `url(${profile.coverUrl || '/default-cover.jpg'})`,
          }}
        />

        <div className="px-6 relative pb-6">
          {/* 大頭貼 (往上浮動) */}
          <div className="absolute -top-12 border-4 border-white rounded-full">
            <img
              src={profile.avatarUrl || '/default-avatar.png'}
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>

          {/* 名字與自我介紹 */}
          <div className={`mt-2 pt-16`}>
            <h1 className="text-2xl font-bold text-slate-800">
              {profile.name}
            </h1>
            <p className="text-slate-500">@{profile.username}</p>
            <p className="mt-3 text-slate-700">
              {profile.bio || '這個人很懶，什麼都沒寫。'}
            </p>
          </div>
        </div>
      </div>

      {/* 📝 下半部：歷史貼文 (Timeline) */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg text-slate-700 px-1">貼文</h2>

        {profile.isOwnProfile && (
          <CreatePostBox currentUser={profile} onPostCreated={execute} />
        )}

        {posts.length === 0 ? (
          <div className="text-center py-10 text-slate-400">目前沒有貼文</div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={execute}
              onEdit={execute}
              onToggleLike={execute}
            />
          ))
        )}
      </div>
    </div>
  );
}
