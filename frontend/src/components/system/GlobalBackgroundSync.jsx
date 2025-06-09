// ✅ src/system/GlobalBackgroundSync.jsx
import { useEffect } from 'react';
import { api } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export default function GlobalBackgroundSync() {
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!navigator.onLine) return;

      const syncQueue = async (queueKey, url, payloadKey = null) => {
        const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
        if (!queue.length) return;
      
        let synced = 0;
      
        for (const item of queue) {
          if (item.synced) continue;
      
          // ✅ Guard: must contain required fields
          if (
            queueKey === 'exerciseQueue' || queueKey === 'quizQueue'
          ) {
            if (!item.type || !item.id || !Array.isArray(item.answers)) {
              console.warn(`[GlobalSync] Skipping malformed item in ${queueKey}:`, item);
              continue;
            }
          }
      
          try {
            const payload = payloadKey ? { [payloadKey]: [item] } : item;
            await api.post(url, payload);
            item.synced = true;
            synced++;
          } catch (err) {
            console.warn(`❌ Failed to sync item in ${queueKey}`, item, err.message);
          }
        }
      
        localStorage.setItem(queueKey, JSON.stringify(queue));
        if (synced > 0) {
          toast({ title: `${synced} ${queueKey} item(s) synced ✅`, variant: 'success' });
        }
      };

await syncQueue('exerciseQueue', '/offline/sync', 'submissions');
await syncQueue('quizQueue', '/offline/sync', 'submissions');
await syncQueue('messageQueue', '/messages/sync', 'messages');


// 📥 Course Content Sync
try {
  const res = await api.get('/courses');
  for (const course of res.data) {
    const full = await api.get(`/courses/${course.id}`);
    localStorage.setItem(`offline_course_${course.id}`, JSON.stringify(full.data));
  }
  toast({ title: `✅ Courses synced for offline access`, variant: 'success' });
} catch (err) {
  console.warn("❌ Failed to sync courses", err.message);
}


      // ⚠️ Skip syncing `downloads` here — handled by DownloadManager logic or manually.
    }, 15000); // Every 15s

    return () => clearInterval(interval);
  }, []);

  return null; // Invisible component
}
