import { useState } from 'react';
import { privateApi } from '../api';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import LikersModal from '../components/LikersModal';
import useApiAction from '../hooks/useApiAction';

export default function MessageBoard() {
  const [showLikersModal, setShowLikersModal] = useState(false);
  const { data, execute: getAllPosts } = useApiAction(
    () => privateApi.get('/api/posts'),
    {
      runOnMount: true,
      successToast: false,
    },
  );
  const {
    data: currentLikersData,
    loading,
    execute: getCurrentLikers,
  } = useApiAction((postId) => privateApi.get(`/api/posts/${postId}/likes`), {
    successToast: false,
  });
  const { execute: createPost } = useApiAction((payload) =>
    privateApi.post('/api/posts', payload),
  );
  const { execute: editPost } = useApiAction((payload) =>
    privateApi.put(`/api/posts/${payload.id}`, payload),
  );
  const { execute: deletePost } = useApiAction((postId) =>
    privateApi.delete(`/api/posts/${postId}`),
  );
  const { execute: toggleLikePost } = useApiAction((postId) =>
    privateApi.post(`/api/posts/${postId}/like`),
  );

  const posts = data?.data?.posts ?? [];
  const currentLikers = currentLikersData?.data?.likers ?? [];

  const handleCreate = async (content) => {
    const { success } = await createPost({ content });
    if (success) {
      getAllPosts();
    }
  };

  const handleSaveEdit = async (id, updatedContent) => {
    const { success } = await editPost({ id: id, content: updatedContent });
    if (success) {
      getAllPosts();
    }
  };

  const handleDelete = async (id) => {
    if (!globalThis.confirm('確定要刪除這篇留言嗎？')) return;
    const { success } = await deletePost(id);
    if (success) {
      getAllPosts();
    }
  };

  const handleToggleLike = async (id) => {
    const { success } = await toggleLikePost(id);
    if (success) {
      getAllPosts();
    }
  };

  const handleShowLikers = async (postId) => {
    setShowLikersModal(true);
    getCurrentLikers(postId);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 relative">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">留言板</h2>

      <PostForm onSubmit={handleCreate} />

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onSaveEdit={handleSaveEdit}
            onDelete={handleDelete}
            onToggleLike={handleToggleLike}
            onShowLikers={handleShowLikers}
          />
        ))}
        {posts.length === 0 && (
          <p className="text-center text-slate-500 py-10">
            目前還沒有留言，來當第一個吧！
          </p>
        )}
      </div>

      <LikersModal
        isOpen={showLikersModal}
        onClose={() => setShowLikersModal(false)}
        likers={currentLikers}
        isLoading={loading}
      />
    </div>
  );
}
