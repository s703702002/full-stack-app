import { useState } from 'react';
import Avatar from './Avatar';

export default function PostCard({
  post,
  onSaveEdit,
  onDelete,
  onToggleLike,
  onShowLikers,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const handleSave = async () => {
    await onSaveEdit(post.id, editContent);
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col">
      <div className="flex items-center mb-2 space-x-2">
        <Avatar
          name={post.authorName}
          avatarUrl={post.authorAvatarUrl}
          className="w-10 h-10"
        />
        <span className="font-bold text-slate-700">{post.authorName}</span>
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
              onClick={handleSave}
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
              onClick={() => onToggleLike(post.id)}
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
              onClick={() => onShowLikers(post.id)}
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
            <button onClick={() => onDelete(post.id)}>刪除</button>
          </div>
        </div>
      )}
    </div>
  );
}
