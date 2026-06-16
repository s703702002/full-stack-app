import { useEffect } from 'react';
import { useAuthUser } from '../context/useAuth';
import { useToast } from './useToast';
import { getServerHost } from '../api';

export default function useNotificationListener() {
  const user = useAuthUser();
  const { notify } = useToast();

  useEffect(() => {
    const eventSource = new EventSource(
      `${getServerHost()}/api/notifications/stream`,
      {
        withCredentials: true,
      },
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('🔔 收到新通知：', data);

      if (data.type === 'NEW_LIKE' || data.type === 'RECEIVED_FRIEND_REQUEST') {
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
