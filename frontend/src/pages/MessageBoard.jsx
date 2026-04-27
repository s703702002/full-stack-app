import { useState, useEffect, useCallback } from 'react';
import { privateApi } from '../api';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import LikersModal from '../components/LikersModal';
import { useToast } from '../hooks/useToast';

export default function MessageBoard() {
  const [posts, setPosts] = useState([]);
  const [showLikersModal, setShowLikersModal] = useState(false);
  const [currentLikers, setCurrentLikers] = useState([]);
  const [isLoadingLikers, setIsLoadingLikers] = useState(false);
  const { error } = useToast();

  const fetchPosts = useCallback(async () => {
    try {
      const res = await privateApi.get('/api/posts');
      if (res.data.success) setPosts(res.data.posts);
    } catch (err) {
      console.error('無法載入留言', err);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreate = async (content) => {
    try {
      await privateApi.post('/api/posts', { content });
      fetchPosts();
    } catch (e) {
      error(e.response?.data?.message || '發布失敗');
    }
  };

  const handleSaveEdit = async (id, updatedContent) => {
    try {
      await privateApi.put(`/api/posts/${id}`, { content: updatedContent });
      fetchPosts();
    } catch (e) {
      error(e.response?.data?.message || '更新失敗');
    }
  };

  const handleDelete = async (id) => {
    if (!globalThis.confirm('確定要刪除這篇留言嗎？')) return;
    try {
      await privateApi.delete(`/api/posts/${id}`);
      fetchPosts();
    } catch (e) {
      error(e.response?.data?.message || '刪除失敗');
    }
  };

  const handleToggleLike = async (id) => {
    try {
      await privateApi.post(`/api/posts/${id}/like`);
      fetchPosts();
    } catch (e) {
      error(e.response?.data?.message || '點讚操作失敗');
    }
  };

  const handleShowLikers = async (postId) => {
    setShowLikersModal(true);
    setIsLoadingLikers(true);
    setCurrentLikers([]);
    try {
      const res = await privateApi.get(`/api/posts/${postId}/likes`);
      if (res.data.success) setCurrentLikers(res.data.likers);
    } catch {
      error('無法載入按讚名單');
      setShowLikersModal(false);
    } finally {
      setIsLoadingLikers(false);
    }
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
        isLoading={isLoadingLikers}
      />
    </div>
  );
}
