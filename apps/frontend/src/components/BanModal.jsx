import { createPortal } from 'react-dom';
import { useState } from 'react';

const DURATION_OPTIONS = [
  { label: '30 分鐘', value: 30 },
  { label: '1 小時', value: 60 },
  { label: '6 小時', value: 360 },
  { label: '24 小時', value: 1440 },
  { label: '永久', value: 0 },
];

export default function BanModal({ target, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(60);

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm({ reason: reason.trim(), durationMinutes: duration });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-1">停用帳號</h3>
        <p className="text-sm text-slate-500 mb-5">停用 @{target.username}</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            停用時長
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg p-2 text-sm"
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            原因
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="請填寫停用原因..."
            className="w-full border border-slate-300 rounded-lg p-2 text-sm h-24 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            確認停用
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
