import { useState, useRef } from 'react';
import { Avatar } from '../Avatar';
import { CameraCapture } from '../CameraCapture';
import type { UserDTO } from '@full-stack-app/shared';

export interface ProfileCardProps {
  user: UserDTO;
  isUpdating?: boolean;
  onSave: (formData: FormData) => Promise<any>;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function ProfileCard({
  user,
  isUpdating = false,
  onSave,
  onSuccess,
  onError,
}: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file?: File) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onError?.('圖片大小不能超過 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('bio', editBio);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      await onSave(formData);
      onSuccess?.('已儲存');
      setIsEditing(false);
    } catch (err: any) {
      onError?.(err.response?.data?.message || '儲存失敗');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(user.name);
    setEditBio(user.bio || '');
    setAvatarFile(null);
    setAvatarPreview(user.avatarUrl || null);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative">
        {/* 左側：大頭貼 */}
        <div className="relative group shrink-0">
          <Avatar
            avatarUrl={avatarPreview}
            name={user.name}
            className="w-24 h-24 text-4xl"
          />
          {isEditing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer transition opacity-0 group-hover:opacity-100"
            >
              <span className="text-white text-xs font-medium">更換照片</span>
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
          />
        </div>

        {/* 中間：個人資訊與自我介紹 */}
        <div className="flex-1 w-full min-w-0 mt-2 sm:mt-0">
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
            Profile
          </p>

          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full max-w-sm border-b-2 border-slate-300 px-0 py-1 text-2xl font-bold text-slate-900 focus:outline-none focus:border-slate-900 bg-transparent transition-colors"
                placeholder="請輸入姓名"
              />
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="寫些什麼來介紹自己吧..."
                maxLength={160}
                className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none min-h-[80px]"
              />
              <p className="text-xs text-slate-400 text-right max-w-md">
                {editBio.length} / 160
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 truncate">
                {user.name}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500 mb-4">
                <span>帳號：</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                  @{user.username}
                </span>
              </div>
              <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed max-w-lg">
                {user.bio || '這個人很懶，什麼都沒寫。'}
              </p>
            </>
          )}
        </div>

        {/* 右側：編輯按鈕 */}
        <div className="w-full sm:w-auto mt-4 sm:mt-0">
          {isEditing ? (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleCancel}
                className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg text-sm font-medium transition"
              >
                取消
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isUpdating}
                className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {isUpdating ? '儲存中...' : '儲存'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              編輯資料
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-700 mb-4 text-center sm:text-left">
            或是使用相機即時拍照：
          </p>
          <CameraCapture onCapture={handleFileChange} />
        </div>
      )}
    </div>
  );
}
