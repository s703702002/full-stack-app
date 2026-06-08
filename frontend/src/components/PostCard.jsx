import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { privateApi } from '../api';
import {
  updatePostMutation,
  deletePostMutation,
  toggleLikeMutation,
} from '../queries/postQueries';
import { formatDateTime } from '../utils/format';
import { useToast } from '../hooks/useToast';
import Avatar from './Avatar';
import LikersModal from './LikersModal';

export default function PostCard({ post, onEdit, onDelete, onToggleLike }) {
  const [showLikersModal, setShowLikersModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const { error } = useToast();

  const { mutate: editPost } = useMutation({
    ...updatePostMutation(),
    onSuccess: () => {
      setIsEditing(false);
      onEdit?.();
    },
    onError: () => error('編輯失敗'),
  });

  const { mutate: deletePost } = useMutation({
    ...deletePostMutation(),
    onSuccess: () => {
      onDelete?.();
    },
    onError: () => error('刪除失敗'),
  });

  const { mutate: toggleLike } = useMutation({
    ...toggleLikeMutation(),
    onSuccess: () => {
      onToggleLike?.();
    },
    onError: () => error('操作失敗'),
  });

  const {
    data: likersData,
    isLoading: likersLoading,
    refetch: fetchLikers,
  } = useQuery({
    queryKey: ['post-likers', post.id],
    queryFn: () =>
      privateApi
        .get(`/api/posts/${post.id}/likes`)
        .then((r) => r.data.data.likers),
    enabled: false,
  });

  const displayTime = formatDateTime(post.updatedAt || post.createdAt);
  const isEdited = post.updatedAt !== post.createdAt;

  const handleSaveEdit = () => {
    editPost({ id: post.id, content: editContent });
  };

  const handleDelete = () => {
    if (!globalThis.confirm('確定要刪除這篇留言嗎？')) return;
    deletePost(post.id);
  };

  const handlerShowLikers = () => {
    setShowLikersModal(true);
    fetchLikers();
  };

  return (
    <>
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col">
        <div className="flex items-center mb-3 space-x-3">
          <Link to={`/profile/${post.userId}`}>
            <Avatar
              name={post.authorName}
              avatarUrl={post.authorAvatarUrl}
              className="w-10 h-10"
            />
          </Link>
          <div className="flex flex-col">
            <span className="font-bold text-slate-700 leading-tight">
              {post.authorName}
            </span>
            <span className="text-xs text-slate-400 mt-0.5">
              {isEdited && <span>已編輯 • </span>}
              {displayTime}
            </span>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              className="w-full p-2 border border-blue-300 rounded-lg mb-2"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)}>取消</button>
              <button
                onClick={handleSaveEdit}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                儲存
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-600 whitespace-pre-wrap">{post.content}</p>
        )}

        {!isEditing && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleLike(post.id)}
                className={`transition-colors ${
                  post.isLikedByMe
                    ? 'text-pink-500 hover:text-pink-600'
                    : 'text-slate-400 hover:text-pink-500'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={post.isLikedByMe ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              <button
                onClick={handlerShowLikers}
                disabled={!post.likeCount}
                className={`text-sm font-medium ${
                  post.likeCount
                    ? 'text-slate-500 hover:text-slate-800 hover:underline cursor-pointer'
                    : 'text-slate-400 cursor-default'
                }`}
              >
                {post.likeCount || 0}
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(true)}>編輯</button>
              <button
                className="text-red-500"
                onClick={() => handleDelete(post.id)}
              >
                刪除
              </button>
            </div>
          </div>
        )}
      </div>

      <LikersModal
        isOpen={showLikersModal}
        onClose={() => setShowLikersModal(false)}
        likers={likersData ?? []}
        isLoading={likersLoading}
      />
    </>
  );
}
