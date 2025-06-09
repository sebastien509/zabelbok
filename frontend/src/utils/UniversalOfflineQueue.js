const STORAGE_KEY = 'offlineActions';

export const queueOfflineAction = (type, payload) => {
  const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  queue.push({ type, payload, timestamp: Date.now(), retries: 0 });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
};

export const syncOfflineActions = async () => {
  let queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const newQueue = [];

  for (const item of queue) {
    try {
      const response = await fetch(`/api/sync/${item.type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });
      if (!response.ok) throw new Error('Failed sync');
    } catch (err) {
      if (item.retries < 3) {
        item.retries += 1;
        newQueue.push(item);
      } else {
        console.error('Dropping failed sync after 3 attempts:', item);
      }
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
};