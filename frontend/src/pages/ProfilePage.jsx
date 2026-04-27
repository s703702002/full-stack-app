import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { clearTokens } from '../config/localStorage';
import { useAuth } from '../context/useAuth';
import { getServerHost, privateApi } from '../api';
import { useToast } from '../hooks/useToast';
import useApiAction from '../hooks/useApiAction';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { error } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user.avatarUrl ? getServerHost() + user.avatarUrl : null,
  );
  const { execute, loading } = useApiAction((formData) =>
    privateApi.put('/api/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  );
  const { execute: logoutApi } = useApiAction(() =>
    privateApi.post('/api/auth/logout'),
  );

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('圖片大小不能超過 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append('name', editName);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const { success } = await execute(formData);
    if (success) setIsEditing(false);
  };

  const handleApiLogout = async () => {
    const { success } = await logoutApi();
    if (success) {
      clearTokens();
      navigate('/login');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4 sm:mt-12 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-100 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left relative">
        <div className="relative group">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-inner border-2 border-slate-50"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-3xl sm:text-4xl font-bold text-slate-500 shadow-inner border-2 border-slate-50">
              {user.name[0].toUpperCase()}
            </div>
          )}

          {/* 編輯模式下，顯示上傳按鈕的遮罩 */}
          {isEditing && (
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center cursor-pointer transition opacity-0 group-hover:opacity-100"
            >
              <span className="text-white text-xs font-medium">更換照片</span>
            </button>
          )}

          {/* 隱藏的檔案輸入框 */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
          />
        </div>

        {/* 🚀 個人資料區塊 */}
        <div className="flex-1 w-full min-w-0">
          <p className="text-xs sm:text-sm text-primary font-semibold tracking-wide">
            個人主頁
          </p>

          {isEditing ? (
            <div className="mt-2 mb-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full max-w-xs border border-slate-300 rounded-lg px-3 py-1.5 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="請輸入姓名"
              />
            </div>
          ) : (
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-950 mb-1.5 mt-0.5 break-words">
              歡迎回來，{user.name}！
            </h1>
          )}

          <p className="text-sm text-slate-500 flex flex-col sm:flex-row sm:items-center gap-1.5 justify-center sm:justify-start">
            <span>您的帳號是：</span>
            <span className="font-mono bg-slate-100 px-2.5 py-1 rounded-md text-xs text-slate-700 border border-slate-200 inline-block">
              {user.username}
            </span>
          </p>
        </div>

        {/* 🚀 操作按鈕區塊 */}
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          {isEditing ? (
            <div className="flex gap-2 w-full">
              <button
                onClick={() => {
                  setIsEditing(false);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                取消
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {loading ? '儲存中...' : '儲存'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              編輯個人資料
            </button>
          )}

          <Link
            to="2fa-setup"
            className="text-sm text-center text-primary hover:underline"
          >
            綁定 2FA
          </Link>

          {!isEditing && (
            <button
              onClick={handleApiLogout}
              className="w-full text-slate-500 hover:text-red-600 text-sm font-medium transition py-2 flex items-center justify-center gap-2"
            >
              登出系統
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
