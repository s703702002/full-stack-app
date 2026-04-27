import { useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useToast } from './useToast';

export default function useNotificationListener() {
  const { user } = useAuth();
  const { notify } = useToast();

  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource(
      'http://localhost:3000/api/notifications/stream',
      {
        withCredentials: true,
      },
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('🔔 收到新通知：', data);

      if (data.type === 'NEW_LIKE') {
        notify(data.message);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE 連線發生錯誤', error);
    };

    return () => {
      eventSource.close();
    };
  }, [user, notify]);

  return null;
}
