// ✅ BackgroundSyncService.jsx (handles both exercises & messages with Sync Log Overlay)
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/services/api';

export default function BackgroundSyncService() {
  const [log, setLog] = useState(null);

  const sync = async () => {
    let syncedMessages = 0;
    let syncedExercises = 0;

    const messageQueue = JSON.parse(localStorage.getItem('messageQueue') || '[]');
    const exerciseQueue = JSON.parse(localStorage.getItem('exerciseQueue') || '[]');

    // Messages
    for (const m of messageQueue.filter(m => !m.synced)) {
      try {
        await api.post('/messages/sync', m);
        m.synced = true;
        syncedMessages++;
      } catch {}
    }

    // Exercises
    for (const e of exerciseQueue.filter(e => !e.synced)) {
      try {
        await api.post(`/exercises/${e.exercise_id}/submit`, { answer_text: e.answer_text });
        e.synced = true;
        syncedExercises++;
      } catch {}
    }

    localStorage.setItem('messageQueue', JSON.stringify(messageQueue));
    localStorage.setItem('exerciseQueue', JSON.stringify(exerciseQueue));

    if (syncedMessages || syncedExercises) {
      setLog(`✅ Synced ${syncedMessages} messages and ${syncedExercises} exercises.`);
      setTimeout(() => setLog(null), 4000);
    }
  };

  useEffect(() => {
    const interval = setInterval(sync, 15000); // Every 15s
    return () => clearInterval(interval);
  }, []);

  if (!log) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed bottom-4 right-4 bg-black text-white p-2 rounded shadow text-xs z-50">
      {log}
    </motion.div>
  );
}
