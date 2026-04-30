import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { privateApi } from '../api';
import { useToast } from '../hooks/useToast';
import useApiAction from '../hooks/useApiAction';
import CameraCapture from '../components/CameraCapture';
import Avatar from '../components/Avatar';

export default function ProfilePage() {
  const { user } = useAuth();
  const { error } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user.avatarUrl ? user.avatarUrl : null,
  );
  const { execute, loading } = useApiAction((formData) =>
    privateApi.put('/api/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  );

  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
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

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 sm:mt-12 space-y-6">
      {/* 💳 第一區塊：個人名片 (Profile Card) */}
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
                onClick={() => fileInputRef.current.click()}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer transition opacity-0 group-hover:opacity-100"
              >
                <span className="text-white text-xs font-medium">更換照片</span>
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files[0])}
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
            />
          </div>

          {/* 中間：個人資訊 */}
          <div className="flex-1 w-full min-w-0 mt-2 sm:mt-0">
            <p className="text-xs font-bold text-primary tracking-wider uppercase mb-1">
              Profile
            </p>

            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full max-w-sm border-b-2 border-slate-300 px-0 py-1 text-2xl font-bold text-slate-900 focus:outline-none focus:border-primary bg-transparent transition-colors mb-2"
                placeholder="請輸入姓名"
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 truncate">
                {user.name}
              </h1>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500">
              <span>帳號：</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                @{user.username}
              </span>
            </div>
          </div>

          {/* 右側：編輯按鈕 */}
          <div className="w-full sm:w-auto mt-4 sm:mt-0">
            {isEditing ? (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg text-sm font-medium transition"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {loading ? '儲存中...' : '儲存'}
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

        {/* 📸 編輯模式下，把拍照元件展開在下方，才不會擠壓排版 */}
        {isEditing && (
          <div className="mt-8 pt-6 border-t border-slate-100 animate-fade-in">
            <p className="text-sm font-medium text-slate-700 mb-4 text-center sm:text-left">
              或是使用相機即時拍照：
            </p>
            <CameraCapture onCapture={handleFileChange} />
          </div>
        )}
      </div>

      {/* 🛡️ 第二區塊：帳號設定與安全 (Settings Card) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">帳號安全與設定</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {/* 2FA 設定列 */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-medium text-slate-900">
                雙重驗證 (2FA)
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                啟用 Authenticator 驗證碼，為您的帳號增加額外的安全保護層。
              </p>
            </div>
            <Link
              to="2fa-setup"
              className="shrink-0 text-center px-5 py-2 bg-slate-50 border border-slate-200 text-primary hover:bg-slate-100 font-medium rounded-lg transition"
            >
              設定 2FA
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
