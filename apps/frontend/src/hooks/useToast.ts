import { useCallback } from 'react';
import toast, { ToastOptions } from 'react-hot-toast';

export const useToast = () => {
  const notify = useCallback(
    (message: string) =>
      toast(message, {
        icon: '🔔',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      }),
    [],
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) =>
      toast.error(message, { position: 'bottom-center', ...options }),
    [],
  );
  const success = useCallback(
    (message: string, options?: ToastOptions) =>
      toast.success(message, { position: 'bottom-center', ...options }),
    [],
  );

  return {
    notify,
    error,
    success,
  };
};
