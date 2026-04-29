import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from './useToast';

export default function useApiAction(
  apiFunc,
  { successToast = true, errorToast = true, runOnMount = false } = {},
) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [data, setData] = useState(null);
  const { success, error } = useToast();

  const isMounted = useRef(true);

  // 保持 apiFunc 的最新狀態，避免引發 useCallback 的無限迴圈
  const apiRef = useRef(apiFunc);
  useEffect(() => {
    apiRef.current = apiFunc;
  }, [apiFunc]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      // 當元件卸載時，把標記設為 false
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setMessage('');

      try {
        const response = await apiRef.current(...args);

        if (!isMounted.current) return { success: true, data: response.data };

        setData(response.data);
        if (successToast) {
          success(response.data.message || '操作成功');
        }
        return { success: true, data: response.data };
      } catch (err) {
        if (!isMounted.current) return { success: false };

        const errorMessage =
          err.response?.data?.message || '連線錯誤，請稍後再試';
        setMessage(errorMessage);
        if (errorToast) {
          error(errorMessage);
        }
        return { success: false, error: errorMessage };
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [errorToast, successToast, success, error],
  );

  useEffect(() => {
    if (runOnMount) {
      execute();
    }
  }, [runOnMount, execute]);

  return { execute, loading, message, data, clearError: () => setMessage('') };
}
