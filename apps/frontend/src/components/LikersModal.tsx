import { createPortal } from 'react-dom';
import Avatar from './Avatar';
import { UserDTO } from '@full-stack-app/shared';

interface LikerListProps {
  likers: UserDTO[];
}

function LikerList({ likers }: LikerListProps) {
  if (!likers || likers.length === 0) {
    return (
      <p className="text-center text-slate-500 py-8 text-sm">還沒有人按讚</p>
    );
  }

  return (
    <ul className="space-y-1">
      {likers.map((liker) => (
        <li
          key={liker.id}
          className="p-3 hover:bg-slate-50 rounded-lg flex items-center gap-2"
        >
          <Avatar
            avatarUrl={liker.avatarUrl}
            name={liker.name}
            className="w-8 h-8"
          />
          {liker.name || liker.username}
        </li>
      ))}
    </ul>
  );
}

interface LikersModalProps {
  isOpen: boolean;
  onClose: () => void;
  likers: UserDTO[];
  isLoading: boolean;
}

export default function LikersModal({
  isOpen,
  onClose,
  likers,
  isLoading,
}: LikersModalProps) {
  if (!isOpen) return null;

  return createPortal(
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
          ) : (
            <LikerList likers={likers} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
