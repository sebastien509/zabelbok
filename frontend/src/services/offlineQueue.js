// src/services/offlineQueue.js
import { toast } from '@/components/ui/use-toast';
import { api } from './api';

const QUEUE_KEY = 'offlineQueue';

export const offlineQueue = {
  // ------------------ CORE ------------------
  get: () => JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'),

  set: (queue) => localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)),

  add: (type, payload) => {
    const queue = offlineQueue.get();
    queue.push({ type, payload, created_at: new Date().toISOString() });
    offlineQueue.set(queue);
    toast({ title: `Queued (${type})`, description: 'Saved locally for sync.' });
  },

  clear: () => offlineQueue.set([]),

  count: () => offlineQueue.get().length,

  // ------------------ RETRY ------------------
  retry: async () => {
    const queue = offlineQueue.get();
    if (queue.length === 0 || !navigator.onLine) return;

    let synced = 0;

    for (const item of queue) {
      try {
        switch (item.type) {
          case 'message':
            await api.post('/offline/sync_messages', item.payload);
            break;
          case 'exercise_submission':
            await api.post('/offline/sync_exercises', item.payload);
            break;
          case 'book':
            await api.post('/books', item.payload);
            break;
          case 'lecture':
            await api.post('/lectures', item.payload);
            break;
          case 'exercise':
            await api.post('/exercises/full', item.payload);
            break;
          case 'quiz':
            await api.post('/quizzes', item.payload);
            break;
          // You can extend for more types like book_chapter, quiz_submission, etc.
          default:
            console.warn('Unknown offline type:', item.type);
        }
        synced++;
      } catch (err) {
        console.error('Retry failed for item:', item);
      }
    }

    offlineQueue.clear();

    if (synced > 0) {
      toast({ title: `Synced ${synced} item(s)`, description: 'Offline data successfully uploaded.' });
    }
  }
};

// Optional: Auto retry when connection comes back
window.addEventListener('online', () => {
  offlineQueue.retry();
});
