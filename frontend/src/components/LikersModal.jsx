export default function LikersModal({ isOpen, onClose, likers, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">按讚名單</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-2 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">載入中...</div>
          ) : likers.length > 0 ? (
            <ul className="space-y-1">
              {likers.map((liker) => (
                <li key={liker.id} className="p-3 hover:bg-slate-50 rounded-lg">
                  {liker.name || liker.username}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-500 py-8 text-sm">
              還沒有人按讚
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
