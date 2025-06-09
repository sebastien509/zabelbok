import { useEffect } from 'react';
import { queueOfflineAction, syncOfflineActions } from '../../utils/UniversalOfflineQueue';

export default function OfflineMessageQueue() {
  useEffect(() => {
    const syncOnReconnect = () => {
      if (navigator.onLine) {
        syncOfflineActions();
      }
    };

    window.addEventListener('online', syncOnReconnect);
    return () => window.removeEventListener('online', syncOnReconnect);
  }, []);

  // Example usage (this would be called wherever a message is submitted)
  const queueMessage = (receiver_id, content) => {
    queueOfflineAction('message', { receiver_id, content });
  };

  return null;
}