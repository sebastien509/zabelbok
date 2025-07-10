// ✅ utils/offlineQueue.js
// Centralized offline queuing utility for all 4 modal forms

export const enqueueOffline = (key, payload) => {
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [...existing, payload];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.error(`[OfflineQueue] Failed to queue ${key}`, err);
    }
  };
  
  export const processQueueItem = async (key, fn) => {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const success = [];
    const failed = [];
  
    for (const item of existing) {
      try {
        await fn(item);
        success.push(item);
      } catch (e) {
        failed.push(item);
      }
    }
  
    localStorage.setItem(key, JSON.stringify(failed));
    return { success: success.length, failed: failed.length };
  };
  