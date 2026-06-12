import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useToast = () => {
  const notify = useCallback(
    (message) =>
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
    (message, options) =>
      toast.error(message, { position: 'bottom-center', ...options }),
    [],
  );
  const success = useCallback(
    (message, options) =>
      toast.success(message, { position: 'bottom-center', ...options }),
    [],
  );

  return {
    notify,
    error,
    success,
  };
};
