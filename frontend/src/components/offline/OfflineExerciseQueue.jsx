import { useEffect } from 'react';

export default function OfflineExerciseQueue() {
  const syncQueue = () => {
    if (navigator.onLine) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-exercises');
      });
    }
  };

  useEffect(() => {
    window.addEventListener('online', syncQueue);
    return () => window.removeEventListener('online', syncQueue);
  }, []);

  return null;
}