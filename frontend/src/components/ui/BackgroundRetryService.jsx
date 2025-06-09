// src/components/system/BackgroundRetryService.jsx
import { useEffect } from 'react';
import { retryExerciseQueue } from '@/services/exerciseQueue';
import { retryMessageQueue } from '@/services/messageQueue';

export default function BackgroundRetryService() {
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine) {
        retryExerciseQueue();
        retryMessageQueue();
      }
    }, 30000); // retry every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return null;
}
