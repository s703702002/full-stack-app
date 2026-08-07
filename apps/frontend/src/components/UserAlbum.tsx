import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserMedias } from '../queries/mediaQueries';
import type { MediaDTO, MediaType } from '@full-stack-app/shared';
import { cn } from '@full-stack-app/ui';
import UploadMediaModal from './UploadMediaModal';
import MediaLightboxModal from './MediaLightboxModal';

interface UserAlbumProps {
  userId: string;
  isOwnProfile?: boolean;
}

export default function UserAlbum({
  userId,
  isOwnProfile,
}: Readonly<UserAlbumProps>) {
  const [filterType, setFilterType] = useState<MediaType | undefined>(undefined);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaDTO | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(getUserMedias(userId, filterType));

  const mediaList = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType(undefined)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
              filterType === undefined
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            全部媒體
          </button>
          <button
            type="button"
            onClick={() => setFilterType('IMAGE')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
              filterType === 'IMAGE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            📷 照片
          </button>
          <button
            type="button"
            onClick={() => setFilterType('VIDEO')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
              filterType === 'VIDEO'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            🎥 影片
          </button>
        </div>

        {/* Action Button */}
        {isOwnProfile && (
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>✨</span>
            <span>新增照片/影片</span>
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={`skeleton-${idx * 2}`}
              className="aspect-square bg-slate-200 rounded-xl"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && mediaList.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
          <div className="text-5xl">🖼️</div>
          <h3 className="text-lg font-bold text-slate-700">目前尚無媒體項目</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            {isOwnProfile
              ? '點擊右上角「新增照片/影片」按鈕開始上傳你的第一張相片或精彩影片吧！'
              : '這個使用者尚未上傳任何相片或影片。'}
          </p>
        </div>
      )}

      {/* Media Grid */}
      {!isLoading && mediaList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {mediaList.map((media) => {
            const isVideo = media.mediaType === 'VIDEO';

            return (
              <div
                key={media.id}
                onClick={() => setSelectedMedia(media)}
                className="group relative aspect-square bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                {/* Media Image / Video Poster */}
                {isVideo ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 relative">
                    <video
                      src={media.url}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/50 text-white backdrop-blur-sm flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-indigo-600 transition-all shadow-lg">
                        ▶
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={media.url}
                    alt={media.title || '照片'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    loading="lazy"
                  />
                )}

                {/* Overlay gradient & title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 text-white">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-300 mb-0.5">
                    <span>{isVideo ? '🎥 影片' : '📷 照片'}</span>
                  </div>
                  <p className="font-semibold text-sm line-clamp-1">
                    {media.title || '無標題'}
                  </p>
                  {media.description && (
                    <p className="text-xs text-slate-300 line-clamp-1 opacity-90">
                      {media.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Infinite Scroll Next Page Button */}
      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-3 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-sm transition-all"
        >
          {isFetchingNextPage ? '載入中...' : '載入更多媒體'}
        </button>
      )}

      {/* Modals */}
      <UploadMediaModal
        userId={userId}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <MediaLightboxModal
        media={selectedMedia}
        isOwnProfile={isOwnProfile}
        onClose={() => setSelectedMedia(null)}
      />
    </div>
  );
}
