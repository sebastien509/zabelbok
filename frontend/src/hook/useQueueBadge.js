// src/hooks/useQueueBadge.js
import { useState, useEffect } from 'react';
import { offlineQueue } from '@/services/offlineQueue';

export const useQueueBadge = () => {
  const [queue, setQueue] = useState(offlineQueue.get());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const updateStatus = () => {
      setQueue(offlineQueue.get());
      setIsOffline(!navigator.onLine);
    };

    const interval = setInterval(updateStatus, 2000);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  // Group queue by type
  const grouped = queue.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  return { grouped, isOffline };
};
