import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postKeys, createPostMutation } from '../queries/postQueries';
import { useToast } from '../hooks/useToast';
import { cn } from '../utils/cn';
import Avatar from './Avatar';

export default function CreatePostBox({ currentUser, onPostCreated }) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const { error } = useToast();

  const { mutate: createPost, isPending } = useMutation({
    ...createPostMutation(),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({
        queryKey: postKeys.timeline(currentUser.id),
      });
      onPostCreated?.();
    },
    onError: (err) => error(err.response?.data?.message || '發佈失敗'),
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    createPost({ content, targetUserId: currentUser.id });
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-6">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Avatar
            name={currentUser?.name || 'User'}
            avatarUrl={currentUser?.avatarUrl}
            className="w-10 h-10"
          />
        </div>

        {/* 右側：輸入區與按鈕 */}
        <div className="flex-grow flex flex-col">
          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all resize-none min-h-[80px]"
            placeholder="在想些什麼呢？"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
          />

          {/* 按鈕區塊 */}
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isPending}
              className={cn(
                'px-5 py-1.5 rounded-full font-medium transition-all flex items-center justify-center min-w-[80px]',
                !content.trim() || isPending
                  ? 'bg-blue-300 text-white/80 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow'
              )}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  發佈中
                </span>
              ) : (
                '發佈'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
