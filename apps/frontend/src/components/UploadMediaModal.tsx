import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadMediaMutation, mediaKeys } from '../queries/mediaQueries';
import { useToast } from '../hooks/useToast';
import { cn } from '@full-stack-app/ui';

interface UploadMediaModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadMediaModal({
  isOpen,
  onClose,
}: Readonly<UploadMediaModalProps>) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    ...uploadMediaMutation(),
    onSuccess: () => {
      success('上傳成功！');
      queryClient.invalidateQueries({
        queryKey: mediaKeys.all,
      });
      handleClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || '上傳失敗，請稍後再試';
      error(msg);
    },
  });

  if (!isOpen) return null;

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/');

    if (!isImage && !isVideo) {
      error('僅支援上傳圖片或影片檔案！');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      error('檔案大小不能超過 50MB！');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!file) {
      error('請先選擇照片或影片！');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (title.trim()) formData.append('title', title.trim());
    if (description.trim()) formData.append('description', description.trim());

    uploadMutation.mutate(formData);
  };

  const handleClose = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTitle('');
    setDescription('');
    onClose();
  };

  const isVideo = file?.type.startsWith('video/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="text-xl">✨</span> 新增至相簿
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Dropzone / Preview */}
          {!previewUrl ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3',
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50',
              )}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">
                📸
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  點擊選擇照片/影片，或拖拽檔案至此
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  支援 JPG, PNG, WEBP, MP4, WEBM (最大 50MB)
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) =>
                  handleFileChange(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-slate-900 group max-h-64 flex items-center justify-center">
              {isVideo ? (
                <video
                  src={previewUrl}
                  controls
                  className="max-h-64 w-full object-contain"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="預覽"
                  className="max-h-64 w-full object-contain"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
                className="absolute top-3 right-3 bg-slate-900/70 hover:bg-red-600 text-white p-1.5 rounded-full text-xs transition-colors backdrop-blur-sm shadow"
              >
                重新選擇 ✕
              </button>
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="media-title"
              className="block text-xs font-semibold text-slate-600 mb-1"
            >
              標題（選填）
            </label>
            <input
              id="media-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：夏天海邊旅行、狗狗生活紀錄"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 text-sm transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="media-description"
              className="block text-xs font-semibold text-slate-600 mb-1"
            >
              簡介/描述（選填）
            </label>
            <textarea
              id="media-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="寫點什麼紀錄這一刻..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 text-sm transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!file || uploadMutation.isPending}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  上傳中...
                </>
              ) : (
                '確認上傳'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
