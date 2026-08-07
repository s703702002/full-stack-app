import React from 'react';
import type { MediaDTO } from '@full-stack-app/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMediaMutation, mediaKeys } from '../queries/mediaQueries';
import { useToast } from '../hooks/useToast';

interface MediaLightboxModalProps {
  media: MediaDTO | null;
  isOwnProfile?: boolean;
  onClose: () => void;
}

export default function MediaLightboxModal({
  media,
  isOwnProfile,
  onClose,
}: Readonly<MediaLightboxModalProps>) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const deleteMutation = useMutation({
    ...deleteMediaMutation(),
    onSuccess: () => {
      success('媒體檔案已成功刪除');
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || '刪除失敗';
      error(msg);
    },
  });

  if (!media) return null;

  const isVideo = media.mediaType === 'VIDEO';

  const handleDelete = () => {
    if (window.confirm('確定要刪除這個媒體項目嗎？')) {
      deleteMutation.mutate(media.id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-white hover:text-black flex items-center justify-center transition-all shadow"
        >
          ✕
        </button>

        {/* Media Preview Section */}
        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-[450px]">
          {isVideo ? (
            <video
              src={media.url}
              controls
              autoPlay
              className="max-h-[80vh] w-full object-contain"
            />
          ) : (
            <img
              src={media.url}
              alt={media.title || '相簿內容'}
              className="max-h-[80vh] w-full object-contain"
            />
          )}
        </div>

        {/* Info Sidebar Section */}
        <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                {isVideo ? '🎥 影片' : '📷 照片'}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(media.createdAt).toLocaleDateString('zh-TW', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white leading-snug">
                {media.title || (isVideo ? '無標題影片' : '無標題照片')}
              </h2>
              {media.description && (
                <p className="mt-2 text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                  {media.description}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <a
              href={media.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              🔗 開啟原始檔
            </a>

            {isOwnProfile && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-950/60 text-red-400 hover:bg-red-900/80 hover:text-red-200 border border-red-800/40 transition-colors flex items-center gap-1"
              >
                {deleteMutation.isPending ? '刪除中...' : '🗑️ 刪除'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
