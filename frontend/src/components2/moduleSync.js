// utils/moduleSync.js
import { api } from '@/services/api';

const COMPLETED_KEY = 'EstratejiCompletedUnsynced';

export const saveCompletedOffline = (id) => {
  const list = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]');
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(list));
  }
};

export const syncCompletedModules = async () => {
  if (!navigator.onLine) return;

  const list = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]');
  if (!list.length) return;

  const synced = [];
  for (const id of list) {
    try {
      await api.post(`/modules/${id}/progress`);
      synced.push(id);
    } catch (err) {
      console.warn(`[Sync] Failed for module ${id}`, err);
    }
  }

  // Remove successfully synced
  const remaining = list.filter(id => !synced.includes(id));
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(remaining));
};
