import { useEffect } from 'react';
export default function DevSyncNotifier() {
  useEffect(() => {
    window.addEventListener('offline', () => {
      console.log('[Dev] You are offline.');
      alert('🔴 You are offline. Some actions will be queued.');
    });
    window.addEventListener('online', () => {
      console.log('[Dev] Back online. Sync will start.');
      alert('🟢 Back online. Sync in progress.');
    });
  }, []);
  return null;
}