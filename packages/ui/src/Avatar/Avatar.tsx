import { cn } from '../utils';

export interface AvatarProps {
  avatarUrl?: string | null;
  name?: string;
  className?: string;
}

export function Avatar({
  avatarUrl,
  name = '?',
  className = 'w-20 h-20 sm:w-24 sm:h-24 text-3xl sm:text-4xl',
}: Readonly<AvatarProps>) {
  const baseClasses =
    'flex-shrink-0 rounded-full flex items-center justify-center bg-slate-100 shadow-inner border-2 border-slate-50 overflow-hidden';

  if (avatarUrl) {
    return (
      <div className={cn(baseClasses, className)}>
        <img
          src={avatarUrl}
          alt={`${name} 的大頭貼`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, className, 'text-slate-500 font-bold')}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
